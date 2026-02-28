const prisma = require('../config/prisma');

const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                fullName: true,
                email: true,
                income: true,
                savings: true,
                targetExpenses: true,
                role: true,
            },
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { fullName, income, savings, targetExpenses } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { fullName, income, savings, targetExpenses },
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };
