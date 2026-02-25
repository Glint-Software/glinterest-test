import { Router } from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get comments for a pin
router.get('/:pinId', (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.pin_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.pinId);

  res.json(comments);
});

// Add comment to a pin
router.post('/:pinId', authenticateToken, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const pin = db.prepare('SELECT id FROM pins WHERE id = ?').get(req.params.pinId);
  if (!pin) return res.status(404).json({ error: 'Pin not found' });

  const result = db.prepare(
    'INSERT INTO comments (user_id, pin_id, text) VALUES (?, ?, ?)'
  ).run(req.user.id, req.params.pinId, text.trim());

  const comment = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(comment);
});

// Delete comment
router.delete('/:id', authenticateToken, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Comment deleted' });
});

export default router;
