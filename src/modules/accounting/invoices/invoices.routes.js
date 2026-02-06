const express = require('express');
const router = express.Router();
const invoicesController = require('./invoices.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', invoicesController.createInvoice);
router.get('/', invoicesController.getInvoices);

module.exports = router;
