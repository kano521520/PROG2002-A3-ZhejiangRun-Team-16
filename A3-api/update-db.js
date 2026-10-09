const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 1. Define candidate paths for charity_events.db
const possibleDbPaths = [
    path.resolve(__dirname, '../db/charity_events.db'),
    path.resolve(__dirname, './charity_events.db'),
    path.resolve(__dirname, './db/charity_events.db'),
    path.resolve(__dirname, '../charity_events.db')
];

let targetDbPath = null;

// 2. Find the first existing database file path
for (const p of possibleDbPaths) {
    if (fs.existsSync(p)) {
        targetDbPath = p;
        break;
    }
}

if (!targetDbPath) {
    console.error('Error: Database file not found. Please verify the file path of charity_events.db.');
    process.exit(1);
}

console.log(`Database file located at: ${targetDbPath}`);

const db = new sqlite3.Database(targetDbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
});

// 3. Inspect database schema and execute update
db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
    if (err) {
        console.error('Failed to query database schema:', err.message);
        db.close();
        return;
    }

    const tableNames = tables.map(t => t.name);
    console.log('Tables found in database:', tableNames);

    // Resolve target table name automatically (supports events or event)
    let targetTable = null;
    if (tableNames.includes('events')) {
        targetTable = 'events';
    } else if (tableNames.includes('event')) {
        targetTable = 'event';
    }

    if (!targetTable) {
        console.error('Target table (events or event) not found in database.');
        db.close();
        return;
    }

    const oldUrlKeyword = 'photo-1530541930197';
    const newRunningUrl = 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80';

    const sql = `
        UPDATE ${targetTable} 
        SET image_url = ? 
        WHERE image_url LIKE ? OR image_url IS NULL
    `;

    db.run(sql, [newRunningUrl, `%${oldUrlKeyword}%`], function(err) {
        if (err) {
            console.error('Failed to update record:', err.message);
        } else {
            console.log(`Update successful! Modified ${this.changes} record(s) in table [${targetTable}].`);
        }
        db.close();
    });
});