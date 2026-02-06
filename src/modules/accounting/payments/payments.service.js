const prisma = require('../../../utils/prisma');
const accountsService = require('../accounts/accounts.service');

const createPayment = async (companyId, data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Invoice to validate and check balance
    const invoice = await tx.invoice.findUnique({
      where: { id: data.invoiceId, companyId },
      include: { payments: true }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // 2. Validate Payment Amount (Prevent Overpayment)
    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoiceAmount = Number(invoice.amount);
    const remainingBalance = invoiceAmount - totalPaid;

    if (Number(data.amount) > remainingBalance + 0.01) { // 0.01 buffer for floating point
        throw new Error(`Payment amount (${data.amount}) exceeds remaining invoice balance (${remainingBalance.toFixed(2)}).`);
    }

    // 3. Create Payment
    const payment = await tx.payment.create({
      data: {
        companyId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        date: new Date(data.date),
        method: data.method
      }
    });

    // 4. Find necessary accounts (Cash & Accounts Receivable)
    // Use Strict Lookup via helper
    const cashAccount = await accountsService.findSystemAccount(companyId, 'ASSET', ['101', '102']); 
    const arAccount = await accountsService.findSystemAccount(companyId, 'ASSET', ['120', '1200']);

    if (!cashAccount) {
        throw new Error('Cash account not found. Please create an Asset account with Code 101 or 102.');
    }

    if (!arAccount) {
        throw new Error('Accounts Receivable account not found. Please create an Asset account with Code 120.');
    }

    // 5. Create Journal Entry
    const journalEntry = await tx.journalEntry.create({
      data: {
        companyId,
        date: new Date(data.date),
        description: `Payment for Invoice #${invoice.invoiceNumber}`,
        reference: `PAY-${payment.id.substr(0, 8)}`,
        status: 'POSTED',
        journalLines: {
          create: [
            {
              accountId: cashAccount.id,
              debit: data.amount,
              credit: 0,
              description: 'Payment Received'
            },
            {
              accountId: arAccount.id, // Reduce AR
              debit: 0,
              credit: data.amount,
              description: 'AR Clearance'
            }
          ]
        },
        payment: {
            connect: { id: payment.id }
        }
      }
    });

    // 6. Update Invoice Status
    // 6. Update Invoice Status
    // Recalculate including the current payment
    const newTotalPaid = totalPaid + Number(data.amount);
    if (newTotalPaid >= Number(invoice.amount)) {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' }
      });
    } else if (invoice.status === 'DRAFT' || invoice.status === 'UNPAID') {
        // Optional: Set to PARTIALLY_PAID if we had that status, otherwise keep UNPAID or ensure it's not DRAFT
        if (invoice.status === 'DRAFT') {
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: 'UNPAID' }
            });
        }
    }

    return { payment, journalEntry };
  });
};

const getPayments = async (companyId) => {
  return await prisma.payment.findMany({
    where: { companyId },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  createPayment,
  getPayments
};
