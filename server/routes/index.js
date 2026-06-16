const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const weatherRoutes = require('./weatherRoutes');
const taskRoutes = require('./taskRoutes');
const noteRoutes = require('./noteRoutes');
const settingsRoutes = require('./settingsRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);
router.use('/tasks', taskRoutes);
router.use('/notes', noteRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
