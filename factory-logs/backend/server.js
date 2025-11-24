const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Database connection
const dbPath = path.join(__dirname, '..', 'database', 'factory-logs.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// API Routes

// Get all events with optional filtering
app.get('/api/events', (req, res) => {
  try {
    const { type, severity, status, search, startDate, endDate, sortBy = 'created_at', order = 'DESC' } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSort = ['created_at', 'updated_at', 'severity', 'type', 'status'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const stmt = db.prepare(query);
    const events = stmt.all(...params);

    res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Get single event by ID
app.get('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const event = stmt.get(id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
});

// Create new event
app.post('/api/events', (req, res) => {
  try {
    const { type, title, description, severity, location, reporter } = req.body;

    // Validation
    if (!type || !title || !description || !severity || !location || !reporter) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const validTypes = ['incident', 'maintenance', 'safety'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid event type' });
    }

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, error: 'Invalid severity level' });
    }

    const stmt = db.prepare(`
      INSERT INTO events (type, title, description, severity, location, reporter)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(type, title, description, severity, location, reporter);

    res.status(201).json({
      success: true,
      data: { id: result.lastInsertRowid },
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    // Check if event exists
    const checkStmt = db.prepare('SELECT id FROM events WHERE id = ?');
    const exists = checkStmt.get(id);

    if (!exists) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const stmt = db.prepare(`
      UPDATE events
      SET status = COALESCE(?, status),
          resolution = COALESCE(?, resolution),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, resolution, id);

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

// Get dashboard statistics
app.get('/api/stats', (req, res) => {
  try {
    // Total events by type
    const typeStats = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM events
      GROUP BY type
    `).all();

    // Events by severity
    const severityStats = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM events
      GROUP BY severity
    `).all();

    // Events by status
    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM events
      GROUP BY status
    `).all();

    // Recent events count (last 7 days)
    const recentCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE created_at >= datetime('now', '-7 days')
    `).get();

    // Open critical events
    const criticalOpen = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE severity = 'critical' AND status IN ('open', 'in_progress')
    `).get();

    res.json({
      success: true,
      data: {
        byType: typeStats,
        bySeverity: severityStats,
        byStatus: statusStats,
        recentCount: recentCount.count,
        criticalOpen: criticalOpen.count
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Factory Event Log System running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\nDatabase connection closed. Server shutting down.');
  process.exit(0);
});
