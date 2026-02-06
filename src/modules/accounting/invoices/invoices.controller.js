import invoicesService from './invoices.service.js';
import Joi from 'joi';

const createInvoice = async (req, res, next) => {
  try {
    const schema = Joi.object({
      customerId: Joi.string().required(),
      customerName: Joi.string().required(),
      invoiceNumber: Joi.string().required(),
      date: Joi.date().iso().required(),
      dueDate: Joi.date().iso().optional(),
      amount: Joi.number().min(0).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
       const err = new Error(error.details[0].message);
       err.statusCode = 400;
       throw err;
    }

    const result = await invoicesService.createInvoice(req.user.companyId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await invoicesService.getInvoices(req.user.companyId);
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export default {
  createInvoice,
  getInvoices
};
