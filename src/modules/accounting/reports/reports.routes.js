import express from 'express';
import reportsController from './reports.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/trial-balance', reportsController.getTrialBalance);

export default router;
