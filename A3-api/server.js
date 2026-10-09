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
        initDatabase(); // 启动时自动重置并初始化 SQLite 数据表和测试数据
    }
});

// Auto-initialize SQLite registrations table & initial test data
function initDatabase() {
    db.serialize(() => {
        // 1. 先强行删除可能存在的旧结构表，确保字段更新
        db.run(`DROP TABLE IF EXISTS registrations`);

        // 2. 重新创建包含全部字段的 registrations 表
        db.run(`
            CREATE TABLE registrations (
                registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                user_name TEXT NOT NULL,
                user_email TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                tickets_purchased INTEGER DEFAULT 1,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating registrations table:', err.message);
            } else {
                // 3. 插入 10 条测试数据
                const insertSql = `
                    INSERT INTO registrations (event_id, user_name, user_email, contact_number, tickets_purchased, registration_date) VALUES
                    (1, 'Zhang San', 'zhangsan@example.com', '0412345678', 2, '2026-10-01 10:00:00'),
                    (1, 'Li Si', 'lisi@example.com', '0423456789', 1, '2026-10-02 11:30:00'),
                    (1, 'Wang Wu', 'wangwu@example.com', '0434567890', 4, '2026-10-03 14:15:00'),
                    (2, 'Zhao Liu', 'zhaoliu@example.com', '0445678901', 2, '2026-10-04 09:20:00'),
                    (2, 'Sun Qi', 'sunqi@example.com', '0456789012', 1, '2026-10-05 16:45:00'),
                    (2, 'Zhou Ba', 'zhouba@example.com', '0467890123', 3, '2026-10-06 08:50:00'),
                    (3, 'Wu Jiu', 'wujiu@example.com', '0478901234', 2, '2026-10-07 13:10:00'),
                    (3, 'Zheng Shi', 'zhengshi@example.com', '0489012345', 5, '2026-10-08 17:00:00'),
                    (3, 'Alice Smith', 'alice@example.com', '0490123456', 1, '2026-10-09 10:30:00'),
                    (3, 'Bob Johnson', 'bob@example.com', '0401234567', 2, '2026-10-09 12:00:00');
                `;
                db.exec(insertSql, (insertErr) => {
                    if (!insertErr) {
                        console.log('SQLite registrations table rebuilt with test data successfully.');
                    }
                });
            }
        });
    });
}

// GET /api/categories - Retrieve all categories
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

// GET /api/events/:id - Retrieve single event detail with associated registrations (A3 Updated)
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const eventSql = `
        SELECT e.*, c.category_name 
        FROM events e 
        LEFT JOIN categories c ON e.category_id = c.category_id 
        WHERE e.event_id = ?
    `;

    db.get(eventSql, [eventId], (err, eventRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!eventRow) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const regSql = `
            SELECT * 
            FROM registrations 
            WHERE event_id = ? 
            ORDER BY registration_date DESC
        `;

        db.all(regSql, [eventId], (err, regRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                ...eventRow,
                registrations: regRows || []
            });
        });
    });
});

// POST /api/registrations - Submit a new registration for an event (A3 New)
app.post('/api/registrations', (req, res) => {
    const { event_id, user_name, user_email, contact_number, tickets_purchased } = req.body;

    if (!event_id || !user_name || !user_email || !contact_number || !tickets_purchased) {
        return res.status(400).json({ 
            error: 'All fields (event_id, user_name, user_email, contact_number, tickets_purchased) are required.' 
        });
    }

    const sql = `
        INSERT INTO registrations (event_id, user_name, user_email, contact_number, tickets_purchased, registration_date)
        VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `;
    const params = [event_id, user_name, user_email, contact_number, tickets_purchased];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Registration submitted successfully',
            registration_id: this.lastID
        });
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Zhejiang Hope Run API server running at http://localhost:${PORT}`);
});