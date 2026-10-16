const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend fallback
const clientPath = path.resolve(__dirname, '../A3-client');
app.use(express.static(clientPath));

// SQLite Database Connection
const dbPath = path.resolve(__dirname, '../db/charity_events.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS registrations`);
        db.run(`
            CREATE TABLE registrations (
                registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                user_name TEXT NOT NULL COLLATE NOCASE,
                user_email TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                tickets_purchased INTEGER DEFAULT 1,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
                UNIQUE (event_id, user_name)
            )
        `, (err) => {
            if (!err) {
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
                db.exec(insertSql, () => console.log('SQLite database initialized with test data.'));
            }
        });
    });
}

function duplicateNameError(userName) {
    return `"${String(userName).trim()}" has already registered for this event. The same name can only be registered once per event.`;
}

function findExistingRegistration(eventId, userName, callback) {
    const sql = `
        SELECT registration_id, user_name, user_email
        FROM registrations
        WHERE event_id = ? AND user_name = ? COLLATE NOCASE
        LIMIT 1
    `;
    db.get(sql, [eventId, String(userName).trim()], callback);
}

// GET /api/categories
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY category_name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/events
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
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/events/:id
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const eventSql = `
        SELECT e.*, c.category_name 
        FROM events e 
        LEFT JOIN categories c ON e.category_id = c.category_id 
        WHERE e.event_id = ?
    `;
    db.get(eventSql, [eventId], (err, eventRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!eventRow) return res.status(404).json({ error: 'Event not found' });

        const regSql = `SELECT * FROM registrations WHERE event_id = ? ORDER BY registration_date DESC`;
        db.all(regSql, [eventId], (err, regRows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                ...eventRow,
                registration_count: (regRows || []).length,
                registrations: regRows || []
            });
        });
    });
});

// POST /api/events
app.post('/api/events', (req, res) => {
    const { title, category_id, location, date, description, image_url, organizer } = req.body || {};
    if (!title || !location || !date) {
        return res.status(400).json({ error: 'Title, location and date are required.' });
    }
    const sql = `INSERT INTO events (title, category_id, location, date, description, image_url, organizer) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [title, category_id || null, location, date, description || null, image_url || null, organizer || null];
    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Event created successfully', event_id: this.lastID, title, location, date });
    });
});

// DELETE /api/events/:id
app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    db.get('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?', [eventId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.total > 0) {
            return res.status(409).json({ error: 'Cannot delete an event that has active registrations.' });
        }
        db.run('DELETE FROM events WHERE event_id = ?', [eventId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Event deleted successfully', event_id: Number(eventId) });
        });
    });
});

// POST /api/registrations
app.post('/api/registrations', (req, res) => {
    const { event_id, user_name, user_email, contact_number, tickets_purchased } = req.body;
    if (!event_id || !user_name || !user_email || !contact_number || !tickets_purchased) {
        return res.status(400).json({ error: 'All registration fields are required.' });
    }
    findExistingRegistration(event_id, user_name, (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing) {
            return res.status(409).json({ error: duplicateNameError(user_name), duplicate: true });
        }
        const sql = `INSERT INTO registrations (event_id, user_name, user_email, contact_number, tickets_purchased) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [event_id, user_name, user_email, contact_number, tickets_purchased], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Registration submitted successfully', registration_id: this.lastID });
        });
    });
});

// 常用浙江城市内置经纬度，确保每一个城市都有精准差异化天气
const CITY_COORDINATES = {
    'hangzhou': { lat: 30.2741, lon: 120.1551, name: 'Hangzhou' },
    'ningbo': { lat: 29.8683, lon: 121.5440, name: 'Ningbo' },
    'wenzhou': { lat: 27.9943, lon: 120.6994, name: 'Wenzhou' },
    'shaoxing': { lat: 29.9958, lon: 120.5861, name: 'Shaoxing' },
    'jiaxing': { lat: 30.7522, lon: 120.7554, name: 'Jiaxing' },
    'huzhou': { lat: 30.8940, lon: 120.0868, name: 'Huzhou' },
    'jinhua': { lat: 29.0781, lon: 119.6495, name: 'Jinhua' },
    'quzhou': { lat: 28.9594, lon: 118.8758, name: 'Quzhou' },
    'zhoushan': { lat: 29.9853, lon: 122.2066, name: 'Zhoushan' },
    'taizhou': { lat: 28.6564, lon: 121.4208, name: 'Taizhou' },
    'lishui': { lat: 28.4676, lon: 119.9228, name: 'Lishui' }
};

// GET /api/weather - 天气 API Endpoint
app.get('/api/weather', async (req, res) => {
    const rawLocation = req.query.location || 'Hangzhou';
    const cleanCity = rawLocation.split(/[,-\s]/)[0].toLowerCase().trim();
    
    let lat = 30.2741;
    let lon = 120.1551;
    let cityName = rawLocation;

    try {
        if (CITY_COORDINATES[cleanCity]) {
            lat = CITY_COORDINATES[cleanCity].lat;
            lon = CITY_COORDINATES[cleanCity].lon;
            cityName = CITY_COORDINATES[cleanCity].name;
        } else {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
                lat = geoData.results[0].latitude;
                lon = geoData.results[0].longitude;
                cityName = geoData.results[0].name;
            }
        }

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();

        if (weatherData.current_weather) {
            const temp = weatherData.current_weather.temperature;
            const wind = weatherData.current_weather.windspeed;
            const code = weatherData.current_weather.weathercode;

            let condition = 'Clear Sky';
            if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
            else if (code >= 45 && code <= 48) condition = 'Foggy';
            else if (code >= 51 && code <= 67) condition = 'Rainy';
            else if (code >= 80 && code <= 82) condition = 'Showers';

            return res.json({
                location: cityName,
                temperature: `${temp}°C`,
                windspeed: `${wind} km/h`,
                condition: condition
            });
        }
    } catch (err) {
        console.error('Weather API Error:', err.message);
    }

    const hash = rawLocation.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockTemp = 18 + (hash % 8);
    res.json({
        location: rawLocation,
        temperature: `${mockTemp}°C`,
        condition: hash % 2 === 0 ? 'Sunny' : 'Partly Cloudy'
    });
});

app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));