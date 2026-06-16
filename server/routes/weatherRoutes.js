const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

router.get('/current', protect, weatherController.getCurrentWeather);

module.exports = router;
