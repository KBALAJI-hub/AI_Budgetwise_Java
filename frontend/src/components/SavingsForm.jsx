import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const SavingsForm = ({ open, onClose, onSubmit, data, onChange, isEdit }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{isEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Goal Name"
                    margin="normal"
                    value={data.goalName}
                    onChange={(e) => onChange('goalName', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Target Amount"
                    type="number"
                    margin="normal"
                    value={data.targetAmount}
                    onChange={(e) => onChange('targetAmount', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Current Amount"
                    type="number"
                    margin="normal"
                    value={data.currentAmount}
                    onChange={(e) => onChange('currentAmount', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Deadline"
                    type="date"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange('deadline', e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit}>{isEdit ? 'Update' : 'Create'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SavingsForm;
