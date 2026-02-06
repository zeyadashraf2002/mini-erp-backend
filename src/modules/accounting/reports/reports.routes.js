const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/trial-balance', reportsController.getTrialBalance);

module.exports = router;
