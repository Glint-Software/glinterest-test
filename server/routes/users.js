import { Router } from 'express';
import db from '../db/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get user profile
router.get('/:id', optionalAuth, (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, display_name, avatar_url, bio, created_at
    FROM users WHERE id = ?
  `).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.pin_count = db.prepare('SELECT COUNT(*) as count FROM pins WHERE user_id = ?').get(user.id).count;
  user.board_count = db.prepare('SELECT COUNT(*) as count FROM boards WHERE user_id = ?').get(user.id).count;
  user.follower_count = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(user.id).count;
  user.following_count = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;

  if (req.user) {
    user.is_following = !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, user.id);
  }

  res.json(user);
});

// Get user's pins
router.get('/:id/pins', (req, res) => {
  const pins = db.prepare(`
    SELECT p.*, u.username, u.display_name, u.avatar_url,
           (SELECT COUNT(*) FROM likes WHERE pin_id = p.id) as like_count
    FROM pins p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.params.id);

  res.json(pins);
});

// Get user's boards
router.get('/:id/boards', optionalAuth, (req, res) => {
  const boards = db.prepare(`
    SELECT b.*,
           (SELECT COUNT(*) FROM pins WHERE board_id = b.id) as pin_count
    FROM boards b
    WHERE b.user_id = ? AND (b.is_private = 0 OR b.user_id = ?)
    ORDER BY b.created_at DESC
  `).all(req.params.id, req.user?.id || -1);

  res.json(boards);
});

// Follow/unfollow user
router.post('/:id/follow', authenticateToken, (req, res) => {
  const followingId = parseInt(req.params.id);
  if (followingId === req.user.id) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(followingId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, followingId);

  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, followingId);
    res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user.id, followingId);
    res.json({ following: true });
  }
});

export default router;
