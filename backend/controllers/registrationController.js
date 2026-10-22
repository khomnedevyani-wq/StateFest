const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// Helper to generate a unique registration ID
const generateRegistrationId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SF-2026-${randomPart}`;
};

// @desc    Register logged-in student for an event
// @route   POST /api/registrations
// @access  Private (Student)
const createRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the Event ID to register.'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed because this event has been cancelled.'
      });
    }

    // 1. Check registration deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: `Registration deadline for this event was ${new Date(event.registrationDeadline).toLocaleDateString()}. Registrations are now closed.`
      });
    }

    // 2. Check duplicate registration
    const existingRegistration = await Registration.findOne({
      userId,
      eventId
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this event.',
          registrationId: existingRegistration.registrationId
        });
      } else {
        // If it was cancelled previously, reactivate it if capacity allows
        if (event.registeredCount >= event.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Sorry, this event has reached maximum capacity.'
          });
        }

        existingRegistration.status = 'confirmed';
        existingRegistration.registeredAt = new Date();
        await existingRegistration.save();

        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

        const populatedReg = await Registration.findById(existingRegistration._id)
          .populate('eventId')
          .populate('userId', 'name email college phone course academicYear');

        return res.status(200).json({
          success: true,
          message: 'Your registration has been reactivated successfully!',
          registration: populatedReg
        });
      }
    }

    // 3. Check event capacity
    if (event.registeredCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: `Sorry, this event has reached its maximum capacity of ${event.maxParticipants} participants.`
      });
    }

    // 4. Generate unique registration ID and create record
    let regId = generateRegistrationId();
    // Safety loop to ensure uniqueness
    let exists = await Registration.findOne({ registrationId: regId });
    while (exists) {
      regId = generateRegistrationId();
      exists = await Registration.findOne({ registrationId: regId });
    }

    const registration = await Registration.create({
      registrationId: regId,
      userId,
      eventId,
      status: 'confirmed',
      registeredAt: new Date()
    });

    // Concurrency-safe atomic increment of registered count
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    const populatedReg = await Registration.findById(registration._id)
      .populate('eventId')
      .populate('userId', 'name email college phone course academicYear');

    res.status(201).json({
      success: true,
      message: 'Congratulations! You have successfully registered for this event.',
      registration: populatedReg
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a registration for this event.'
      });
    }
    next(error);
  }
};

// @desc    Get current student's registrations
// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (Owner or Admin)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.'
      });
    }

    // Check authorization: must be the student who registered or an admin
    if (
      registration.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only cancel your own registrations.'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration is already cancelled.'
      });
    }

    // Mark as cancelled
    registration.status = 'cancelled';
    await registration.save();

    // Decrement event registered count safely
    await Event.findByIdAndUpdate(registration.eventId, {
      $inc: { registeredCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Registration was cancelled successfully.',
      registrationId: registration.registrationId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations (Admin)
// @route   GET /api/registrations
// @access  Private / Admin
const getAllRegistrations = async (req, res, next) => {
  try {
    const { eventId, search, status } = req.query;
    let query = {};

    if (eventId) {
      query.eventId = eventId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let registrations = await Registration.find(query)
      .populate('eventId', 'title date venue city category organizerCollege')
      .populate('userId', 'name email phone college course academicYear')
      .sort({ registeredAt: -1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      registrations = registrations.filter((reg) => {
        const studentName = reg.userId?.name?.toLowerCase() || '';
        const studentEmail = reg.userId?.email?.toLowerCase() || '';
        const regCode = reg.registrationId?.toLowerCase() || '';
        const eventTitle = reg.eventId?.title?.toLowerCase() || '';
        return (
          studentName.includes(term) ||
          studentEmail.includes(term) ||
          regCode.includes(term) ||
          eventTitle.includes(term)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update registration status (Admin)
// @route   PUT /api/registrations/:id/status
// @access  Private / Admin
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'attended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, or attended.'
      });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.'
      });
    }

    const previousStatus = registration.status;
    registration.status = status;
    await registration.save();

    // Adjust event counter if transitioning to/from cancelled
    if (previousStatus === 'confirmed' && status === 'cancelled') {
      await Event.findByIdAndUpdate(registration.eventId, { $inc: { registeredCount: -1 } });
    } else if (previousStatus === 'cancelled' && (status === 'confirmed' || status === 'attended')) {
      await Event.findByIdAndUpdate(registration.eventId, { $inc: { registeredCount: 1 } });
    }

    res.status(200).json({
      success: true,
      message: `Registration status updated to ${status}.`,
      registration
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
  getAllRegistrations,
  updateRegistrationStatus
};
