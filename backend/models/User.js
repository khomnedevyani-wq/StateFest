const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true,
    match: [/^[0-9+\s-]{10,15}$/, 'Please provide a valid phone number (at least 10 digits)']
  },
  college: {
    type: String,
    required: [true, 'Please provide your college name'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Please provide your course / program'],
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Please specify your academic year'],
    enum: ['First Year (FY)', 'Second Year (SY)', 'Third Year (TY)', 'Final Year', 'Postgraduate (PG)'],
    default: 'Third Year (TY)'
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compare hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Safe JSON serialization (strip passwordHash)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
