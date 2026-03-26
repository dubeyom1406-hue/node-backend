 // server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    connectTimeout: 15000, // 15 seconds timeout

    ssl: process.env.DB_HOST === 'localhost' ? null : {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('[DATABASE] Connected to MySQL successfully!');
        connection.release();
    } catch (err) {
        console.error('[DATABASE] MySQL Connection Failed:', err.message);
    }
})();

module.exports = pool;