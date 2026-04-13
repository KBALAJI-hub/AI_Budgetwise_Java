const express = require('express');
const { getMonthlySummary, getCategoryAggregation, getMonthlyTrends } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getMonthlySummary);
router.get('/categories', getCategoryAggregation);
router.get('/monthly', getMonthlyTrends);

module.exports = router;
