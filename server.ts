import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, 'data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database(path.join(dbDir, 'starcleaning.db'));

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    service_type TEXT, -- 'standard', 'deep', 'move-in-out'
    bedrooms INTEGER,
    bathrooms INTEGER,
    sqft INTEGER,
    frequency TEXT, -- 'one-time', 'weekly', 'bi-weekly', 'monthly'
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'scheduled', 'won', 'lost'
    estimated_price REAL,
    notes TEXT,
    source TEXT, -- 'website', 'referral', 'facebook'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    type TEXT, -- 'note', 'call', 'email', 'status_change'
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Middleware to log requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get all leads
  app.get('/api/leads', (req, res) => {
    console.log('GET /api/leads hit');
    try {
      const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
      const leads = stmt.all();
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Create lead
  app.post('/api/leads', (req, res) => {
    try {
      const { name, email, phone, address, city, service_type, bedrooms, bathrooms, sqft, frequency, notes, source } = req.body;
      const stmt = db.prepare(`
        INSERT INTO leads (name, email, phone, address, city, service_type, bedrooms, bathrooms, sqft, frequency, notes, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(name, email, phone, address, city, service_type, bedrooms, bathrooms, sqft, frequency, notes, source);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Update lead status
  app.patch('/api/leads/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      const stmt = db.prepare('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      stmt.run(status, id);
      
      // Log activity
      const activityStmt = db.prepare('INSERT INTO activities (lead_id, type, content) VALUES (?, ?, ?)');
      activityStmt.run(id, 'status_change', `Status updated to ${status}`);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Delete lead
  app.delete('/api/leads/:id', (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('DELETE FROM leads WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get lead details
  app.get('/api/leads/:id', (req, res) => {
    try {
      const { id } = req.params;
      const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
      const activities = db.prepare('SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC').all(id);
      
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      
      res.json({ ...lead, activities });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Smart Quote Estimate
  app.post('/api/estimate', (req, res) => {
    try {
      const { bedrooms, bathrooms, sqft, service_type } = req.body;
      
      // Base calculation logic
      let basePrice = 100; // Base fee
      basePrice += (bedrooms || 0) * 25;
      basePrice += (bathrooms || 0) * 35;
      basePrice += (sqft || 0) * 0.08;
      
      if (service_type === 'deep') basePrice *= 1.5;
      if (service_type === 'move-in-out') basePrice *= 2.0;
      
      // Round to nearest 5
      const estimate = Math.ceil(basePrice / 5) * 5;
      
      res.json({ estimate });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
