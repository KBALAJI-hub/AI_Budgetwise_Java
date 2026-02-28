import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { ShoppingCart, Home, Commute, LocalBar, Receipt, Category as CategoryIcon } from '@mui/icons-material';
import api from '../utils/api';

const categories = ['Rent', 'Food', 'Travel', 'Shopping', 'Bills', 'Others'];

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ category: 'Rent', limit: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const fetchBudgets = async () => {
        const res = await api.get(`/budgets?month=${formData.month}&year=${formData.year}`);
        setBudgets(res.data);
    };

    useEffect(() => { fetchBudgets(); }, []);

    const handleSave = async () => {
        await api.post('/budgets', { ...formData, limit: parseFloat(formData.limit) });
        setOpen(false);
        fetchBudgets();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Monthly Budgets</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Set Budget</Button>
            </Box>

            <Grid container spacing={3}>
                {categories.map((cat) => {
                    const budget = budgets.find(b => b.category === cat);
                    const percent = budget ? (budget.usedAmount / budget.limit) * 100 : 0;
                    const color = percent > 90 ? 'error' : percent > 75 ? 'warning' : 'primary';

                    return (
                        <Grid item xs={12} md={6} key={cat}>
                            <Paper className="glass-card" sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cat}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ${budget?.usedAmount?.toLocaleString() || 0} / ${budget?.limit?.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(percent, 100)}
                                    color={color}
                                    sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)' }}
                                />
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color={color === 'error' ? 'error' : 'textSecondary'}>
                                        {percent.toFixed(1)}% Used
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Remaining: ${((budget?.limit || 0) - (budget?.usedAmount || 0)).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ className: 'glass-card' }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Set Monthly Budget</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth select label="Category" margin="normal" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Monthly Limit" type="number" margin="normal" value={formData.limit} onChange={(e) => setFormData({ ...formData, limit: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Budget</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetPage;
