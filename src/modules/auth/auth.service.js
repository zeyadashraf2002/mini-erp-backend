import prisma from '../../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerCompany = async ({ companyName, email, password, name }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Transaction to create Company and Admin User together
  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    // Initialize Default Modules (Accounting)
    // In a real app we might want to let them choose, but here we auto-activate
    const accountingModule = await tx.systemModule.upsert({
      where: { id: 'accounting' },
      update: {},
      create: { id: 'accounting', name: 'Accounting Module' },
    });

    await tx.companyModule.create({
      data: {
        companyId: company.id,
        moduleId: accountingModule.id,
        status: 'ACTIVE',
      },
    });
    
    // Initialize Default Setup for Accounting (e.g. basic COA)?
    // For now, leave empty, let them create.

    return { company, user };
  });

  const token = jwt.sign(
    { userId: result.user.id, companyId: result.company.id, role: result.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user: { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role, company: result.company } };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company } };
};

export default {
  registerCompany,
  login,
};
