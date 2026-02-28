const express = require('express');
const { setBudget, getBudgets } = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, setBudget);
router.get('/', auth, getBudgets);

module.exports = router;
