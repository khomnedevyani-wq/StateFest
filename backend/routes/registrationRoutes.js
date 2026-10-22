const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
  getAllRegistrations,
  updateRegistrationStatus
} = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student routes (Protected)
router.post('/', protect, createRegistration);
router.get('/my', protect, getMyRegistrations);
router.delete('/:id', protect, cancelRegistration);

// Admin-only routes
router.get('/', protect, adminOnly, getAllRegistrations);
router.put('/:id/status', protect, adminOnly, updateRegistrationStatus);

module.exports = router;
