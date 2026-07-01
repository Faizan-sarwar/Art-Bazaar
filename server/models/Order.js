const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    buyerName:  { type: String, required: true },
    buyerEmail: { type: String, required: true },

    artwork: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Artwork',
      required: true,
    },
    artworkTitle: { type: String, required: true },
    artworkImage: { type: String, required: true },
    artworkPrice: { type: Number, required: true },

    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    sellerName: { type: String, required: true },

    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    notes:    { type: String, default: '' },

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentMethod: {
      type:    String,
      enum:    ['cod', 'bank', 'easypaisa', 'jazzcash'],
      default: 'cod',
    },
    paymentStatus: {
      type:    String,
      enum:    ['unpaid', 'paid'],
      default: 'unpaid',
    },

    totalAmount:  { type: Number, required: true },
    orderNumber:  { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);