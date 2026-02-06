import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, companyId, role }
    next();
  } catch (err) {
    const error = new Error('Invalid token');
    error.statusCode = 401;
    next(error);
  }
};

export default authMiddleware;
