const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  otp:       { type: String, required: true },
  fullName:  { type: String, required: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'buyer' },
  expiresAt: { type: Date,   required: true   },
});

// Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);