const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// POST /api/messages/conversation
const getOrCreateConversation = async (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID required' });
    }
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    const buyerId = req.user._id;
    let conversation = await Conversation.findOne({ buyer: buyerId, seller: sellerId });
    if (!conversation) {
      conversation = new Conversation({
        buyer: buyerId,
        seller: sellerId,
        buyerName: req.user.fullName,
        sellerName: seller.fullName,
        buyerAvatar: req.user.avatar || '',
        sellerAvatar: seller.avatar || '',
        lastMessage: '',
        lastMessageAt: new Date(),
        isAdminChat: false,
      });
      await conversation.save();
    }
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/messages/admin-conversation — buyer starts chat with admin
const getOrCreateAdminConversation = async (req, res) => {
  try {
    const buyerId = req.user._id;
    let conversation = await Conversation.findOne({
      buyer: buyerId, isAdminChat: true,
    });
    if (!conversation) {
      conversation = new Conversation({
        buyer: buyerId,
        seller: null,
        buyerName: req.user.fullName,
        sellerName: 'ArtBazaar Support',
        buyerAvatar: req.user.avatar || '',
        sellerAvatar: '',
        lastMessage: '',
        lastMessageAt: new Date(),
        isAdminChat: true,
        buyerUnread: 0,
        sellerUnread: 0,
      });
      await conversation.save();
    }
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let conversations;

    if (role === 'admin') {
      conversations = await Conversation.find({ isAdminChat: true })
        .sort({ lastMessageAt: -1 });
    } else if (role === 'artist') {
      conversations = await Conversation.find({ seller: userId })
        .sort({ lastMessageAt: -1 });
    } else {
      conversations = await Conversation.find({
        buyer: userId,
        isAdminChat: { $ne: true },
      }).sort({ lastMessageAt: -1 });
    }

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/messages/admin-conversations — admin sees all admin chats
const getAdminConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ isAdminChat: true })
      .sort({ lastMessageAt: -1 });
    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/messages/all-platform-conversations — ADMIN MONITORING ONLY
const getAllPlatformConversations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for monitoring' });
    }
    const conversations = await Conversation.find({ isAdminChat: { $ne: true } })
      .sort({ lastMessageAt: -1 });
    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    const role = req.user.role;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isBuyer = conversation.buyer?.toString() === userId;
    const isSeller = conversation.seller?.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    // FIX: Only mark as read if the user is actually participating in the chat
    if (role === 'artist') {
      await Message.updateMany({ conversation: conversationId, senderRole: 'buyer', read: false }, { read: true });
      await Conversation.findByIdAndUpdate(conversationId, { sellerUnread: 0 });
    } else if (role === 'buyer') {
      await Message.updateMany({ conversation: conversationId, senderRole: { $in: ['artist', 'admin'] }, read: false }, { read: true });
      await Conversation.findByIdAndUpdate(conversationId, { buyerUnread: 0 });
    } else if (role === 'admin' && conversation.isAdminChat) {
      // Admin only marks messages as read in actual Support Chats
      await Message.updateMany({ conversation: conversationId, senderRole: 'buyer', read: false }, { read: true });
      await Conversation.findByIdAndUpdate(conversationId, { sellerUnread: 0 });
    }

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, messageType } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID required' });
    }
    if (!text?.trim() && !req.file) {
      return res.status(400).json({ success: false, message: 'Text or image required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userId = req.user._id.toString();
    const role = req.user.role;
    const isBuyer = conversation.buyer?.toString() === userId;
    const isSeller = conversation.seller?.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Block Admin from replying to monitored peer-to-peer chats
    if (isAdmin && !conversation.isAdminChat) {
      return res.status(403).json({ success: false, message: 'Admins cannot reply to monitored chats.' });
    }

    let senderRole = 'buyer';
    if (role === 'artist') senderRole = 'artist';
    if (role === 'admin') senderRole = 'admin';

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const finalType = messageType ||
      (req.file && messageType === 'payment_proof' ? 'payment_proof' : req.file ? 'image' : 'text');

    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      senderName: req.user.fullName,
      senderAvatar: req.user.avatar || '',
      senderRole,
      text: text?.trim() || '',
      image,
      messageType: finalType,
      read: false,
    });

    await message.save();

    let recipientId = null;
    let notifLink = '/buyer/messages';
    if (senderRole === 'buyer') {
      recipientId = conversation.seller;
      notifLink = conversation.isAdminChat ? '/admin/chat' : '/seller/chat';
    } else if (senderRole === 'artist') {
      recipientId = conversation.buyer;
      notifLink = '/buyer/messages';
    } else if (senderRole === 'admin') {
      recipientId = conversation.buyer;
      notifLink = '/buyer/support';
    }

    if (recipientId) {
      await createNotification({
        recipient: recipientId,
        type: 'message',
        title: 'New Message',
        message: `${req.user.fullName}: ${text?.slice(0, 60) || '📷 Image'}`,
        link: notifLink,
      });
    }

    const updateData = {
      lastMessage: text?.trim() || '📷 Image',
      lastMessageAt: new Date(),
    };
    if (senderRole === 'buyer') updateData.$inc = { sellerUnread: 1 };
    if (senderRole === 'artist') updateData.$inc = { buyerUnread: 1 };
    if (senderRole === 'admin') updateData.$inc = { buyerUnread: 1 };

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    return res.status(201).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getOrCreateAdminConversation,
  getAdminConversations,
  getAllPlatformConversations,
  getConversations,
  getMessages,
  sendMessage,
};