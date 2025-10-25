const Round = require('../models/Round');

async function getHome(req, res) {
  try {
    const { rows } = await Round.getCurrentRound();
    const round = rows[0] || null
    const user = req.oidc.user;
    res.render('main', { title: 'Lotto App', round, user, isAuthenticated: req.oidc.isAuthenticated() })
  } catch (err) {
    console.error('Error rendering home:', err)
    res.status(500).send('Server error')
  }
}
async function createNewRound(req, res) {
  try {
    const activeQuery = await Round.activeRound()
    if (activeQuery.rows.length > 0) {
      return res.status(204).send('No Content') 
    }
    else {
      const insertQuery = await Round.createRound()
      res.json(insertQuery.rows[0])
    }
  }
  catch (err) {
    console.error('Error handling /new-round request:', err)
    res.status(500).send('Server error')
  }
}
async function closeRound(req, res) {
  try {
    const activeQuery = await Round.activeRound()
    if (activeQuery.rows.length === 0) {
      return res.status(204).send('No Content')
    }
    else {
      const roundId = activeQuery.rows[0].id
      const closeQuery = await Round.closeRound(roundId)
      res.json(closeQuery.rows[0])
    }
  }
  catch (err) {
    console.error('Error handling /close request:', err)
    res.status(500).send('Server error')
  }
}
async function storeResults(req, res) {
  try {
    let { numbers } = req.body;
    if (!numbers) {
      return res.status(400).send("Missing numbers");
    }
    if (typeof numbers === "string") {
      numbers = numbers.split(",").map((n) => parseInt(n.trim(), 10));
    }
    const round = await Round.findRound();
    if (round.rowCount === 0) {
      return res.status(400).send("No eligible round");
    }
    await Round.storeResults(round.rows[0].id, numbers);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
module.exports = {
  getHome,
  createNewRound,
  closeRound,
  storeResults
}