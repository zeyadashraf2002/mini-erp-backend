const journalEntriesService = require('./journal-entries.service');
const Joi = require('joi');

const validateDrCr = (lines) => {
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (const line of lines) {
        // Rule: debit OR credit per line (not both)
        // Ideally handled by UI sending type='DEBIT/CREDIT', but here we check values
        const d = Number(line.debit || 0);
        const c = Number(line.credit || 0);

        if (d > 0 && c > 0) {
            return { valid: false, message: 'Line cannot have both Debit and Credit amounts.' };
        }
        
        totalDebit += d;
        totalCredit += c;
    }
    
    // Check for floating point issues by rounding to 2 decimals
    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
        return { valid: false, message: `Journal entry must balance. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}` };
    }
    return { valid: true };
}

const createJournalEntry = async (req, res, next) => {
  try {
    const schema = Joi.object({
      date: Joi.date().iso().required(),
      description: Joi.string().required(),
      reference: Joi.string().optional().allow('').allow(null),
      lines: Joi.array().items(Joi.object({
        accountId: Joi.string().required(),
        debit: Joi.number().min(0).optional(),
        credit: Joi.number().min(0).optional(),
        description: Joi.string().optional().allow('').allow(null),
      })).min(2).required(), // Rule: At least 2 lines
    });

    const { error } = schema.validate(req.body);
    if (error) {
       const err = new Error(error.details[0].message);
       err.statusCode = 400;
       throw err;
    }

    // Strict Accounting Validation
    const customValidation = validateDrCr(req.body.lines);
    if (!customValidation.valid) {
        const err = new Error(customValidation.message);
        err.statusCode = 400;
        throw err;
    }

    const entry = await journalEntriesService.createJournalEntry(req.user.companyId, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJournalEntry,
};
