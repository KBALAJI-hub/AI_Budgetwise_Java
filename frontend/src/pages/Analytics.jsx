import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const Analytics = () => {
    const theme = useTheme();
    const [categoryData, setCategoryData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const [catRes, sumRes, trendRes] = await Promise.all([
                    api.get(`/analytics/categories?month=${month}&year=${year}`),
                    api.get(`/analytics/summary?month=${month}&year=${year}`),
                    api.get(`/analytics/monthly`)
                ]);
                setCategoryData(catRes.data);
                setSummary(sumRes.data);
                setTrendData(trendRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pieData = {
        labels: categoryData.map(c => c.category),
        datasets: [{
            data: categoryData.map(c => c.total),
            backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: ['Income vs Expense'],
        datasets: [
            { label: 'Income', data: [summary?.totalIncome || 0], backgroundColor: '#10b981', borderRadius: 8 },
            { label: 'Expense', data: [summary?.totalExpense || 0], backgroundColor: '#ef4444', borderRadius: 8 }
        ]
    };

    const lineData = {
        labels: trendData.map(t => t.month),
        datasets: [
            {
                label: 'Income',
                data: trendData.map(t => t.income),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Expense',
                data: trendData.map(t => t.expense),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: theme.palette.text.primary, font: { family: 'Outfit', weight: 600 } } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: theme.palette.text.secondary } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: theme.palette.text.secondary } }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Advanced Analytics</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Monthly Spending Trend</Typography>
                        <Box sx={{ height: 300 }}><Line data={lineData} options={chartOptions} /></Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Spending by Category</Typography>
                        <Box sx={{ height: 300 }}><Pie data={pieData} options={chartOptions} /></Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Income vs Expense</Typography>
                        <Box sx={{ height: 300 }}><Bar data={barData} options={chartOptions} /></Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;
