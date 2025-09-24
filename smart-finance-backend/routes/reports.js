const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  getCategoryBreakdown,
  getMonthlyComparison,
  getSpendingTrends
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getFinancialSummary);
router.get('/categories', protect, getCategoryBreakdown);
router.get('/monthly-comparison', protect, getMonthlyComparison);
router.get('/spending-trends', protect, getSpendingTrends);

module.exports = router;