const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/me', getUserProfile);
router.put('/me', updateUserProfile);

module.exports = router;
