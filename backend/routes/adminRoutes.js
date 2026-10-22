const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getStudents,
  exportRegistrationsCSV
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/stats', getAdminStats);
router.get('/users', getStudents);
router.get('/export/csv', exportRegistrationsCSV);

module.exports = router;
