import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, Savings as SavingsIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

const StatCard = ({ title, amount, icon, color, trend }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Paper className="glass-card" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color }}>
                    {icon}
                </Box>
                {trend && (
                    <Typography variant="caption" sx={{ color: trend > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </Typography>
                )}
            </Box>
            <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>{title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>${amount?.toLocaleString()}</Typography>
            </Box>
        </Paper>
    </motion.div>
);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const res = await api.get(`/analytics/summary?month=${month}&year=${year}`);
                setSummary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Financial Overview</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Income" amount={summary?.totalIncome} icon={<TrendingUp />} color="#10b981" trend={12} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Expenses" amount={summary?.totalExpense} icon={<TrendingDown />} color="#ef4444" trend={-5} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Remaining Balance" amount={summary?.netSavings} icon={<AccountBalance />} color="#6366f1" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Projected Savings" amount={summary?.totalIncome * 0.2} icon={<SavingsIcon />} color="#ec4899" />
                </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
                <Paper className="glass-card" sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Quick Insights</Typography>
                    <Typography color="textSecondary">
                        Based on your spending this month, you are on track to save 15% more than last month.
                        Consider reducing your "Shopping" expenses to hit your target goal.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;
