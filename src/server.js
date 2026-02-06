import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './utils/prisma.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

startServer();
