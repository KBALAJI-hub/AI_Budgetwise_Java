const prisma = require('../config/prisma');

const createGoal = async (req, res, next) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        const goal = await prisma.savingsGoal.create({
            data: {
                userId: req.user.id,
                name,
                targetAmount,
                deadline: new Date(deadline),
            },
        });
        res.status(201).json(goal);
    } catch (error) {
        next(error);
    }
};

const updateGoalProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentAmount } = req.body;
        const goal = await prisma.savingsGoal.update({
            where: { id: parseInt(id), userId: req.user.id },
            data: { currentAmount },
        });
        res.json(goal);
    } catch (error) {
        next(error);
    }
};

const getGoals = async (req, res, next) => {
    try {
        const goals = await prisma.savingsGoal.findMany({
            where: { userId: req.user.id },
        });

        const results = goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            return {
                ...goal,
                percentage: Math.min(percentage, 100),
            };
        });

        res.json(results);
    } catch (error) {
        next(error);
    }
};

const deleteGoal = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.savingsGoal.delete({
            where: { id: parseInt(id), userId: req.user.id },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { createGoal, updateGoalProgress, getGoals, deleteGoal };
