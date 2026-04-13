const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMonthlySummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 1);

        const transactions = await prisma.transaction.groupBy({
            by: ['type'],
            where: {
                userId: req.userId,
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
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 1);

        const aggregation = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId: req.userId,
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

const getMonthlyTrends = async (req, res, next) => {
    try {
        const d = new Date();
        d.setMonth(d.getMonth() - 5);
        d.setDate(1);
        const startDate = new Date(d);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: req.userId,
                date: { gte: startDate }
            },
            select: { amount: true, date: true, type: true }
        });

        const grouped = {};
        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!grouped[key]) grouped[key] = { expense: 0, income: 0, sortDate: new Date(date.getFullYear(), date.getMonth(), 1).getTime() };
            if (t.type === 'EXPENSE') grouped[key].expense += t.amount;
            if (t.type === 'INCOME') grouped[key].income += t.amount;
        });

        const trends = Object.keys(grouped).map(key => ({ 
            month: key, 
            expense: grouped[key].expense, 
            income: grouped[key].income,
            sortDate: grouped[key].sortDate
        }));
        
        trends.sort((a,b) => a.sortDate - b.sortDate);
        
        const sortedTrends = trends.map(({sortDate, ...rest}) => rest);
        res.json(sortedTrends);
    } catch (error) {
        next(error);
    }
};

module.exports = { getMonthlySummary, getCategoryAggregation, getMonthlyTrends };
