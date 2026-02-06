import express from 'express';
import accountsController from './accounts.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', accountsController.createAccount);
router.get('/', accountsController.getCOA);

export default router;
