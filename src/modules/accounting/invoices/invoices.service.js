import prisma from '../../../utils/prisma.js';
import accountsService from '../accounts/accounts.service.js';
// import accountingService from '../journal-entries/journal-entries.service.js';

const createInvoice = async (companyId, data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create Invoice
    const invoice = await tx.invoice.create({
      data: {
        companyId,
        customerId: data.customerId,
        customerName: data.customerName,
        invoiceNumber: data.invoiceNumber,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        amount: data.amount,
        status: 'UNPAID'
      }
    });

    // 2. Find or Create necessary accounts (Accounts Receivable & Revenue)
    // Auto-provisioning
    const arAccount = await accountsService.ensureSystemAccount(companyId, 'ASSET', '120', 'Accounts Receivable');
    const revenueAccount = await accountsService.ensureSystemAccount(companyId, 'REVENUE', '401', 'Sales');

    // 3. Create Journal Entry
    const journalEntry = await tx.journalEntry.create({
      data: {
        companyId,
        date: new Date(data.date),
        description: `Invoice #${data.invoiceNumber} - ${data.customerName}`,
        reference: invoice.invoiceNumber,
        status: 'POSTED', // Auto-posted
        journalLines: {
          create: [
            {
              accountId: arAccount.id,
              debit: data.amount,
              credit: 0,
              description: 'Invoice Generation'
            },
            {
              accountId: revenueAccount.id,
              debit: 0,
              credit: data.amount,
              description: 'Revenue Recognition'
            }
          ]
        },
        // Link to Invoice
        invoice: {
            connect: { id: invoice.id }
        }
      }
    });

    return { invoice, journalEntry };
  });
};

const getInvoices = async (companyId) => {
  return await prisma.invoice.findMany({
    where: { companyId },
    include: { payments: true },
    orderBy: { createdAt: 'desc' }
  });
};

export default {
  createInvoice,
  getInvoices
};
