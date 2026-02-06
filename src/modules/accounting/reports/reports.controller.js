const reportsService = require('./reports.service');

const getTrialBalance = async (req, res, next) => {
    try {
        const report = await reportsService.getTrialBalance(req.user.companyId);
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTrialBalance
};
