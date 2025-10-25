const express = require('express');
const router = express.Router();
const RoundController = require('../controllers/RoundController');

router.post('/new-round', RoundController.createNewRound);
router.post('/close', RoundController.closeRound);
router.post('/store-results', RoundController.storeResults);

module.exports = router;
