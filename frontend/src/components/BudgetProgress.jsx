import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

const BudgetProgress = ({ budgets }) => {
    const totalLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const percentage = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

    return (
        <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Overall Budget Progress</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Spent: ${totalSpent.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{percentage.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={percentage > 80 ? 'error' : 'primary'}
            />
            <Typography variant="body2" color="textSecondary">Total Limit: ${totalLimit.toLocaleString()}</Typography>
        </Paper>
    );
};

export default BudgetProgress;
