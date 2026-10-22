const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technical', 'Cultural', 'Sports', 'Workshops', 'Academic'],
    default: 'Technical'
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    default: '10:00 AM'
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    default: '05:00 PM'
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  organizerCollege: {
    type: String,
    required: [true, 'Organizer college is required'],
    trim: true
  },
  registrationFee: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Registration fee cannot be negative']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participant capacity is required'],
    default: 100,
    min: [1, 'Capacity must be at least 1']
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: [0, 'Registered count cannot be negative']
  },
  eligibility: {
    type: String,
    default: 'Open to all bona fide college students (Undergraduate & Postgraduate) across Maharashtra with a valid college ID card.'
  },
  rules: {
    type: [String],
    default: [
      'Participants must present a valid College ID card during verification at the registration desk.',
      'Report at the venue at least 30 minutes prior to scheduled start time.',
      'Strict adherence to the college campus code of conduct and sportsmanship is mandatory.',
      'Judges and organizing committee decisions shall be final and binding.',
      'Certificates of participation will be awarded to all eligible participants.'
    ]
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate slug before saving
eventSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Index for high-performance search and sorting
eventSchema.index({ title: 'text', description: 'text', city: 1, category: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
