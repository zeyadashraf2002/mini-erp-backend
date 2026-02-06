const prisma = require('../../../utils/prisma');

const createAccount = async (companyId, data) => {
  return await prisma.account.create({
    data: {
      ...data,
      companyId,
    },
  });
};

const getCOA = async (companyId) => {
  return await prisma.account.findMany({
    where: { companyId },
    orderBy: { code: 'asc' },
  });
};

const findSystemAccount = async (companyId, type, preferredCodes = []) => {
  // 1. Try to find by specific codes first (Strict Mode)
  if (preferredCodes.length > 0) {
    const account = await prisma.account.findFirst({
      where: {
        companyId,
        code: { in: preferredCodes }
      }
    });
    if (account) return account;
  }

  // 2. Fallback to Type (Broad Mode)
  // We prefer the one with the smallest code (usually the main one)
  const account = await prisma.account.findFirst({
    where: {
      companyId,
      type
    },
    orderBy: { code: 'asc' }
  });

  return account;
};

module.exports = {
  createAccount,
  getCOA,
  findSystemAccount
};
