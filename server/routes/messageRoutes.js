const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getOrCreateAdminConversation,
  getAdminConversations,
  getAllPlatformConversations,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/conversation', protect, getOrCreateConversation);
router.post('/admin-conversation', protect, getOrCreateAdminConversation);
router.get('/admin-conversations', protect, getAdminConversations);
router.get('/all-platform-conversations', protect, getAllPlatformConversations);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, upload.single('image'), sendMessage);

module.exports = router;