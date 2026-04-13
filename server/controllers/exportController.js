const PDFDocument = require('pdfkit');
const { parse } = require('json2csv');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportToPDF = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const transactions = await prisma.transaction.findMany({ where: { userId } });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="financial_report_${userId}.pdf"`);
        doc.pipe(res);

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
        next(err);
    }
};

const exportToCSV = async (req, res, next) => {
    try {
        const userId = req.userId;
        const transactions = await prisma.transaction.findMany({ where: { userId } });
        
        const fields = ['date', 'category', 'type', 'amount', 'description'];
        const data = transactions.map(t => ({
            date: t.date.toISOString().split('T')[0],
            category: t.category,
            type: t.type,
            amount: t.amount,
            description: t.description || ""
        }));
        
        const csv = parse(data, { fields });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="financial_report_${userId}.csv"`);
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

module.exports = { exportToPDF, exportToCSV };
