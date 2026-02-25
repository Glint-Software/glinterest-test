import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { username, email, password, display_name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
  ).run(username, email, password_hash, display_name || username);

  const user = db.prepare('SELECT id, username, email, display_name, avatar_url, bio FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(user);

  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password_hash, ...safeUser } = user;
  const token = generateToken(safeUser);

  res.json({ user: safeUser, token });
});

export default router;
