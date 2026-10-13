const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the static frontend (A3-client) so that http://localhost:3000/ opens the web page
const clientPath = path.resolve(__dirname, '../A3-client');
app.use(express.static(clientPath));

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
                -- COLLATE NOCASE: "Zhang San", "zhang san" and "ZHANG SAN" are the same participant
                user_name TEXT NOT NULL COLLATE NOCASE,
                user_email TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                tickets_purchased INTEGER DEFAULT 1,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
                -- A3 rule: one participant name may only register once per event
                UNIQUE (event_id, user_name)
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

// ---------------------------------------------------------------------------
// Duplicate participant name helpers (A3 rule)
// The same participant name may only be registered once for the same event.
// ---------------------------------------------------------------------------

// Standard message returned whenever a duplicate participant name is submitted
function duplicateNameError(userName) {
    return `"${String(userName).trim()}" has already registered for this event. The same name can only be registered once per event.`;
}

// Look up an existing registration of the same name in the same event.
// The comparison ignores letter case, so "Zhang San" and "zhang san" are the same participant.
function findExistingRegistration(eventId, userName, callback) {
    const sql = `
        SELECT registration_id, user_name, user_email
        FROM registrations
        WHERE event_id = ? AND user_name = ? COLLATE NOCASE
        LIMIT 1
    `;
    db.get(sql, [eventId, String(userName).trim()], callback);
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
        SELECT e.*, c.category_name,
               (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count
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

            const registrations = regRows || [];

            res.json({
                ...eventRow,
                // Used by the UI to show the number of registrations and to allow / block deletion
                registration_count: registrations.length,
                registrations
            });
        });
    });
});

// POST /api/events - Create a new charity event (A3 New)
app.post('/api/events', (req, res) => {
    const { title, category_id, location, date, description, image_url, organizer } = req.body || {};

    // title, location and date are the required columns of the events table
    if (!title || !String(title).trim() || !location || !String(location).trim() || !date || !String(date).trim()) {
        return res.status(400).json({
            error: 'The fields title, location and date are required.'
        });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date).trim())) {
        return res.status(400).json({ error: 'The date must use the YYYY-MM-DD format.' });
    }

    if (category_id !== undefined && category_id !== null && category_id !== '' && !/^\d+$/.test(String(category_id))) {
        return res.status(400).json({ error: 'category_id must be a number.' });
    }

    const insertEvent = () => {
        const sql = `
            INSERT INTO events (title, category_id, location, date, description, image_url, organizer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            String(title).trim(),
            category_id ? Number(category_id) : null,
            String(location).trim(),
            String(date).trim(),
            description ? String(description).trim() : null,
            image_url ? String(image_url).trim() : null,
            organizer ? String(organizer).trim() : null
        ];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const createdId = this.lastID;

            db.get(
                `SELECT e.*, c.category_name
                 FROM events e
                 LEFT JOIN categories c ON e.category_id = c.category_id
                 WHERE e.event_id = ?`,
                [createdId],
                (selectErr, row) => {
                    if (selectErr) {
                        return res.status(500).json({ error: selectErr.message });
                    }

                    res.status(201).json({
                        message: 'Event created successfully',
                        registration_count: 0,
                        ...row
                    });
                }
            );
        });
    };

    // When a category is chosen it has to exist in the categories table
    if (category_id) {
        db.get('SELECT category_id FROM categories WHERE category_id = ?', [category_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(400).json({ error: `Unknown category_id: ${category_id}` });
            }
            insertEvent();
        });
        return;
    }

    insertEvent();
});

// DELETE /api/events/:id - Delete an event (A3 New)
// Rule: an event that already has registrations must NOT be deleted directly
app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;

    db.get('SELECT event_id, title FROM events WHERE event_id = ?', [eventId], (err, eventRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!eventRow) {
            return res.status(404).json({ error: 'Event not found' });
        }

        db.get('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?', [eventId], (countErr, countRow) => {
            if (countErr) {
                return res.status(500).json({ error: countErr.message });
            }

            const registrationCount = countRow ? countRow.total : 0;

            // Block the deletion while the event still has participants
            if (registrationCount > 0) {
                return res.status(409).json({
                    error: `"${eventRow.title}" cannot be deleted because it already has ${registrationCount} registration(s). Please remove those registrations first.`,
                    registration_count: registrationCount
                });
            }

            db.run('DELETE FROM events WHERE event_id = ?', [eventId], function (deleteErr) {
                if (deleteErr) {
                    return res.status(500).json({ error: deleteErr.message });
                }

                res.json({
                    message: `Event "${eventRow.title}" was deleted successfully.`,
                    event_id: Number(eventId)
                });
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

    // A3 rule: the same participant name may only be registered once for this event
    findExistingRegistration(event_id, user_name, (lookupErr, existingRegistration) => {
        if (lookupErr) {
            return res.status(500).json({ error: lookupErr.message });
        }

        if (existingRegistration) {
            return res.status(409).json({
                error: duplicateNameError(user_name),
                duplicate: true,
                registration_id: existingRegistration.registration_id
            });
        }

        const sql = `
            INSERT INTO registrations (event_id, user_name, user_email, contact_number, tickets_purchased, registration_date)
            VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `;
        const params = [
            event_id,
            String(user_name).trim(),
            String(user_email).trim(),
            String(contact_number).trim(),
            tickets_purchased
        ];

        db.run(sql, params, function (err) {
            if (err) {
                // Safety net: the UNIQUE (event_id, user_name) constraint also blocks duplicates
                if (err.code === 'SQLITE_CONSTRAINT' || /UNIQUE/i.test(err.message)) {
                    return res.status(409).json({
                        error: duplicateNameError(user_name),
                        duplicate: true
                    });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                message: 'Registration submitted successfully',
                registration_id: this.lastID
            });
        });
    });
});

// GET /api/registrations/check - Check whether a participant name is already used in an event
// Example: /api/registrations/check?event_id=1&user_name=Zhang%20San
app.get('/api/registrations/check', (req, res) => {
    const { event_id, user_name } = req.query;

    if (!event_id || !user_name) {
        return res.status(400).json({ error: 'Both event_id and user_name query parameters are required.' });
    }

    findExistingRegistration(event_id, user_name, (err, existingRegistration) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            event_id: Number(event_id),
            user_name: String(user_name).trim(),
            duplicate: Boolean(existingRegistration),
            registration_id: existingRegistration ? existingRegistration.registration_id : null
        });
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Zhejiang Hope Run API server running at http://localhost:${PORT}`);
});