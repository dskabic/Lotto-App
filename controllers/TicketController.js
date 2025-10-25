const Ticket = require('../models/Ticket');
const Round = require('../models/Round');
const QRCode = require('qrcode');

async function ticketForm(req, res) {
  try {
  const user = req.oidc.user;
  if (!user) {
    return res.status(401).render('error', {
      error: 'Unauthorized',
      isAuthenticated: req.oidc.isAuthenticated(),
      user: null
    });
  }
  const round = await Round.activeRound();
  if (!round || round.rows.length === 0) {
    return res.status(404).render('error', {
      error: 'No active round',
      isAuthenticated: req.oidc.isAuthenticated(),
      user
    });
  }
  return res.render('ticketInput', { title: 'Ticket Input', isAuthenticated: req.oidc.isAuthenticated(), user, oldData: {} });
  } catch (err) {
    console.error('ticketForm error:', err);
    return res.status(500).render('error', {
      title: 'Error',
      error: err.message,
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user ? req.oidc.user : null
    });
  }
}

async function storeTicket(req, res) {
  try {
    const activeQuery = await Round.activeRound();
    if (activeQuery.rows.length === 0) {
      throw new Error('No active round');
    }
    const roundId = activeQuery.rows[0].id;
    let { identificator, numbers } = req.body;
    if (!identificator || !numbers) {
      throw new Error('Missing identificator or numbers');
    }
    if (identificator.length < 1 || identificator.length > 20) {
      throw new Error('Invalid identificator length, must be 1-20 characters');
    }
    if (typeof numbers === 'string') {
      numbers = numbers
        .split(',')
        .map((n) => parseInt(String(n).trim(), 10))
        .filter((n) => !isNaN(n));
    }
    if (!Array.isArray(numbers)) {
      throw new Error('Invalid numbers format');
    }
    if (numbers.length < 6 || numbers.length > 10) {
      throw new Error('Invalid numbers length, must be 6-10 numbers');
    }
    const outOfRange = numbers.filter((n) => n < 1 || n > 45);
    if (outOfRange.length > 0) {
      throw new Error('Numbers must be between 1 and 45');
    }
    const user = req.oidc.user;
    if (!user) {
      throw new Error('Unauthorized');
    }
    console.log('user id:', user.sub);
    const insert = await Ticket.storeTicket(roundId, numbers, identificator, user.sub);
    
    const ticket = insert.rows[0];
    return res.redirect('/app/ticket/success/' + ticket.uuid);
  } catch (err) {
      res.status(400).render('ticketInput', {
      error: err.message,
      oldData: req.body,
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user
  });
  }
}

async function ticketSuccess(req, res) {
  try {
    const { id } = req.params;
    const user = req.oidc.user;
    if (!user) {
      return res.status(401).render('error', {
      error: 'Unauthorized',
      isAuthenticated: req.oidc.isAuthenticated(),
      user: null
    });
    }
    const result = await Ticket.successTicket(id, user.sub);
    if (result.rows.length === 0) {
      return res.status(404).render('error', {
      error: 'No ticket found',
      isAuthenticated: req.oidc.isAuthenticated(),
      user
    });
    }
    const ticket = result.rows[0];
    const ticketUrl = `${req.protocol}://${req.get('host')}/ticket/${ticket.uuid}`;
    let qrCodeData = null;
    try {
      qrCodeData = await QRCode.toDataURL(ticketUrl);
    } catch (e) {
      console.error('QR generation failed:', e.message);
    }
    return res.render('ticketSuccess', { ticket, qrCodeData, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}

async function ticketDetails(req, res) {
  try {
    const { id } = req.params;
    const user = req.oidc.user;
    if (!user) {
      return res.status(401).render('error', {
      error: 'Unauthorized',
      isAuthenticated: req.oidc.isAuthenticated(),
      user: null
    });
    }
    const result = await Ticket.ticketDetails(id, user.sub);
    if (result.rows.length === 0) {
      return res.status(404).render('error', {
      error: 'No ticket found',
      isAuthenticated: req.oidc.isAuthenticated(),
      user
    });
    }
    const ticket = result.rows[0];
    return res.render('ticketData', { ticket, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}

module.exports = {
  ticketForm,
  storeTicket,
  ticketSuccess,
  ticketDetails,
};
