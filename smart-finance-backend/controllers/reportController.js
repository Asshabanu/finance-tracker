const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// @desc    Get financial summary
// @route   GET /api/reports/summary
// @access  Private
exports.getFinancialSummary = async (req, res, next) => {
  try {
    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get transactions for the current month
    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Calculate income and expenses
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });

    const balance = income - expenses;

    res.status(200).json({
      success: true,
      data: {
        income,
        expenses,
        balance,
        transactions: transactions.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category breakdown
// @route   GET /api/reports/categories
// @access  Private
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get transactions for the current month
    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).populate('category');

    // Group transactions by category
    const categoryMap = new Map();

    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap.has(category._id)) {
        categoryMap.set(category._id, {
          name: category.name,
          color: category.color,
          type: category.type,
          total: 0,
          count: 0
        });
      }

      const categoryData = categoryMap.get(category._id);
      categoryData.total += transaction.amount;
      categoryData.count += 1;
    });

    // Convert map to array and sort by total amount
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get income vs expenses by month
// @route   GET /api/reports/monthly-comparison
// @access  Private
exports.getMonthlyComparison = async (req, res, next) => {
  try {
    // Get last 6 months
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      // Get transactions for this month
      const transactions = await Transaction.find({
        user: req.user.id,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      // Calculate income and expenses
      let income = 0;
      let expenses = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          income += transaction.amount;
        } else {
          expenses += transaction.amount;
        }
      });

      months.push({
        month: monthName,
        income,
        expenses,
        balance: income - expenses
      });
    }

    res.status(200).json({
      success: true,
      count: months.length,
      data: months
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get spending trends
// @route   GET /api/reports/spending-trends
// @access  Private
exports.getSpendingTrends = async (req, res, next) => {
  try {
    // Get last 12 months
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      // Get transactions for this month
      const transactions = await Transaction.find({
        user: req.user.id,
        type: 'expense',
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      // Calculate total expenses
      const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

      months.push({
        month: monthName,
        amount: totalExpenses
      });
    }

    res.status(200).json({
      success: true,
      count: months.length,
      data: months
    });
  } catch (err) {
    next(err);
  }
};