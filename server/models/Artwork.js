const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    category: {
      type: String, required: true,
      enum: ['Landscape','Abstract','Traditional','Modern','Calligraphy','Portraits','Other'],
    },
    medium:     { type: String, trim: true, default: '' },
    dimensions: { type: String, trim: true, default: '' },
    image:      { type: String, required: true },
    artist:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    artistName: { type: String, required: true },

    isAvailable: { type: Boolean, default: true  },
    isFeatured:  { type: Boolean, default: false },

    // ── Approval System ──────────────────────────────────────
    isApproved:      { type: Boolean, default: false },
    approvalStatus:  { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },

    // ── Authentication System ────────────────────────────────
    proofVideo:           { type: String, default: '' },   // uploaded video path
    extraPhotos:          { type: [String], default: [] }, // up to 4 extra photos
    yearCreated:          { type: String, default: '' },
    isPhysical:           { type: Boolean, default: true },
    isAuthenticated:      { type: Boolean, default: false },
    authenticationStatus: { type: String, enum: ['unverified','verified','suspicious','rejected'], default: 'unverified' },
    authenticationNote:   { type: String, default: '' },

    views:      { type: Number, default: 0 },
    sales:      { type: Number, default: 0 },
    rating:     { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artwork', artworkSchema);