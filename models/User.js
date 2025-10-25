const pool = require('../db');

module.exports = {
    findUser: async function(sub) {
        const result = await pool.query('SELECT * FROM users WHERE sub = $1', [sub]);
        return result;
    },
    createUser: async function(nickname, name, picture, updated_at, email, email_verified, sub) {
        const insertQuery = await pool.query(
        'INSERT INTO users (nickname, name, picture, updated_at, email, email_verified, sub) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [nickname, name, picture, updated_at, email, email_verified, sub]
    );
    return insertQuery.rows[0];
    }
}