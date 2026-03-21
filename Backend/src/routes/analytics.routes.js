const express = require('express');
const router = express.Router();
const { processAudio, getAnalytics, getSchedules } = require('../controllers/audioProcessing.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes
router.post('/process-audio', protect, processAudio);
router.get('/', protect, getAnalytics);
router.get('/schedules', protect, getSchedules);

module.exports = router;
