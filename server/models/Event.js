const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type:    String,
      enum:    ['event', 'workshop', 'competition', 'news'],
      required: true,
    },
    image:       { type: String, default: '' },
    date:        { type: String, required: true },
    location:    { type: String, default: '' },
    price:       { type: Number, default: null },
    prize:       { type: Number, default: null },
    organizer:   { type: String, default: 'ArtBazaar' },
    capacity:    { type: Number, default: null },
    attendees:   { type: Number, default: 0 },
    readTime:    { type: String, default: '' },
    featured:    { type: Boolean, default: false },
    active:      { type: Boolean, default: true  },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);