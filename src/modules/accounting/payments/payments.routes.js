const express = require('express');
const router = express.Router();
const paymentsController = require('./payments.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', paymentsController.createPayment);
router.get('/', paymentsController.getPayments);

module.exports = router;
