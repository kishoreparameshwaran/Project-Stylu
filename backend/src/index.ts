import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { initializeDatabase } from './config/database';
import { ensureSession } from './middleware/auth';

// Routes
import judgesRouter from './routes/judges';
import dresscodesRouter from './routes/dresscodes';
import settingsRouter from './routes/settings';
import wheelRouter from './routes/wheel';
import trialsRouter from './routes/trials';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Initialize database (async)
async function startServer() {
  await initializeDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API routes (all require session)
app.use('/api/judges', ensureSession, judgesRouter);
app.use('/api/dresscodes', ensureSession, dresscodesRouter);
app.use('/api/settings', ensureSession, settingsRouter);
app.use('/api/wheel', ensureSession, wheelRouter);
app.use('/api/week-plan', ensureSession, wheelRouter);
app.use('/api/trials', ensureSession, trialsRouter);

// Serve static uploads and frontend files
app.use('/uploads', express.static(uploadsDir));
const frontendDir = path.join(__dirname, '../../');
app.use('/assets', express.static(path.join(frontendDir, 'assets')));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎮 STYLU / OUTFIT COURT - BACKEND ONLINE 🎮       ║
║                                                       ║
║   Server:    http://localhost:${PORT}                   ║
║   Frontend:  http://localhost:${PORT}                   ║
║   Health:    http://localhost:${PORT}/health            ║
║                                                       ║
║   Mode:      ${process.env.MOCK_AI === 'true' ? 'MOCK AI' : 'LIVE AI'}                          ║
║   Database:  SQLite (data/stylu.db)                   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
