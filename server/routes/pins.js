import { Router } from 'express';
import db from '../db/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// List pins (paginated, with like/save counts)
router.get('/', optionalAuth, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const pins = db.prepare(`
    SELECT p.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count,
           (SELECT COUNT(*) FROM comments WHERE pin_id = p.id) as comment_count
    FROM pins p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  // Attach tags to each pin
  const tagStmt = db.prepare('SELECT tag FROM pin_tags WHERE pin_id = ?');
  for (const pin of pins) {
    pin.tags = tagStmt.all(pin.id).map(t => t.tag);
    if (req.user) {
      pin.liked = !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND pin_id = ?').get(req.user.id, pin.id);
      pin.saved = !!db.prepare('SELECT 1 FROM saves WHERE user_id = ? AND pin_id = ?').get(req.user.id, pin.id);
    }
  }

  const total = db.prepare('SELECT COUNT(*) as count FROM pins').get().count;
  res.json({ pins, total, page, pages: Math.ceil(total / limit) });
});

// Get single pin
router.get('/:id', optionalAuth, (req, res) => {
  const pin = db.prepare(`
    SELECT p.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count,
           (SELECT COUNT(*) FROM comments WHERE pin_id = p.id) as comment_count
    FROM pins p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!pin) return res.status(404).json({ error: 'Pin not found' });

  pin.tags = db.prepare('SELECT tag FROM pin_tags WHERE pin_id = ?').all(pin.id).map(t => t.tag);
  if (req.user) {
    pin.liked = !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND pin_id = ?').get(req.user.id, pin.id);
    pin.saved = !!db.prepare('SELECT 1 FROM saves WHERE user_id = ? AND pin_id = ?').get(req.user.id, pin.id);
  }

  res.json(pin);
});

// Create pin
router.post('/', authenticateToken, (req, res) => {
  const { title, description, image_url, source_url, board_id, tags } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image URL are required' });
  }

  const result = db.prepare(
    'INSERT INTO pins (user_id, board_id, title, description, image_url, source_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, board_id || null, title, description || '', image_url, source_url || '');

  if (tags && tags.length > 0) {
    const insertTag = db.prepare('INSERT OR IGNORE INTO pin_tags (pin_id, tag) VALUES (?, ?)');
    for (const tag of tags) {
      insertTag.run(result.lastInsertRowid, tag.toLowerCase().trim());
    }
  }

  const pin = db.prepare('SELECT * FROM pins WHERE id = ?').get(result.lastInsertRowid);
  pin.tags = tags || [];
  res.status(201).json(pin);
});

// Delete pin
router.delete('/:id', authenticateToken, (req, res) => {
  const pin = db.prepare('SELECT * FROM pins WHERE id = ?').get(req.params.id);
  if (!pin) return res.status(404).json({ error: 'Pin not found' });
  if (pin.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM pins WHERE id = ?').run(req.params.id);
  res.json({ message: 'Pin deleted' });
});

// Like/unlike pin
router.post('/:id/like', authenticateToken, (req, res) => {
  const pinId = req.params.id;
  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND pin_id = ?').get(req.user.id, pinId);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND pin_id = ?').run(req.user.id, pinId);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO likes (user_id, pin_id) VALUES (?, ?)').run(req.user.id, pinId);
    res.json({ liked: true });
  }
});

// Save pin to board
router.post('/:id/save', authenticateToken, (req, res) => {
  const { board_id } = req.body;
  if (!board_id) return res.status(400).json({ error: 'Board ID is required' });

  const pinId = req.params.id;
  const existing = db.prepare('SELECT 1 FROM saves WHERE user_id = ? AND pin_id = ? AND board_id = ?').get(req.user.id, pinId, board_id);

  if (existing) {
    db.prepare('DELETE FROM saves WHERE user_id = ? AND pin_id = ? AND board_id = ?').run(req.user.id, pinId, board_id);
    res.json({ saved: false });
  } else {
    db.prepare('INSERT INTO saves (user_id, pin_id, board_id) VALUES (?, ?, ?)').run(req.user.id, pinId, board_id);
    res.json({ saved: true });
  }
});

export default router;
