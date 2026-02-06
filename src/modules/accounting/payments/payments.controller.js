import paymentsService from './payments.service.js';
import Joi from 'joi';

const createPayment = async (req, res, next) => {
  try {
    const schema = Joi.object({
      invoiceId: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      date: Joi.date().iso().required(),
      method: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
       const err = new Error(error.details[0].message);
       err.statusCode = 400;
       throw err;
    }

    const result = await paymentsService.createPayment(req.user.companyId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentsService.getPayments(req.user.companyId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  getPayments
};
