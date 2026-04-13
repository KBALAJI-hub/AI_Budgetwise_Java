const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSavingsGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, currentAmount, deadline } = req.body;
        const goal = await prisma.savingsGoal.create({
            data: {
                goalName,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount || 0),
                deadline: new Date(deadline),
                userId: req.userId
            }
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSavingsProgress = async (req, res) => {
    try {
        const goals = await prisma.savingsGoal.findMany({
            where: { userId: req.userId }
        });

        const progressData = goals.map((goal) => {
            const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return {
                id: goal.id,
                goalName: goal.goalName,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: goal.deadline,
                progressPercentage
            };
        });

        res.json(progressData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { goalName, targetAmount, currentAmount, deadline } = req.body;
        const goal = await prisma.savingsGoal.update({
            where: { id: parseInt(id) },
            data: {
                goalName,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount),
                deadline: new Date(deadline)
            }
        });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.savingsGoal.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createSavingsGoal, getSavingsProgress, updateSavingsGoal, deleteSavingsGoal };
