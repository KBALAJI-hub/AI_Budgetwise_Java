import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Download, Delete, Edit } from '@mui/icons-material';
import api from '../utils/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'EXPENSE', amount: '', category: 'Others', description: '', date: new Date().toISOString().split('T')[0] });

    const categories = ['Rent', 'Food', 'Travel', 'Shopping', 'Bills', 'Others'];

    const fetchTransactions = async () => {
        const res = await api.get('/transactions');
        setTransactions(res.data);
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleSubmit = async () => {
        try {
            await api.post('/transactions', { ...formData, amount: parseFloat(formData.amount) });
            setOpen(false);
            fetchTransactions();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) { console.error(err); }
    };

    const handleExport = async () => {
        const res = await api.get('/transactions/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions.csv');
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Transactions</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>Export CSV</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Transaction</Button>
                </Box>
            </Box>

            <TableContainer component={Paper} className="glass-card">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                <TableCell>{t.category}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell sx={{ color: t.type === 'INCOME' ? 'success.main' : 'error.main', fontWeight: 600 }}>{t.type}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>${t.amount.toLocaleString()}</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small"><Edit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ className: 'glass-card', sx: { backdropFilter: 'blur(20px)' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Add New Transaction</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth select label="Type" margin="normal" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                        <MenuItem value="INCOME">Income</MenuItem>
                        <MenuItem value="EXPENSE">Expense</MenuItem>
                    </TextField>
                    <TextField fullWidth label="Amount" type="number" margin="normal" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    <TextField fullWidth select label="Category" margin="normal" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Description" margin="normal" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    <TextField fullWidth type="date" label="Date" margin="normal" InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Transactions;
