const mongoose = require('mongoose');

const storeOrderSchema = new mongoose.Schema({
  buyer:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName:       { type: String, default: '' },
  buyerEmail:      { type: String, default: '' },
  items: [{
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'StoreProduct' },
    productName: { type: String },
    price:       { type: Number },
    quantity:    { type: Number },
    emoji:       { type: String, default: '🎨' },
  }],
  subtotal:        { type: Number, required: true },
  shippingCost:    { type: Number, default: 0 },
  total:           { type: Number, required: true },
  fullName:        { type: String, required: true },
  phone:           { type: String, required: true },
  address:         { type: String, required: true },
  city:            { type: String, required: true },
  notes:           { type: String, default: '' },
  paymentMethod:   { type: String, enum: ['cod', 'card'], default: 'cod' },
  paymentStatus:   { type: String, enum: ['pending', 'paid'], default: 'pending' },
  stripePaymentId: { type: String, default: '' },
  cardLast4:       { type: String, default: '' },
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  orderNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('StoreOrder', storeOrderSchema);