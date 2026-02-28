const express = require('express');
const { getMonthlySummary, getCategoryAggregation } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', auth, getMonthlySummary);
router.get('/categories', auth, getCategoryAggregation);

module.exports = router;
