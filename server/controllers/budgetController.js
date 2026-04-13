const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBudget = async (req, res) => {
    try {
        const { category, monthlyLimit, month } = req.body;
        const budget = await prisma.budget.create({
            data: {
                category,
                monthlyLimit: parseFloat(monthlyLimit),
                month,
                userId: req.userId
            }
        });
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBudgetsProgress = async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId: req.userId }
        });

        const progressData = await Promise.all(budgets.map(async (budget) => {
            const startDate = new Date(`${budget.month}-01T00:00:00.000Z`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const transactions = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    userId: req.userId,
                    category: budget.category,
                    type: 'EXPENSE',
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            const spentAmount = transactions._sum.amount || 0;
            const remainingBudget = budget.monthlyLimit - spentAmount;
            const progressPercentage = budget.monthlyLimit > 0 ? (spentAmount / budget.monthlyLimit) * 100 : 0;

            return {
                id: budget.id,
                category: budget.category,
                monthlyLimit: budget.monthlyLimit,
                month: budget.month,
                spentAmount,
                remainingBudget,
                progressPercentage
            };
        }));

        res.json(progressData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, monthlyLimit, month } = req.body;
        const budget = await prisma.budget.update({
            where: { id: parseInt(id) },
            data: { category, monthlyLimit: parseFloat(monthlyLimit), month }
        });
        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.budget.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createBudget, getBudgetsProgress, updateBudget, deleteBudget };
