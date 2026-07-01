const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    description:   { type: String, required: true },
    price:         { type: Number, required: true },
    originalPrice: { type: Number, default: null  },
    category:      {
      type: String,
      enum: ['Paints','Brushes','Canvas','Sketchbooks','Tools','Digital','Other'],
      required: true,
    },
    image:    { type: String, default: '' },
    emoji:    { type: String, default: '🎨' },
    gradient: { type: String, default: 'from-purple-100 to-pink-100' },
    badge:    { type: String, default: '' },
    inStock:  { type: Boolean, default: true },
    stock:    { type: Number,  default: 10   },
    featured: { type: Boolean, default: false },
    stripePaymentId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreProduct', storeProductSchema);