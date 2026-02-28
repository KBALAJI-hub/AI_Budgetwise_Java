const prisma = require('../config/prisma');

const setBudget = async (req, res, next) => {
    try {
        const { category, limit, month, year } = req.body;
        const budget = await prisma.budget.upsert({
            where: {
                userId_category_month_year: {
                    userId: req.user.id,
                    category,
                    month,
                    year,
                },
            },
            update: { limit },
            create: {
                userId: req.user.id,
                category,
                limit,
                month,
                year,
            },
        });
        res.json(budget);
    } catch (error) {
        next(error);
    }
};

const getBudgets = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const budgets = await prisma.budget.findMany({
            where: {
                userId: req.user.id,
                month: month ? parseInt(month) : undefined,
                year: year ? parseInt(year) : undefined,
            },
        });

        const results = await Promise.all(
            budgets.map(async (budget) => {
                const spent = await prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        userId: req.user.id,
                        category: budget.category,
                        type: 'EXPENSE',
                        date: {
                            gte: new Date(budget.year, budget.month - 1, 1),
                            lt: new Date(budget.year, budget.month, 1),
                        },
                    },
                });
                const usedAmount = spent._sum.amount || 0;
                return {
                    ...budget,
                    usedAmount,
                    remainingAmount: budget.limit - usedAmount,
                };
            })
        );

        res.json(results);
    } catch (error) {
        next(error);
    }
};

module.exports = { setBudget, getBudgets };
