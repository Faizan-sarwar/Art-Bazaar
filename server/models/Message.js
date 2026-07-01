const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Conversation',
      required: true,
    },
    sender: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    senderName:   { type: String, required: true },
    senderAvatar: { type: String, default: ''    },
    senderRole:   {
      type:     String,
      enum:     ['buyer', 'artist', 'admin'],
      required: true,
    },
    text:         { type: String, default: '', trim: true },
    image:        { type: String, default: '' },
    messageType:  {
      type:    String,
      enum:    ['text', 'image', 'payment_proof', 'payment_info'],
      default: 'text',
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);