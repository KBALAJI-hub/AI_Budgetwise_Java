import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, LinearProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
    const { category, monthlyLimit, spentAmount, remainingBudget, progressPercentage } = budget;

    const getProgressColor = () => {
        if (progressPercentage < 50) return 'success';
        if (progressPercentage <= 80) return 'warning';
        return 'error';
    };

    return (
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{category}</Typography>
                    <Box>
                        <IconButton color="primary" onClick={() => onEdit(budget)}>
                            <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => onDelete(budget.id)}>
                            <Delete />
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Limit: ${monthlyLimit.toFixed(2)} | Spent: ${spentAmount.toFixed(2)} | Remaining: ${remainingBudget.toFixed(2)}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(progressPercentage, 100)}
                            color={getProgressColor()}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="textSecondary">{`${Math.round(progressPercentage)}%`}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BudgetCard;
