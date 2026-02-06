import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import Modules
import authRoutes from './modules/auth/auth.routes.js';
// const coreRoutes = require('./modules/core/core.routes');
import accountsRoutes from './modules/accounting/accounts/accounts.routes.js';
import journalEntriesRoutes from './modules/accounting/journal-entries/journal-entries.routes.js';
import reportsRoutes from './modules/accounting/reports/reports.routes.js';
import invoicesRoutes from './modules/accounting/invoices/invoices.routes.js';
import paymentsRoutes from './modules/accounting/payments/payments.routes.js';

// Import Middlewares
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all or specific origin
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => res.send('Mini ERP Backend is running!'));
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

export default app;
