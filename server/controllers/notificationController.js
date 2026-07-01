const Notification = require('../models/Notification');

// Helper — create notification (used by other controllers)
const createNotification = async ({ recipient, type, title, message, link = '' }) => {
  try {
    const notif = new Notification({ recipient, type, title, message, link });
    await notif.save();
    return notif;
  } catch (error) {
    console.error('Create notification error:', error.message);
  }
};

// GET /api/notifications — get all for logged in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read:      false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/notifications/:id/read — mark one as read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/notifications/read-all — mark all as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/notifications/:id — delete one
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id:       req.params.id,
      recipient: req.user._id,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/notifications — delete all
const deleteAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read:      false,
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAll,
  getUnreadCount,
};