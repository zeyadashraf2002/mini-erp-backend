import express from 'express';
import invoicesController from './invoices.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', invoicesController.createInvoice);
router.get('/', invoicesController.getInvoices);

export default router;
