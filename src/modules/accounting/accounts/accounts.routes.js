const express = require('express');
const router = express.Router();
const accountsController = require('./accounts.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', accountsController.createAccount);
router.get('/', accountsController.getCOA);

module.exports = router;
