import express from 'express';
import journalEntriesController from './journal-entries.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', journalEntriesController.createJournalEntry);

export default router;
