const Artwork = require('../models/Artwork');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// GET /api/artworks
const getAllArtworks = async (req, res) => {
  try {
    const { search, category, isApproved, trending, limit = 20, page = 1 } = req.query;
    const query = {};

    // 1. Approval Filter
    if (isApproved === 'true') query.isApproved = true;

    // 2. Fix for Priority #11: Category Filter Case Mismatch Bug
    if (category && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i'); // Case-insensitive exact match
    }

    // 3. Search Filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Fix for Priority #5: Trending Logic (Highest views in last 30 days)
    let sortObj = { createdAt: -1 };
    if (trending === 'true') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: thirtyDaysAgo };
      sortObj = { views: -1 }; // Sort by most views
    }

    const artworks = await Artwork.find(query)
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('artist', 'fullName avatar city specialty');

    const total = await Artwork.countDocuments(query);

    return res.status(200).json({ success: true, artworks, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/artworks/:id
const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate('artist', 'fullName email avatar city specialty bio');
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

    // Fix for Priority #4: Real View Count System
    // We check the JWT. If the viewer is an Admin or the Artist who created it, DO NOT count the view.
    let shouldCountView = true;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user && (user.role === 'admin' || user._id.toString() === artwork.artist._id.toString())) {
          shouldCountView = false;
        }
      } catch (e) {
        // If token fails, they are treated as a guest (so we count the view)
      }
    }

    if (shouldCountView) {
      artwork.views = (artwork.views || 0) + 1;
      await Artwork.findByIdAndUpdate(artwork._id, { views: artwork.views });
    }

    return res.status(200).json({ success: true, artwork });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/artworks/my
const getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, artworks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/artworks/upload
const uploadArtwork = async (req, res) => {
  try {
    if (!req.files?.image?.[0] && !req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageFile = req.files?.image?.[0] || req.file;
    const { title, description, price, category, medium, dimensions, tags, yearCreated, isPhysical } = req.body;

    if (!title || !description || !price || !category) {
      fs.unlinkSync(imageFile.path);
      return res.status(400).json({ success: false, message: 'Title, description, price and category are required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      fs.unlinkSync(imageFile.path);
      return res.status(400).json({ success: false, message: 'Please enter a valid price' });
    }

    let proofVideoPath = '';
    if (req.files?.proofVideo?.[0]) {
      proofVideoPath = `/uploads/${req.files.proofVideo[0].filename}`;
    }

    const extraPhotosPaths = [];
    if (req.files?.extraPhotos) {
      req.files.extraPhotos.forEach(file => extraPhotosPaths.push(`/uploads/${file.filename}`));
    }

    const artwork = new Artwork({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      medium: medium || '',
      dimensions: dimensions || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      yearCreated: yearCreated || new Date().getFullYear(),
      isPhysical: isPhysical === 'true',
      image: `/uploads/${imageFile.filename}`,
      proofVideo: proofVideoPath,
      extraPhotos: extraPhotosPaths,
      artist: req.user._id,
      artistName: req.user.fullName,

      // Starts as pending approval
      isApproved: false,
      approvalStatus: 'pending',
    });

    await artwork.save();
    return res.status(201).json({ success: true, message: 'Artwork uploaded. Pending admin approval.', artwork });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/artworks/:id
const updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { title, description, price, category, medium, dimensions, tags, isAvailable } = req.body;

    if (title) artwork.title = title;
    if (description) artwork.description = description;
    if (price) artwork.price = parseFloat(price);
    if (category) artwork.category = category;
    if (medium) artwork.medium = medium;
    if (dimensions) artwork.dimensions = dimensions;
    if (tags) artwork.tags = tags.split(',').map(t => t.trim());
    if (isAvailable !== undefined) artwork.isAvailable = isAvailable === 'true' || isAvailable === true;

    // Reset approval if edited
    artwork.isApproved = false;
    artwork.approvalStatus = 'pending';
    artwork.rejectionReason = '';

    const updated = await artwork.save();
    return res.status(200).json({ success: true, message: 'Artwork updated. Pending re-approval.', artwork: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/artworks/:id
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    if (artwork.image) {
      const imgPath = path.join(__dirname, '..', artwork.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (artwork.proofVideo) {
      const vPath = path.join(__dirname, '..', artwork.proofVideo);
      if (fs.existsSync(vPath)) fs.unlinkSync(vPath);
    }

    for (const photo of artwork.extraPhotos || []) {
      const pPath = path.join(__dirname, '..', photo);
      if (fs.existsSync(pPath)) fs.unlinkSync(pPath);
    }

    await artwork.deleteOne();
    return res.status(200).json({ success: true, message: 'Artwork deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getAllArtworks,
  getArtworkById,
  getMyArtworks,
  uploadArtwork,
  updateArtwork,
  deleteArtwork
};