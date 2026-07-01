const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalArtists = await User.countDocuments({ role: 'artist' });
    const totalArtworks = await Artwork.countDocuments();
    const pendingApproval = await Artwork.countDocuments({ approvalStatus: 'pending' });
    const pendingAuth = await Artwork.countDocuments({ approvalStatus: 'approved', authenticationStatus: 'unverified' });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // BUG FIX: Exclude cancelled orders from revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // BUG FIX: Real monthly revenue grouped accurately
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      stats: { totalUsers, totalBuyers, totalArtists, totalArtworks, pendingApproval, pendingAuth, totalOrders, pendingOrders, deliveredOrders, totalRevenue, monthlyRevenue },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    const total = await User.countDocuments(query);
    return res.status(200).json({ success: true, users, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });
    await Artwork.deleteMany({ artist: user._id });
    await Order.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] });
    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/artworks
const getArtworks = async (req, res) => {
  try {
    const { search, category, approvalStatus, authenticationStatus, page = 1, limit = 50 } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
    if (authenticationStatus && authenticationStatus !== 'all') query.authenticationStatus = authenticationStatus;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { artistName: { $regex: search, $options: 'i' } }];

    const artworks = await Artwork.find(query).sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit)).limit(Number(limit))
      .populate('artist', 'fullName email avatar');
    const total = await Artwork.countDocuments(query);
    const pendingCount = await Artwork.countDocuments({ approvalStatus: 'pending' });
    const approvedCount = await Artwork.countDocuments({ approvalStatus: 'approved' });
    const rejectedCount = await Artwork.countDocuments({ approvalStatus: 'rejected' });
    const unverifiedCount = await Artwork.countDocuments({ approvalStatus: 'approved', authenticationStatus: 'unverified' });
    const verifiedCount = await Artwork.countDocuments({ authenticationStatus: 'verified' });
    return res.status(200).json({ success: true, artworks, total, pendingCount, approvedCount, rejectedCount, unverifiedCount, verifiedCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/admin/artworks/:id/approve
const approveArtwork = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

    if (action === 'approve') {
      artwork.isApproved = true;
      artwork.approvalStatus = 'approved';
      artwork.rejectionReason = '';
    } else if (action === 'reject') {
      artwork.isApproved = false;
      artwork.approvalStatus = 'rejected';
      artwork.rejectionReason = reason || 'Does not meet platform guidelines';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await artwork.save();

    try {
      await Notification.create({
        recipient: artwork.artist,
        type: action === 'approve' ? 'artwork_approved' : 'artwork_rejected',
        title: action === 'approve' ? '🎉 Artwork Approved!' : '❌ Artwork Rejected',
        message: action === 'approve'
          ? `Your artwork "${artwork.title}" is now live on the marketplace!`
          : `Your artwork "${artwork.title}" was rejected. Reason: ${artwork.rejectionReason}`,
        link: '/seller/dashboard',
      });
    } catch (_) { }

    return res.status(200).json({ success: true, message: `Artwork ${action}d successfully`, artwork });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/admin/artworks/:id/authenticate
const authenticateArtwork = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'verified' | 'suspicious' | 'rejected'
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

    artwork.authenticationStatus = action;
    artwork.authenticationNote = note || '';
    artwork.isAuthenticated = action === 'verified';
    await artwork.save();

    try {
      const msgs = {
        verified: { title: '✅ Artwork Verified!', msg: `Your artwork "${artwork.title}" has been verified as authentic by ArtBazaar!` },
        suspicious: { title: '⚠️ Authentication Issue', msg: `Your artwork "${artwork.title}" flagged for review. Note: ${note}` },
        rejected: { title: '❌ Authentication Failed', msg: `Your artwork "${artwork.title}" failed authentication. Note: ${note}` },
      };
      const m = msgs[action];
      if (m) await Notification.create({ recipient: artwork.artist, type: 'artwork_auth', title: m.title, message: m.msg, link: '/seller/dashboard' });
    } catch (_) { }

    return res.status(200).json({ success: true, message: `Artwork marked as ${action}`, artwork });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/admin/artworks/:id
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    const fs = require('fs'); const path = require('path');
    if (artwork.image) { const p = path.join(__dirname, '..', artwork.image); if (fs.existsSync(p)) fs.unlinkSync(p); }
    if (artwork.proofVideo) { const p = path.join(__dirname, '..', artwork.proofVideo); if (fs.existsSync(p)) fs.unlinkSync(p); }
    for (const photo of artwork.extraPhotos || []) { const p = path.join(__dirname, '..', photo); if (fs.existsSync(p)) fs.unlinkSync(p); }
    await artwork.deleteOne();
    return res.status(200).json({ success: true, message: 'Artwork deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [
      { artworkTitle: { $regex: search, $options: 'i' } },
      { buyerName: { $regex: search, $options: 'i' } },
      { orderNumber: { $regex: search, $options: 'i' } },
    ];
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    const total = await Order.countDocuments(query);
    return res.status(200).json({ success: true, orders, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/recent
const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentArtworks = await Artwork.find().sort({ createdAt: -1 }).limit(5).select('title artistName createdAt image approvalStatus authenticationStatus');
    return res.status(200).json({ success: true, recentUsers, recentOrders, recentArtworks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getStats, getUsers, deleteUser, getArtworks, approveArtwork, authenticateArtwork, deleteArtwork, getOrders, updateOrderStatus, getRecentActivity };