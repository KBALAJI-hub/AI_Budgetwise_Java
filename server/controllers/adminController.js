const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        transactions: true,
                        budgets: true,
                        savingsGoals: true,
                        posts: true
                    }
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        res.json({ message: 'User role updated successfully', user: { id: user.id, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        if (userId === req.userId) {
            return res.status(400).json({ error: 'You cannot delete your own admin account.' });
        }

        // Clean up user-related records first to avoid foreign key violations
        await prisma.$transaction([
            prisma.transaction.deleteMany({ where: { userId } }),
            prisma.budget.deleteMany({ where: { userId } }),
            prisma.savingsGoal.deleteMany({ where: { userId } }),
            prisma.comment.deleteMany({ where: { userId } }),
            prisma.like.deleteMany({ where: { userId } }),
            prisma.post.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } })
        ]);

        res.json({ message: 'User and all related records deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUsers, updateUserRole, deleteUser };
