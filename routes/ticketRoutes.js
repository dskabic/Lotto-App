const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');

router.post('/store-ticket', TicketController.storeTicket);
router.get('/success/:id', TicketController.ticketSuccess);
router.get('/store', TicketController.ticketForm);
router.get('/:id', TicketController.ticketDetails);

module.exports = router;
