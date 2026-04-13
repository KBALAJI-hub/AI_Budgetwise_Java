import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import BudgetCard from '../components/BudgetCard';
import api from '../utils/api';

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, category: '', monthlyLimit: '', month: '' });

    const fetchBudgets = async () => {
        try {
            const res = await api.get('/budget/progress');
            setBudgets(res.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleOpen = (budget = null) => {
        if (budget) {
            setIsEditing(true);
            setFormData(budget);
        } else {
            setIsEditing(false);
            setFormData({ id: null, category: '', monthlyLimit: '', month: new Date().toISOString().slice(0, 7) });
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
                await api.put(`/budget/${formData.id}`, formData);
            } else {
                await api.post('/budget', formData);
            }
            fetchBudgets();
            handleClose();
        } catch (error) {
            console.error('Error saving budget:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/budget/${id}`);
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Monthly Budgets</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Budget</Button>
            </Box>

            <Grid container spacing={3}>
                {budgets.map(budget => (
                    <Grid item xs={12} md={6} lg={4} key={budget.id}>
                        <BudgetCard budget={budget} onEdit={handleOpen} onDelete={handleDelete} />
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField fullWidth margin="normal" label="Category" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                        <TextField fullWidth margin="normal" label="Monthly Limit" type="number" required value={formData.monthlyLimit} onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })} />
                        <TextField fullWidth margin="normal" label="Month" type="month" required value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} InputLabelProps={{ shrink: true }} />
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

export default Budget;
