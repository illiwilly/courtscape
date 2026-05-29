import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db/connection.js';
import searchRoutes from './routes/search.js';
import lawfirmsRoutes from './routes/lawfirms.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build (dist/)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Database connection initialization
let dbConnected = false;
(async () => {
  try {
    await db.connect();
    dbConnected = true;
    console.log('✓ Database connected');
  } catch (error) {
    console.error('⚠ Database connection failed:', error.message);
    console.error('  Server will continue but queries will fail');
    console.error('  Run: npm run test:db to verify connection');
  }
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// API Routes (Phase 3)
app.use('/api/search', searchRoutes);
app.use('/api/law-firms', lawfirmsRoutes);
app.use('/api/analytics', analyticsRoutes);

// SPA fallback - serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         Courtscape Server Started           ║
╚════════════════════════════════════════════╝

✓ Server running at http://localhost:${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ Database: ${dbConnected ? 'Connected' : 'Disconnected'}

📚 API Endpoints:
  GET  /api/health
  GET  /api/search/judges?q=Smith&limit=50&offset=0
  GET  /api/search/attorneys?q=John&firm=Smith%20LLC&limit=50&offset=0
  GET  /api/law-firms?limit=50&offset=0
  GET  /api/law-firms/:firm
  GET  /api/analytics/case-summary
  GET  /api/analytics/case-trends?dimension=court&limit=20

💡 Test with: curl http://localhost:${PORT}/api/health
  `);
});
