const express = require('express');
const { requireAuth } = require('../auth/auth.middleware');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(requireAuth);

router.get('/activity', dashboardController.getActivityFeed);
router.get('/digest', dashboardController.getAiDigest);
router.get('/insights', dashboardController.getInsights);
router.post('/ask', dashboardController.askAi);

module.exports = router;
