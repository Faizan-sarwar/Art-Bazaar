const User    = require('../models/User');
const Artwork = require('../models/Artwork');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

const OTP       = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

// ── Helper ────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Signup (old direct signup — kept for backward compat) ─────
const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide full name, email and password' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      fullName,
      email:    email.toLowerCase(),
      password: hashedPassword,
      role:     role || 'buyer',
    });

    await user.save();
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Send OTP for signup ───────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const otpCode        = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 12);

    await OTP.deleteMany({ email: email.toLowerCase() });
    await OTP.create({
      email:     email.toLowerCase(),
      otp:       otpCode,
      fullName,
      password:  hashedPassword,
      role:      role || 'buyer',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail({
      to:      email,
      subject: 'ArtBazaar — Verify Your Email',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🎨 ArtBazaar</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Pakistan's #1 Art Marketplace</p>
          </div>
          <div style="padding:32px;text-align:center;">
            <h2 style="color:#111827;margin-bottom:8px;">Verify Your Email</h2>
            <p style="color:#6b7280;margin-bottom:24px;">Hi <strong>${fullName}</strong>! Enter this code to complete your registration:</p>
            <div style="background:#f3f4f6;border-radius:12px;padding:24px;margin:0 auto 24px;display:inline-block;min-width:200px;">
              <span style="font-size:42px;font-weight:900;color:#7c3aed;letter-spacing:10px;">${otpCode}</span>
            </div>
            <p style="color:#9ca3af;font-size:13px;margin:0;">Expires in <strong>10 minutes</strong>.</p>
            <p style="color:#9ca3af;font-size:13px;margin:6px 0 0;">Didn't request this? Ignore this email.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;">
            <p style="color:#d1d5db;font-size:12px;margin:0;">© 2025 ArtBazaar. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP: ' + error.message });
  }
};

// ── Verify OTP and create account ────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const record = await OTP.findOne({ email: email.toLowerCase() });

    if (!record)
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });

    if (record.otp !== otp.toString())
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

    if (new Date() > record.expiresAt) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    const user = new User({
      fullName: record.fullName,
      email:    record.email,
      password: record.password, // already hashed
      role:     record.role,
    });
    await user.save();
    await OTP.deleteOne({ _id: record._id });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar || '' },
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Forgot Password — sends OTP email ────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Please provide your email' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond success to prevent email enumeration
    if (!user)
      return res.status(200).json({ success: true, message: 'If this email exists, a code has been sent.' });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP       = otp;
    user.resetOTPExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to:      user.email,
      subject: 'ArtBazaar — Password Reset Code',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🔐 ArtBazaar</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Password Reset Request</p>
          </div>
          <div style="padding:32px;text-align:center;">
            <h2 style="color:#111827;margin-bottom:8px;">Reset Your Password</h2>
            <p style="color:#6b7280;margin-bottom:24px;">Hi <strong>${user.fullName}</strong>! Use this code to reset your password:</p>
            <div style="background:#f3f4f6;border-radius:12px;padding:24px;margin:0 auto 24px;display:inline-block;min-width:200px;">
              <span style="font-size:42px;font-weight:900;color:#7c3aed;letter-spacing:10px;">${otp}</span>
            </div>
            <p style="color:#9ca3af;font-size:13px;margin:0;">Expires in <strong>10 minutes</strong>.</p>
            <p style="color:#9ca3af;font-size:13px;margin:6px 0 0;">Didn't request this? Your account is safe — ignore this email.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;">
            <p style="color:#d1d5db;font-size:12px;margin:0;">© 2025 ArtBazaar. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Verify Reset OTP ──────────────────────────────────────────
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid request' });

    if (!user.resetOTP || user.resetOTP !== otp.toString())
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP       = undefined;
      user.resetOTPExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify reset OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ success: false, message: 'Email and new password are required' });

    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ success: false, message: 'User not found' });

    user.password       = await bcrypt.hash(newPassword, 12);
    user.resetOTP       = undefined;
    user.resetOTPExpiry = undefined;
    // Also clear old token-based fields if they exist
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Get Me ────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Update Profile ────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const {
      fullName, phone, city, country, bio,
      specialty, experience, instagram, website,
      storeName, storeTagline, acceptCustomOrders,
      deliveryOptions, notifications,
    } = req.body;

    if (!fullName?.trim())
      return res.status(400).json({ success: false, message: 'Full name is required' });

    const updateData = {
      fullName:           fullName.trim(),
      phone:              phone        || '',
      city:               city         || '',
      country:            country      || 'Pakistan',
      bio:                bio          || '',
      specialty:          specialty    || '',
      experience:         experience   || '',
      instagram:          instagram    || '',
      website:            website      || '',
      storeName:          storeName    || '',
      storeTagline:       storeTagline || '',
      acceptCustomOrders: acceptCustomOrders === 'false' ? false : true,
    };

    if (deliveryOptions) {
      updateData.deliveryOptions = Array.isArray(deliveryOptions)
        ? deliveryOptions
        : JSON.parse(deliveryOptions);
    }

    if (notifications) {
      updateData.notifications = typeof notifications === 'string'
        ? JSON.parse(notifications)
        : notifications;
    }

    if (req.file) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', currentUser.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');

    return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Change Password ───────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });

    const user    = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Delete Account ────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: 'Please enter your password to confirm' });

    const user    = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Incorrect password. Account not deleted.' });

    const artworks = await Artwork.find({ artist: req.user.id });
    for (const art of artworks) {
      if (art.image) {
        const imgPath = path.join(__dirname, '..', art.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await art.deleteOne();
    }

    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Wishlist ──────────────────────────────────────────────────
const toggleWishlist = async (req, res) => {
  try {
    const { artworkId } = req.body;
    if (!artworkId)
      return res.status(400).json({ success: false, message: 'Artwork ID required' });

    const user  = await User.findById(req.user._id);
    const index = user.wishlist.findIndex(id => id.toString() === artworkId.toString());
    if (index === -1) user.wishlist.push(artworkId);
    else              user.wishlist.splice(index, 1);
    await user.save();

    return res.status(200).json({ success: true, wishlist: user.wishlist, isWishlisted: index === -1 });
  } catch (error) {
    console.error('Toggle wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path:     'wishlist',
      populate: { path: 'artist', select: 'fullName avatar city specialty' },
    });
    return res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Get wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  signup,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  toggleWishlist,
  getWishlist,
};