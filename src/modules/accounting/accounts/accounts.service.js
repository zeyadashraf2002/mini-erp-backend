import prisma from '../../../utils/prisma.js';

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

const ensureSystemAccount = async (companyId, type, preferredCode, name) => {
  // 1. Try to find existing
  let account = await findSystemAccount(companyId, type, [preferredCode]);

  // 2. If not found, create it
  if (!account) {
    console.log(`[Auto-Provisioning] Creating missing system account: ${name} (${preferredCode})`);
    try {
      account = await prisma.account.create({
        data: {
          companyId,
          code: preferredCode,
          name: name,
          type: type,
          description: `System generated ${name} account`
        }
      });
    } catch (error) {
      // Handle race condition where account might have been created in parallel
      if (error.code === 'P2002') {
        account = await findSystemAccount(companyId, type, [preferredCode]);
      } else {
        throw error;
      }
    }
  }
  return account;
};

export default {
  createAccount,
  getCOA,
  findSystemAccount,
  ensureSystemAccount
};
