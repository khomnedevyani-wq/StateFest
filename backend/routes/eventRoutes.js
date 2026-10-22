const express = require('express');
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPlatformStats
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/stats', getPlatformStats);
router.get('/:id', getEventById);

// Admin-only routes
router.post('/', protect, adminOnly, createEvent);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
