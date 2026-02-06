import express from 'express';
import paymentsController from './payments.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', paymentsController.createPayment);
router.get('/', paymentsController.getPayments);

export default router;
