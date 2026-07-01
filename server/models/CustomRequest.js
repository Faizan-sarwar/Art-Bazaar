const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    buyerName:  { type: String, required: true },
    buyerAvatar:{ type: String, default: '' },

    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    sellerName: { type: String, required: true },

    title:       { type: String, required: true },
    category:    { type: String, required: true },
    style:       { type: String, default: '' },
    medium:      { type: String, default: '' },
    size:        { type: String, default: '' },
    budget:      { type: String, default: '' },
    deadline:    { type: String, default: '' },
    description: { type: String, required: true },
    colors:      [{ type: String }],

    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomRequest', customRequestSchema);