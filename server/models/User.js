const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['buyer', 'artist', 'admin'], default: 'buyer' },

    // Profile fields
    avatar:       { type: String, default: '' },
    phone:        { type: String, default: '' },
    city:         { type: String, default: '' },
    country:      { type: String, default: 'Pakistan' },
    bio:          { type: String, default: '' },
    specialty:    { type: String, default: '' },
    experience:   { type: String, default: '' },
    instagram:    { type: String, default: '' },
    website:      { type: String, default: '' },
    storeName:    { type: String, default: '' },
    storeTagline: { type: String, default: '' },

    acceptCustomOrders: { type: Boolean, default: true },
    deliveryOptions:    { type: [String], default: ['Standard (5-7 days)'] },

    notifications: {
      newOrders:       { type: Boolean, default: true  },
      customRequests:  { type: Boolean, default: true  },
      newMessages:     { type: Boolean, default: true  },
      paymentReceived: { type: Boolean, default: true  },
      newReviews:      { type: Boolean, default: true  },
      platformUpdates: { type: Boolean, default: false },
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],

    // Old token-based reset (kept for backward compat)
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date   },

    // ── New OTP-based password reset ──────────────────────────
    resetOTP:       { type: String },
    resetOTPExpiry: { type: Date   },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);