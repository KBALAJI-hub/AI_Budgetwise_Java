const express = require('express');
const { createBudget, getBudgetsProgress, updateBudget, deleteBudget } = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createBudget);
router.get('/progress', getBudgetsProgress);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
