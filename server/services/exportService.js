const PDFDocument = require('pdfkit');
const { parse } = require('json2csv');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generatePDFBuffer = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
            const transactions = await prisma.transaction.findMany({ where: { userId: parseInt(userId) } });

            const doc = new PDFDocument();
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.fontSize(20).text('Financial Report', { align: 'center' }).moveDown();
            if (user) {
                doc.fontSize(14).text(`User: ${user.fullName} (${user.email})`).moveDown();
            }

            let totalIncome = 0;
            let totalExpense = 0;
            transactions.forEach(t => {
                if (t.type === 'INCOME') totalIncome += t.amount;
                else totalExpense += t.amount;
            });

            doc.text(`Total Income: $${totalIncome}`);
            doc.text(`Total Expense: $${totalExpense}`);
            doc.text(`Balance: $${totalIncome - totalExpense}`).moveDown();

            doc.fontSize(16).text('Transactions', { underline: true }).moveDown();
            transactions.forEach(t => {
                doc.fontSize(12).text(`${t.date.toISOString().split('T')[0]} - ${t.category} - ${t.type}: $${t.amount}`);
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

const generateCSVString = async (userId) => {
    const transactions = await prisma.transaction.findMany({ where: { userId: parseInt(userId) } });
    const fields = ['date', 'category', 'type', 'amount', 'description'];
    const data = transactions.map(t => ({
        date: t.date.toISOString().split('T')[0],
        category: t.category,
        type: t.type,
        amount: t.amount,
        description: t.description || ""
    }));
    return parse(data, { fields });
};

module.exports = { generatePDFBuffer, generateCSVString };
