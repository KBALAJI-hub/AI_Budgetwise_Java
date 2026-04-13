import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Fade,
    useTheme
} from '@mui/material';
import { Add, Download, Delete, Edit } from '@mui/icons-material';
import api from '../utils/api';
import TransactionModal from '../components/TransactionModal';

const Transactions = () => {
    const theme = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleOpenAdd = () => {
        setSelectedTransaction(null);
        setOpen(true);
    };

    const handleOpenEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedTransaction) {
                // Update
                const res = await api.put(`/transactions/${selectedTransaction.id}`, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
                if (res.status === 200) {
                    setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? res.data : t));
                }
            } else {
                // Add
                const res = await api.post('/transactions', {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
                if (res.status === 201) {
                    setTransactions(prev => [res.data, ...prev]);
                }
            }
            setOpen(false);
        } catch (err) {
            console.error('Error saving transaction:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const res = await api.delete(`/transactions/${id}`);
                if (res.status === 200) {
                    // Instant UI update
                    setTransactions(prev => prev.filter(t => t.id !== id));
                }
            } catch (err) {
                console.error('Error deleting transaction:', err);
            }
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/transactions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Transactions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your income and expenses seamlessly
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExport}
                            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAdd}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0, 118, 255, 0.23)' }
                            }}
                        >
                            Add Transaction
                        </Button>
                    </Box>
                </Box>

                <TableContainer component={Paper} sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                }} className="glass-card">
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }}>
                                <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Typography color="text.secondary">No transactions found. Add your first one!</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow
                                        key={t.id}
                                        sx={{
                                            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)' },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: t.type === 'INCOME' ? '#10b981' : '#ef4444',
                                                    boxShadow: t.type === 'INCOME' ? '0 0 10px rgba(16, 185, 129, 0.3)' : '0 0 10px rgba(239, 68, 68, 0.3)'
                                                }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.category}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{t.description || '-'}</TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '10px',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.05em',
                                                bgcolor: t.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: t.type === 'INCOME' ? '#10b981' : '#ef4444',
                                                border: t.type === 'INCOME' ? '1px solid rgba(16, 185, 129, 0.1)' : '1px solid rgba(239, 68, 68, 0.1)'
                                            }}>
                                                {t.type}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            color: t.type === 'INCOME' ? '#10b981' : 'text.primary'
                                        }}>
                                            {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenEdit(t)}
                                                    sx={{
                                                        mr: 1,
                                                        color: '#6366f1',
                                                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)', transform: 'scale(1.1)' },
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(t.id)}
                                                    sx={{
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', transform: 'scale(1.1)' },
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TransactionModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onSave={handleSave}
                    transaction={selectedTransaction}
                />
            </Box>
        </Fade>
    );
};

export default Transactions;
