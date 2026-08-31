const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date, savingsGoalId } = req.body;
        
        // If savingsGoalId is provided, adjust currentAmount of that goal first
        if (savingsGoalId) {
            const goalId = parseInt(savingsGoalId);
            const parsedAmount = parseFloat(amount);
            const adjustment = type === 'INCOME' ? parsedAmount : -parsedAmount;
            
            await prisma.savingsGoal.update({
                where: { id: goalId },
                data: {
                    currentAmount: {
                        increment: adjustment
                    }
                }
            });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date),
                userId: req.userId,
                savingsGoalId: savingsGoalId ? parseInt(savingsGoalId) : null
            },
            include: {
                savingsGoal: {
                    select: {
                        id: true,
                        goalName: true
                    }
                }
            }
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            include: {
                savingsGoal: {
                    select: {
                        id: true,
                        goalName: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category, description, date, savingsGoalId } = req.body;

        const oldTransaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) }
        });

        // Revert old transaction impact
        if (oldTransaction && oldTransaction.savingsGoalId) {
            const oldAdjustment = oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount;
            await prisma.savingsGoal.update({
                where: { id: oldTransaction.savingsGoalId },
                data: {
                    currentAmount: {
                        decrement: oldAdjustment
                    }
                }
            });
        }

        // Apply new transaction impact
        if (savingsGoalId) {
            const newGoalId = parseInt(savingsGoalId);
            const parsedAmount = parseFloat(amount);
            const newAdjustment = type === 'INCOME' ? parsedAmount : -parsedAmount;
            
            await prisma.savingsGoal.update({
                where: { id: newGoalId },
                data: {
                    currentAmount: {
                        increment: newAdjustment
                    }
                }
            });
        }

        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: {
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date),
                savingsGoalId: savingsGoalId ? parseInt(savingsGoalId) : null
            },
            include: {
                savingsGoal: {
                    select: {
                        id: true,
                        goalName: true
                    }
                }
            }
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const oldTransaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) }
        });

        // Revert old transaction impact
        if (oldTransaction && oldTransaction.savingsGoalId) {
            const oldAdjustment = oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount;
            await prisma.savingsGoal.update({
                where: { id: oldTransaction.savingsGoalId },
                data: {
                    currentAmount: {
                        decrement: oldAdjustment
                    }
                }
            });
        }

        await prisma.transaction.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions, updateTransaction, deleteTransaction };
