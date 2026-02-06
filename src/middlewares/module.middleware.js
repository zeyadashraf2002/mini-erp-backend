import prisma from '../utils/prisma.js';

const moduleMiddleware = (moduleId) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.companyId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
      }

      const companyModule = await prisma.companyModule.findUnique({
        where: {
          companyId_moduleId: {
            companyId: req.user.companyId,
            moduleId: moduleId
          }
        }
      });

      if (!companyModule || companyModule.status !== 'ACTIVE') {
        const error = new Error(`Module '${moduleId}' is not active for this company`);
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default moduleMiddleware;
