import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Savings as SavingsIcon, Add, Delete } from '@mui/icons-material';
import api from '../utils/api';

const SavingsPage = () => {
    const [goals, setGoals] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });

    const fetchGoals = async () => {
        const res = await api.get('/savings');
        setGoals(res.data);
    };

    useEffect(() => { fetchGoals(); }, []);

    const handleCreate = async () => {
        await api.post('/savings', { ...formData, targetAmount: parseFloat(formData.targetAmount) });
        setOpen(false);
        fetchGoals();
    };

    const handleDelete = async (id) => {
        await api.delete(`/savings/${id}`);
        fetchGoals();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Savings Goals</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>New Goal</Button>
            </Box>

            <Grid container spacing={3}>
                {goals.map((goal) => (
                    <Grid item xs={12} sm={6} md={4} key={goal.id}>
                        <Paper className="glass-card" sx={{ p: 3, position: 'relative' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={goal.percentage}
                                        size={120}
                                        thickness={5}
                                        sx={{ color: goal.percentage >= 100 ? 'success.main' : 'primary.main' }}
                                    />
                                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                                            {Math.round(goal.percentage)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{goal.name}</Typography>
                                <Typography variant="body2" color="textSecondary">Target: ${goal.targetAmount.toLocaleString()}</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>Deadline: {new Date(goal.deadline).toLocaleDateString()}</Typography>

                                <Box sx={{ mt: 2, width: '100%', display: 'flex', gap: 1 }}>
                                    <Button fullWidth size="small" variant="outlined" onClick={() => handleDelete(goal.id)} color="error">Delete</Button>
                                    <Button fullWidth size="small" variant="contained">Update Progress</Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ className: 'glass-card' }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Create Savings Goal</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth label="Goal Name" margin="normal" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <TextField fullWidth label="Target Amount" type="number" margin="normal" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} />
                    <TextField fullWidth type="date" label="Deadline" margin="normal" InputLabelProps={{ shrink: true }} value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SavingsPage;
