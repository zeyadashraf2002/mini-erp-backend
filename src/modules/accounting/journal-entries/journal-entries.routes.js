const express = require('express');
const router = express.Router();
const journalEntriesController = require('./journal-entries.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', journalEntriesController.createJournalEntry);

module.exports = router;
