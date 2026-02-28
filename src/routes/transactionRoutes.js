const express = require('express');
const { addTransaction, getTransactions, updateTransaction, deleteTransaction, exportTransactionsCsv } = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, addTransaction);
router.get('/', auth, getTransactions);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);
router.get('/export', auth, exportTransactionsCsv);

module.exports = router;
