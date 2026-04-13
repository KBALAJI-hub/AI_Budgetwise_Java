import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button } from '@mui/material';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Other'];

const BudgetLimitForm = ({ open, onClose, onSubmit, data, onChange }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{data.id ? 'Edit Budget' : 'Set Budget Limit'}</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    fullWidth
                    label="Category"
                    margin="normal"
                    value={data.category}
                    onChange={(e) => onChange('category', e.target.value)}
                >
                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
                <TextField
                    fullWidth
                    label="Monthly Limit"
                    type="number"
                    margin="normal"
                    value={data.monthlyLimit}
                    onChange={(e) => onChange('monthlyLimit', e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BudgetLimitForm;
