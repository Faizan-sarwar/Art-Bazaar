const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/authController');
const { protect }                    = require('../middleware/auth');
const { upload }                     = require('../middleware/upload');

// ── Public ────────────────────────────────────────────────────
router.post('/signup',           signup);
router.post('/login',            login);
router.post('/send-otp',         sendOTP);
router.post('/verify-otp',       verifyOTP);
router.post('/forgot-password',  forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password',   resetPassword);

// ── Protected ─────────────────────────────────────────────────
router.get   ('/me',               protect, getMe);
router.put   ('/update-profile',   protect, upload.single('avatar'), updateProfile);
router.put   ('/change-password',  protect, changePassword);
router.delete('/delete-account',   protect, deleteAccount);
router.post  ('/wishlist/toggle',  protect, toggleWishlist);
router.get   ('/wishlist',         protect, getWishlist);

module.exports = router;