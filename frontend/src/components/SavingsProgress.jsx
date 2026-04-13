import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

const SavingsProgress = ({ savingsGoals }) => {
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const percentage = totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0;

    return (
        <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Overall Savings Progress</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Saved: ${totalCurrent.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{percentage.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color="success"
            />
            <Typography variant="body2" color="textSecondary">Total Target: ${totalTarget.toLocaleString()}</Typography>
        </Paper>
    );
};

export default SavingsProgress;
