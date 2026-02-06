const prisma = require('../../../utils/prisma');

const getTrialBalance = async (companyId, { startDate, endDate } = {}) => {
    // Query-based calculation with date filters
    const whereClause = {};
    if (startDate && endDate) {
        whereClause.date = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    } else if (startDate) {
        whereClause.date = { gte: new Date(startDate) };
    } else if (endDate) {
        whereClause.date = { lte: new Date(endDate) };
    }

    // We fetch all accounts with their journal lines that match the date filter
    const accounts = await prisma.account.findMany({
        where: { companyId },
        include: {
            journalLines: {
                where: {
                    journalEntry: {
                        ...whereClause,
                        status: 'POSTED' // Only include posted entries
                    }
                }
            }
        }
    });

    const report = accounts.map(acc => {
        let totalDebit = 0;
        let totalCredit = 0;
        
        acc.journalLines.forEach(line => {
            totalDebit += Number(line.debit);
            totalCredit += Number(line.credit);
        });

        const net = totalDebit - totalCredit; 
        
        return {
            accountId: acc.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            debit: totalDebit,
            credit: totalCredit,
            net: net
        };
    }).sort((a, b) => a.code.localeCompare(b.code));

    return report;
}

module.exports = {
    getTrialBalance
};
