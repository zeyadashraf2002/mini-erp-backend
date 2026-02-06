const prisma = require('../../../utils/prisma');
// const accountingService = require('../journal-entries/journal-entries.service');

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

    // 2. Find necessary accounts (Accounts Receivable & Revenue)
    // Priority: 1) By specific name, 2) By code pattern, 3) By type
    const accounts = await tx.account.findMany({
      where: { companyId }
    });

    // Find Accounts Receivable (ذمم مدينة / Debtors)
    const arAccount = accounts.find(a => 
      a.name.toLowerCase().includes('receivable') || 
      a.name.toLowerCase().includes('ذمم') ||
      a.name.toLowerCase().includes('مدين') ||
      (a.code && a.code.startsWith('1') && a.code.includes('2')) // Common AR code pattern: 120x
    );

    // Find Revenue/Sales account
    const revenueAccount = accounts.find(a => 
      a.name.toLowerCase().includes('sales') || 
      a.name.toLowerCase().includes('revenue') ||
      a.name.toLowerCase().includes('مبيعات') ||
      a.name.toLowerCase().includes('إيراد') ||
      a.type === 'REVENUE'
    );

    if (!arAccount) {
      throw new Error('Accounts Receivable account not found. Please create an account with "Accounts Receivable" or "ذمم مدينة" in the name.');
    }

    if (!revenueAccount) {
      throw new Error('Revenue/Sales account not found. Please create a REVENUE type account.');
    }

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
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  createInvoice,
  getInvoices
};
