const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    buyerName:   { type: String, required: true },
    buyerAvatar: { type: String, default: '' },

    artwork: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Artwork',
      required: true,
    },
    artworkTitle: { type: String, required: true },

    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
    },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    reply:   { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per order
reviewSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);