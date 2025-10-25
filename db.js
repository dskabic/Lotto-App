const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'loto',
    password: process.env.DB_PASSWORD || '12345',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: { rejectUnauthorized: false }
});
module.exports = pool;