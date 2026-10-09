const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'charity_events.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS events');
    db.run('DROP TABLE IF EXISTS categories');

    // Create categories
    db.run(`
        CREATE TABLE categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL
        )
    `);

    // Create events
    db.run(`
        CREATE TABLE events (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category_id INTEGER,
            location TEXT NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            organizer TEXT,
            FOREIGN KEY (category_id) REFERENCES categories(category_id)
        )
    `);

    // Categories
    const stmtCategory = db.prepare('INSERT INTO categories (category_name) VALUES (?)');
    stmtCategory.run('Family Fun Run');
    stmtCategory.run('Community 10K');
    stmtCategory.run('Half Marathon');
    stmtCategory.run('Trail & Nature Run');
    stmtCategory.run('City Health Walk');
    stmtCategory.finalize();

    // Insert full event listings (Using Asian/Chinese runner imagery)
    const stmtEvent = db.prepare(`
        INSERT INTO events (title, category_id, location, date, description, image_url, organizer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmtEvent.run(
        'West Lake 5K Family Charity Run',
        1,
        'Hangzhou, West Lake Scenic Area',
        '2026-10-15',
        'A scenic 5K charity run along West Lake in Hangzhou, encouraging families and young runners to raise support for local community education.',
        'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80',
        'Hangzhou Sports & Health Foundation'
    );

    stmtEvent.run(
        'Ningbo Harbour Community 10K Challenge',
        2,
        'Ningbo, Beilun Port Park',
        '2026-10-22',
        'An energetic 10K coastal run promoting healthy urban living and supporting maritime community welfare programs across Ningbo.',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
        'Ningbo Athletic Association'
    );

    stmtEvent.run(
        'Shaoxing Ancient Towpath Half Marathon',
        3,
        'Shaoxing, Yuecheng District',
        '2026-11-05',
        'Run along historical canal stone paths in Shaoxing. Registration proceeds support ancient water town cultural heritage conservation.',
        'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
        'Shaoxing Heritage Charity Fund'
    );

    stmtEvent.run(
        'Moganshan Forest Trail Charity Run',
        4,
        'Huzhou, Deqing Moganshan',
        '2026-11-18',
        'An invigorating trail run amidst bamboo forests in Huzhou, boosting environmental conservation and rural medical relief.',
        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
        'Zhejiang Outdoor Sports Union'
    );

    stmtEvent.run(
        'Jiaxing South Lake Health Walk & Run',
        5,
        'Jiaxing, South Lake District',
        '2026-12-01',
        'A community health walk and run designed for residents of all ages to promote wellness and raise funds for elderly care services.',
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
        'Jiaxing Civic Welfare Council'
    );

    stmtEvent.run(
        'Wenzhou Oujiang Riverfront Night Run',
        2,
        'Wenzhou, Oujiang Park',
        '2026-12-12',
        'A vibrant waterfront night run along the Oujiang River, raising public awareness for urban youth mental health and wellness.',
        'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80',
        'Wenzhou Youth Development Charity'
    );

    stmtEvent.finalize();

    console.log('Database initialized with full event set and original Chinese runner images!');
});

db.close();