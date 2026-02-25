import { Router } from 'express';
import db from '../db/index.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Search pins by title, description, or tags
router.get('/', optionalAuth, (req, res) => {
  const { q, tag, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (!q && !tag) {
    return res.status(400).json({ error: 'Search query (q) or tag is required' });
  }

  let pins, total;

  if (tag) {
    pins = db.prepare(`
      SELECT DISTINCT p.*, u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count
      FROM pins p
      JOIN users u ON p.user_id = u.id
      JOIN pin_tags pt ON pt.pin_id = p.id
      WHERE pt.tag = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(tag.toLowerCase(), parseInt(limit), offset);

    total = db.prepare(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM pins p
      JOIN pin_tags pt ON pt.pin_id = p.id
      WHERE pt.tag = ?
    `).get(tag.toLowerCase()).count;
  } else {
    const searchTerm = `%${q}%`;
    pins = db.prepare(`
      SELECT DISTINCT p.*, u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count
      FROM pins p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN pin_tags pt ON pt.pin_id = p.id
      WHERE p.title LIKE ? OR p.description LIKE ? OR pt.tag LIKE ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(searchTerm, searchTerm, searchTerm, parseInt(limit), offset);

    total = db.prepare(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM pins p
      LEFT JOIN pin_tags pt ON pt.pin_id = p.id
      WHERE p.title LIKE ? OR p.description LIKE ? OR pt.tag LIKE ?
    `).get(searchTerm, searchTerm, searchTerm).count;
  }

  // Attach tags
  const tagStmt = db.prepare('SELECT tag FROM pin_tags WHERE pin_id = ?');
  for (const pin of pins) {
    pin.tags = tagStmt.all(pin.id).map(t => t.tag);
  }

  res.json({
    pins,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

// Get popular tags
router.get('/tags', (req, res) => {
  const tags = db.prepare(`
    SELECT tag, COUNT(*) as count
    FROM pin_tags
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 20
  `).all();

  res.json(tags);
});

export default router;
