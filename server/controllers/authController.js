const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || "secret",
            { expiresIn: '1d' }
        );

        res.status(201).json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email
            },
            token
        });

    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        let isMatch = false;

        // Handle both encoded and plain passwords for backward compatibility
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for plain text
            isMatch = (password === user.password);
            
            // Automatically upgrade plain text to encoded password
            if (isMatch) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
            }
        }

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || "secret",
            { expiresIn: '1d' }
        );

        res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email
            },
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                income: true,
                savings: true,
                targetExpenses: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, income, savings, targetExpenses } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                fullName,
                income: income ? parseFloat(income) : undefined,
                savings: savings ? parseFloat(savings) : undefined,
                targetExpenses: targetExpenses ? parseFloat(targetExpenses) : undefined
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                income: true,
                savings: true,
                targetExpenses: true
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getMe, updateProfile };
