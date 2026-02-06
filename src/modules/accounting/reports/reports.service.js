import prisma from '../../../utils/prisma.js';

const getTrialBalance = async (companyId, { startDate, endDate } = {}) => {
    // 1. Fetch all accounts for the company to ensure we list even those with 0 balance
    const accounts = await prisma.account.findMany({
        where: { companyId },
        select: { id: true, code: true, name: true, type: true }
    });

    // 2. Build date filters for the Journal Entry
    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.date = { gte: new Date(startDate), lte: new Date(endDate) };
    } else if (startDate) {
        dateFilter.date = { gte: new Date(startDate) };
    } else if (endDate) {
        dateFilter.date = { lte: new Date(endDate) };
    }

    // 3. Aggregate totals natively in the database
    // Group by accountId and sum debit/credit
    const aggregations = await prisma.journalLine.groupBy({
        by: ['accountId'],
        _sum: {
            debit: true,
            credit: true
        },
        where: {
            journalEntry: {
                companyId: companyId,
                status: 'POSTED',
                ...dateFilter
            }
        }
    });

    // 4. Create a lookup map for the results (O(1) access)
    // accountsMap: { [accountId]: { debit: 100, credit: 50 } }
    const totalsMap = {};
    aggregations.forEach(agg => {
        totalsMap[agg.accountId] = {
            debit: Number(agg._sum.debit || 0),
            credit: Number(agg._sum.credit || 0)
        };
    });

    // 5. Merge totals into accounts list
    const report = accounts.map(acc => {
        const total = totalsMap[acc.id] || { debit: 0, credit: 0 };
        const net = total.debit - total.credit; 

        return {
            accountId: acc.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            debit: total.debit,
            credit: total.credit,
            net: net
        };
    }).sort((a, b) => a.code.localeCompare(b.code));

    return report;
}

export default {
    getTrialBalance
};
