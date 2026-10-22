const User = require('../models/User');

// @desc    Get logged in user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged in user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, college, course, academicYear } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (college) user.college = college.trim();
    if (course) user.course = course.trim();
    if (academicYear) user.academicYear = academicYear;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        course: user.course,
        academicYear: user.academicYear,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
