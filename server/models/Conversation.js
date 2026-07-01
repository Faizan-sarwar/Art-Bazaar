const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      default:  null,
    },
    buyerName:    { type: String, required: true },
    sellerName:   { type: String, default: ''    },
    buyerAvatar:  { type: String, default: ''    },
    sellerAvatar: { type: String, default: ''    },
    lastMessage:  { type: String, default: ''    },
    lastMessageAt:{ type: Date,   default: Date.now },
    buyerUnread:  { type: Number, default: 0 },
    sellerUnread: { type: Number, default: 0 },
    isAdminChat:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

conversationSchema.index({ buyer: 1, seller: 1 }, { unique: true, sparse: true });
conversationSchema.index({ buyer: 1, isAdminChat: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);