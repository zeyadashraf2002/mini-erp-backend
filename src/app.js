const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import Modules
const authRoutes = require('./modules/auth/auth.routes');
// const coreRoutes = require('./modules/core/core.routes');
const accountsRoutes = require('./modules/accounting/accounts/accounts.routes');
const journalEntriesRoutes = require('./modules/accounting/journal-entries/journal-entries.routes');
const reportsRoutes = require('./modules/accounting/reports/reports.routes');
const invoicesRoutes = require('./modules/accounting/invoices/invoices.routes');
const paymentsRoutes = require('./modules/accounting/payments/payments.routes');

// Import Middlewares
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
// app.use('/api/core', coreRoutes);

// Accounting Sub-modules
app.use('/api/accounting/accounts', accountsRoutes);
app.use('/api/accounting/journals', journalEntriesRoutes);
app.use('/api/accounting/reports', reportsRoutes);

// Invoices & Payments (kept at root API level for backward compat, or could move to /api/accounting/invoices)
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
