const prisma = require('../config/prisma');

const getMonthlySummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const transactions = await prisma.transaction.groupBy({
            by: ['type'],
            where: {
                userId: req.user.id,
                date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
        });

        const summary = {
            totalIncome: 0,
            totalExpense: 0,
            netSavings: 0,
        };

        transactions.forEach((t) => {
            if (t.type === 'INCOME') summary.totalIncome = t._sum.amount || 0;
            if (t.type === 'EXPENSE') summary.totalExpense = t._sum.amount || 0;
        });

        summary.netSavings = summary.totalIncome - summary.totalExpense;

        res.json(summary);
    } catch (error) {
        next(error);
    }
};

const getCategoryAggregation = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const aggregation = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId: req.user.id,
                type: 'EXPENSE',
                date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
        });

        res.json(aggregation.map(a => ({ category: a.category, total: a._sum.amount })));
    } catch (error) {
        next(error);
    }
};

module.exports = { getMonthlySummary, getCategoryAggregation };
