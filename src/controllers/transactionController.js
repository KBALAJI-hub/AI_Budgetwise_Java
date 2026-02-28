const prisma = require('../config/prisma');
const { createObjectCsvStringifier } = require('csv-writer');

const addTransaction = async (req, res, next) => {
    try {
        const { type, amount, category, description, date } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                type,
                amount,
                category,
                description,
                date: date ? new Date(date) : new Date(),
            },
        });
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, amount, category, description, date } = req.body;
        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id), userId: req.user.id },
            data: { type, amount, category, description, date: date ? new Date(date) : undefined },
        });
        res.json(transaction);
    } catch (error) {
        next(error);
    }
};

const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.transaction.delete({
            where: { id: parseInt(id), userId: req.user.id },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const exportTransactionsCsv = async (req, res, next) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
        });

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'id', title: 'ID' },
                { id: 'type', title: 'Type' },
                { id: 'amount', title: 'Amount' },
                { id: 'category', title: 'Category' },
                { id: 'description', title: 'Description' },
                { id: 'date', title: 'Date' },
            ],
        });

        const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(transactions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(csvContent);
    } catch (error) {
        next(error);
    }
};

module.exports = { addTransaction, getTransactions, updateTransaction, deleteTransaction, exportTransactionsCsv };
