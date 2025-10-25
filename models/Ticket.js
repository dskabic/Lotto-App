const pool = require('../db');

module.exports =  {
    storeTicket: async function(roundId, numbers, identificator, userSub) {
        const userQuery = await pool.query('SELECT id FROM users WHERE sub = $1', [userSub]);
    if (userQuery.rows.length === 0) {
      throw new Error('User not found');
    }
    const userId = userQuery.rows[0].id;
    const insertQuery = await pool.query(
      'INSERT INTO tickets (round_id, identification_number, numbers, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [roundId, identificator, numbers, userId]
    );
    return insertQuery;
    },
    successTicket: async function(id, userSub) {
        const result = await pool.query('SELECT * FROM tickets WHERE uuid = $1 AND user_id = (SELECT id FROM users WHERE sub = $2)', [id, userSub]);
        return result;
    },
    ticketDetails: async function(id, userSub) {
        const result = await pool.query('SELECT t.*, r.drawn_numbers FROM tickets t JOIN rounds r ON t.round_id = r.id WHERE t.uuid = $1 AND t.user_id = (SELECT id FROM users WHERE sub = $2)', [id, userSub]);
        return result;
    }
};