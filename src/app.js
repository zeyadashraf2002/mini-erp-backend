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
// Import Middlewares
import errorMiddleware from './middlewares/error.middleware.js';
import moduleMiddleware from './middlewares/module.middleware.js';
import authMiddleware from './middlewares/auth.middleware.js';

const app = express();

// ... (Global Middleware) ...
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.CORS_ORIGIN];
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.includes('localhost')) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => res.send('Mini ERP Backend is running!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/auth', authRoutes);

// Protected Routes (Require Auth + Module Check)
app.use('/api/accounting/accounts', authMiddleware, moduleMiddleware('accounting'), accountsRoutes);
app.use('/api/accounting/journals', authMiddleware, moduleMiddleware('accounting'), journalEntriesRoutes);
app.use('/api/accounting/reports', authMiddleware, moduleMiddleware('accounting'), reportsRoutes);

app.use('/api/invoices', authMiddleware, moduleMiddleware('accounting'), invoicesRoutes);
app.use('/api/payments', authMiddleware, moduleMiddleware('accounting'), paymentsRoutes);

// Error Handling
app.use(errorMiddleware);

export default app;
