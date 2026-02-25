import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import pinRoutes from './routes/pins.js';
import boardRoutes from './routes/boards.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pins', pinRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Glinterest API running on http://localhost:${PORT}`);
});
