// event_db.js
const mysql = require('mysql2');

// Create MySQL connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Successfully connected to MySQL database: charityevents_db');
        connection.release();
    }
});

module.exports = db;