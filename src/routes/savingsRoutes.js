const express = require('express');
const { createGoal, updateGoalProgress, getGoals, deleteGoal } = require('../controllers/savingsController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createGoal);
router.get('/', auth, getGoals);
router.put('/:id', auth, updateGoalProgress);
router.delete('/:id', auth, deleteGoal);

module.exports = router;
