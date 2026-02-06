const accountsService = require('./accounts.service');
const Joi = require('joi');

const createAccount = async (req, res, next) => {
  try {
    const schema = Joi.object({
      code: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE').required(),
      description: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
       const err = new Error(error.details[0].message);
       err.statusCode = 400;
       throw err;
    }

    const account = await accountsService.createAccount(req.user.companyId, req.body);
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

const getCOA = async (req, res, next) => {
  try {
    const accounts = await accountsService.getCOA(req.user.companyId);
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  getCOA,
};
