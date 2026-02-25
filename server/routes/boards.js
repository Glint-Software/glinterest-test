import { Router } from 'express';
import db from '../db/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// List boards (optionally filtered by user)
router.get('/', optionalAuth, (req, res) => {
  const userId = req.query.user_id;

  let boards;
  if (userId) {
    boards = db.prepare(`
      SELECT b.*, u.username, u.display_name,
             (SELECT COUNT(*) FROM pins WHERE board_id = b.id) as pin_count
      FROM boards b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ? AND (b.is_private = 0 OR b.user_id = ?)
      ORDER BY b.created_at DESC
    `).all(userId, req.user?.id || -1);
  } else {
    boards = db.prepare(`
      SELECT b.*, u.username, u.display_name,
             (SELECT COUNT(*) FROM pins WHERE board_id = b.id) as pin_count
      FROM boards b
      JOIN users u ON b.user_id = u.id
      WHERE b.is_private = 0
      ORDER BY b.created_at DESC
    `).all();
  }

  res.json(boards);
});

// Get single board with its pins
router.get('/:id', optionalAuth, (req, res) => {
  const board = db.prepare(`
    SELECT b.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM pins WHERE board_id = b.id) as pin_count
    FROM boards b
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!board) return res.status(404).json({ error: 'Board not found' });
  if (board.is_private && board.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'This board is private' });
  }

  const pins = db.prepare(`
    SELECT p.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count
    FROM pins p
    JOIN users u ON p.user_id = u.id
    WHERE p.board_id = ?
    ORDER BY p.created_at DESC
  `).all(req.params.id);

  // Also include saved pins
  const savedPins = db.prepare(`
    SELECT p.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count
    FROM saves s
    JOIN pins p ON s.pin_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE s.board_id = ?
    ORDER BY s.created_at DESC
  `).all(req.params.id);

  board.pins = [...pins, ...savedPins];
  res.json(board);
});

// Create board
router.post('/', authenticateToken, (req, res) => {
  const { title, description, is_private, cover_image_url } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const result = db.prepare(
    'INSERT INTO boards (user_id, title, description, is_private, cover_image_url) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, title, description || '', is_private ? 1 : 0, cover_image_url || '');

  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(board);
});

// Update board
router.put('/:id', authenticateToken, (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });
  if (board.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const { title, description, is_private, cover_image_url } = req.body;
  db.prepare(
    'UPDATE boards SET title = ?, description = ?, is_private = ?, cover_image_url = ? WHERE id = ?'
  ).run(
    title || board.title,
    description ?? board.description,
    is_private !== undefined ? (is_private ? 1 : 0) : board.is_private,
    cover_image_url ?? board.cover_image_url,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete board
router.delete('/:id', authenticateToken, (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });
  if (board.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM boards WHERE id = ?').run(req.params.id);
  res.json({ message: 'Board deleted' });
});

export default router;
