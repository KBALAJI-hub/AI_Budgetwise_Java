import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import SavingsGoalCard from '../components/SavingsGoalCard';
import api from '../utils/api';

const Savings = () => {
    const [goals, setGoals] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, goalName: '', targetAmount: '', currentAmount: '', deadline: '' });

    const fetchGoals = async () => {
        try {
            const res = await api.get('/savings/progress');
            setGoals(res.data);
        } catch (error) {
            console.error('Error fetching savings goals:', error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleOpen = (goal = null) => {
        if (goal) {
            setIsEditing(true);
            setFormData({
                ...goal,
                deadline: new Date(goal.deadline).toISOString().split('T')[0]
            });
        } else {
            setIsEditing(false);
            setFormData({ id: null, goalName: '', targetAmount: '', currentAmount: '', deadline: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/savings/${formData.id}`, formData);
            } else {
                await api.post('/savings', formData);
            }
            fetchGoals();
            handleClose();
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/savings/${id}`);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting savings goal:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Savings Goals</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Goal</Button>
            </Box>

            <Grid container spacing={3}>
                {goals.map(goal => (
                    <Grid item xs={12} md={6} lg={4} key={goal.id}>
                        <SavingsGoalCard goal={goal} onEdit={handleOpen} onDelete={handleDelete} />
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Savings Goal' : 'Add New Savings Goal'}</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField fullWidth margin="normal" label="Goal Name" required value={formData.goalName} onChange={(e) => setFormData({ ...formData, goalName: e.target.value })} />
                        <TextField fullWidth margin="normal" label="Target Amount" type="number" required value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} />
                        <TextField fullWidth margin="normal" label="Current Amount" type="number" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} />
                        <TextField fullWidth margin="normal" label="Deadline" type="date" required value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} InputLabelProps={{ shrink: true }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Savings;
