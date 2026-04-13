const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date),
                userId: req.userId
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
        const { amount, type, category, description, date } = req.body;
        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: {
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date)
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
        await prisma.transaction.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions, updateTransaction, deleteTransaction };
