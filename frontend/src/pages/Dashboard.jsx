import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { AccountBalanceWallet, TrendingUp, TrendingDown, Savings } from '@mui/icons-material';

const Dashboard = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);

    // Summary metrics
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [incomeList, setIncomeList] = useState([]);
    const [expenseList, setExpenseList] = useState([]);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [projectedSavings, setProjectedSavings] = useState(0);

    const loadDashboard = async()=>{
        try {
            const res = await fetch("/api/dashboard");
            const data = await res.json();

            setTotalIncome(data.totalIncome);
            setTotalExpense(data.totalExpense);
            setIncomeList(data.income);
            setExpenseList(data.expenses);

            const balance = (data.totalIncome || 0) - (data.totalExpense || 0);
            setRemainingBalance(balance);
            setProjectedSavings(balance > 0 ? balance : 0);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(()=>{
        const user = localStorage.getItem("user");

        if(!user){
            window.location.href="/login";
        } else {
            loadDashboard();
        }
    },[]);

    // Also fetch when gaining focus just in case transaction was added
    useEffect(() => {
        window.addEventListener('focus', loadDashboard);
        return () => window.removeEventListener('focus', loadDashboard);
    }, []);

    const formatCurrency = (val) => isNaN(val) ? '$0.00' : `$${val.toFixed(2)}`;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={4}>
                Welcome back, {user?.fullName || 'User'}
            </Typography>

            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 160, borderRadius: 3, bgcolor: '#e3f2fd' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TrendingUp color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                            <Typography color="textSecondary" variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1 }}>Total Income</Typography>
                        </Box>
                        <Box>
                            <Typography component="p" variant="h4" fontWeight="700" sx={{ mb: 0.5, color: '#0f172a', wordBreak: 'break-word', fontSize: { xs: '1.5rem', md: '1.75rem', lg: '2rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{formatCurrency(totalIncome)}</Typography>
                            <Typography color="textSecondary" variant="body2" fontWeight="500">This Month</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 160, borderRadius: 3, bgcolor: '#ffebee' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TrendingDown color="error" sx={{ mr: 1.5, fontSize: 28 }} />
                            <Typography color="textSecondary" variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1 }}>Total Expenses</Typography>
                        </Box>
                        <Box>
                            <Typography component="p" variant="h4" fontWeight="700" sx={{ mb: 0.5, color: '#0f172a', wordBreak: 'break-word', fontSize: { xs: '1.5rem', md: '1.75rem', lg: '2rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{formatCurrency(totalExpense)}</Typography>
                            <Typography color="textSecondary" variant="body2" fontWeight="500">This Month</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 160, borderRadius: 3, bgcolor: '#f3e5f5' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <AccountBalanceWallet color="secondary" sx={{ mr: 1.5, fontSize: 28 }} />
                            <Typography color="textSecondary" variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1 }}>Remaining Balance</Typography>
                        </Box>
                        <Box>
                            <Typography component="p" variant="h4" fontWeight="700" sx={{ mb: 0.5, color: '#0f172a', wordBreak: 'break-word', fontSize: { xs: '1.5rem', md: '1.75rem', lg: '2rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{formatCurrency(remainingBalance)}</Typography>
                            <Typography color="textSecondary" variant="body2" fontWeight="500">This Month</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 160, borderRadius: 3, bgcolor: '#e8f5e9' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Savings color="success" sx={{ mr: 1.5, fontSize: 28 }} />
                            <Typography color="textSecondary" variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1 }}>Projected Savings</Typography>
                        </Box>
                        <Box>
                            <Typography component="p" variant="h4" fontWeight="700" sx={{ mb: 0.5, color: '#0f172a', wordBreak: 'break-word', fontSize: { xs: '1.5rem', md: '1.75rem', lg: '2rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{formatCurrency(projectedSavings)}</Typography>
                            <Typography color="textSecondary" variant="body2" fontWeight="500">This Month</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
