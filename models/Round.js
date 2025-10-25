const pool = require('../db');

module.exports = {
    getCurrentRound: async function() {
        const result = await pool.query(
            'SELECT r.*, (SELECT COUNT(*)::int FROM tickets t WHERE t.round_id = r.id) AS ticket_count FROM rounds r ORDER BY r.id DESC LIMIT 1'
        );
        return result;
    },
    activeRound: async function() {
        const activeQuery = await pool.query('SELECT * FROM rounds WHERE is_active = true');
        return activeQuery;
    },
    createRound: async function() {
        const insertQuery =  await pool.query('INSERT INTO rounds (is_active) VALUES (true) RETURNING *')
        return insertQuery;
    },
    closeRound: async function(roundId) {
        const closeQuery = await pool.query('UPDATE rounds SET is_active = false WHERE id = $1 RETURNING *', [roundId])
        return closeQuery;
    },
    storeResults: async function(roundId, numbers) {
        const result = await pool.query('UPDATE rounds SET drawn_numbers = $1 WHERE id = $2', [numbers, roundId]);
        return result;
    },
    findRound: async function() {
        const round = await pool.query('SELECT * FROM rounds WHERE is_active = false AND drawn_numbers IS NULL ORDER BY id DESC LIMIT 1');
        return round;
    }
};