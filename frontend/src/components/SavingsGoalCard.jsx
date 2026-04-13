import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, LinearProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const SavingsGoalCard = ({ goal, onEdit, onDelete }) => {
    const { goalName, targetAmount, currentAmount, deadline, progressPercentage } = goal;

    return (
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{goalName}</Typography>
                    <Box>
                        <IconButton color="primary" onClick={() => onEdit(goal)}>
                            <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => onDelete(goal.id)}>
                            <Delete />
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Target: ${targetAmount.toFixed(2)} | Saved: ${currentAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Deadline: {new Date(deadline).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(progressPercentage, 100)}
                            color="primary"
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

export default SavingsGoalCard;
