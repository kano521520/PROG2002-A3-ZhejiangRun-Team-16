const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbPath = path.resolve(__dirname, '../db/charity_events.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// GET /api/categories - Retrieve all categories for dynamic filter dropdown
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY category_name ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/events - Retrieve events with optional category_id and location query filtering
app.get('/api/events', (req, res) => {
    const { category_id, location } = req.query;
    let sql = `
        SELECT e.*, c.category_name 
        FROM events e 
        LEFT JOIN categories c ON e.category_id = c.category_id
        WHERE 1=1
    `;
    const params = [];

    if (category_id) {
        sql += ' AND e.category_id = ?';
        params.push(category_id);
    }

    if (location) {
        sql += ' AND e.location LIKE ?';
        params.push(`%${location}%`);
    }

    sql += ' ORDER BY e.date ASC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/events/:id - Retrieve single event detail
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = `
        SELECT e.*, c.category_name 
        FROM events e 
        LEFT JOIN categories c ON e.category_id = c.category_id 
        WHERE e.event_id = ?
    `;
    db.get(sql, [eventId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(row);
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Zhejiang Hope Run API server running at http://localhost:${PORT}`);
});