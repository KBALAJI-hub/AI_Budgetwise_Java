const express = require('express');
const { createSavingsGoal, getSavingsProgress, updateSavingsGoal, deleteSavingsGoal } = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createSavingsGoal);
router.get('/progress', getSavingsProgress);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

module.exports = router;
