import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    Zoom,
    IconButton,
    useTheme
} from '@mui/material';
import { Close } from '@mui/icons-material';
import './TransactionModal.css';

const TransactionModal = ({ open, onClose, onSave, transaction }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const categories = ['Salary', 'Rent', 'Food', 'Travel', 'Shopping', 'Bills', 'Others'];

    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        amount: '',
        category: 'Others',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                description: transaction.description || '',
                date: new Date(transaction.date).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                type: 'EXPENSE',
                amount: '',
                category: 'Others',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [transaction, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Zoom}
            PaperProps={{
                className: `transaction-modal-paper ${isDark ? 'dark' : 'light'}`,
                sx: {
                    borderRadius: '24px',
                    padding: '8px',
                    background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                pb: 1
            }}>
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
                <IconButton onClick={onClose} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        margin="normal"
                        className="modal-input"
                    >
                        <MenuItem value="INCOME">Income</MenuItem>
                        <MenuItem value="EXPENSE">Expense</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        margin="normal"
                        className="modal-input"
                        autoFocus
                    />
                    <TextField
                        select
                        fullWidth
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        margin="normal"
                        className="modal-input"
                    >
                        {categories.map(c => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        className="modal-input"
                    />
                    <TextField
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        className="modal-input"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    className="modal-save-btn"
                    sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: '#fff',
                        px: 4,
                        py: 1.5,
                        borderRadius: '14px',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                        }
                    }}
                >
                    {transaction ? 'Save Changes' : 'Add Transaction'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransactionModal;
