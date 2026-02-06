# Mini ERP System

A Multi-Tenant Mini ERP with a strictly validated Accounting Module.

## 🚀 Features

### Core Platform
-   **Multi-Tenancy**: Strict data isolation per company.
-   **Module System**: Companies can have specific modules (e.g., Accounting) active or inactive.
-   **Security**: JWT Authentication + Module Access Middleware.

### Accounting Module
-   **Chart of Accounts**: Hierarchical support with standard types (Asset, Liability, Equity, Revenue, Expense).
-   **Journal Entries**: Double-entry bookkeeping with strict `Debit = Credit` validation.
-   **Automation**:
    -   **Invoices**: Auto-creates `AR` (Debit) and `Revenue` (Credit) entries.
    -   **Payments**: Auto-creates `Cash` (Debit) and `AR` (Credit) entries.
-   **Reporting**: Real-time Trial Balance (Database-optimized aggregation).
-   **Performance**: Optimized with database indexes on `companyId` and `createdAt` for Invoices, Payments, and Journal Entries.

## 🛠 Tech Stack
-   **Runtime**: Node.js (v18+)
-   **Framework**: Express.js (ES Modules)
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Deployment**: Vercel Serverless

## ⚙️ Setup

1.  **Clone** the repository.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:pass@host:port/db"
    JWT_SECRET="your_secret"
    CORS_ORIGIN="http://localhost:3000"
    ```
4.  **Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

-   **Health Check**: `GET /api/health`
-   **Auth**: `POST /api/auth/register-company`

## 📂 Project Structure
```
src/
├── app.js               # App entry point
├── server.js            # Server entry point
├── middlewares/         # Auth, Error, Module middlewares
├── modules/             # Doman logic
│   ├── accounting/      # Accounting sub-modules
│   ├── auth/            # Auth module
│   └── core/            # Core module logic
└── utils/               # Prisma client, helpers
```
