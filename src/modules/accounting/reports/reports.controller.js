import reportsService from './reports.service.js';

const getTrialBalance = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportsService.getTrialBalance(req.user.companyId, { startDate, endDate });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
}

export default {
    getTrialBalance
};
