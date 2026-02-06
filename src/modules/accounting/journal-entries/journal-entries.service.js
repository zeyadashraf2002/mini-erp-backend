const prisma = require('../../../utils/prisma');

const createJournalEntry = async (companyId, { date, description, reference, lines }) => {
  // Strict Validation Rules
  if (!lines || lines.length < 2) {
    throw new Error('A Journal Entry must have at least 2 lines.');
  }

  let totalDebit = 0;
  let totalCredit = 0;
  const accountIds = new Set();

  lines.forEach((line, index) => {
    // Prevent same account usage
    if (accountIds.has(line.accountId)) {
      throw new Error(`Duplicate account in line ${index + 1}. Each account can only appear once per entry.`);
    }
    accountIds.add(line.accountId);

    const d = Number(line.debit || 0);
    const c = Number(line.credit || 0);

    // Prevent mixed debit/credit on same line (though functionally possible, it's bad practice for manual entry UI)
    if (d > 0 && c > 0) {
      throw new Error(`Line ${index + 1} cannot have both Debit and Credit values.`);
    }

    totalDebit += d;
    totalCredit += c;
  });

  // Floating point safety check
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal Entry is unbalanced. Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`);
  }

  return await prisma.$transaction(async (tx) => {
    // Database creation
    const entry = await tx.journalEntry.create({
      data: {
        companyId,
        date: new Date(date),
        description,
        reference,
        status: 'POSTED',
        journalLines: {
          create: lines.map(line => ({
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description
          }))
        }
      },
      include: { journalLines: true }
    });
    
    return entry;
  });
};

module.exports = {
  createJournalEntry,
};
