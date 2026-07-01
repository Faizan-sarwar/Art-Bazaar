const Review  = require('../models/Review');
const Order   = require('../models/Order');
const Artwork = require('../models/Artwork');
const { createNotification } = require('./notificationController');

// POST /api/reviews — buyer submits review
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, rating and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check order exists and belongs to buyer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review delivered orders',
      });
    }

    // Check not already reviewed
    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    }

    const review = new Review({
      buyer:        req.user._id,
      buyerName:    req.user.fullName,
      buyerAvatar:  req.user.avatar || '',
      artwork:      order.artwork,
      artworkTitle: order.artworkTitle,
      seller:       order.seller,
      order:        orderId,
      rating:       Number(rating),
      comment:      comment.trim(),
    });

    await review.save();

    // Notify seller
await createNotification({
  recipient: order.seller,
  type:      'review',
  title:     `New ${rating}-Star Review!`,
  message:   `${req.user.fullName} reviewed "${order.artworkTitle}": "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`,
  link:      '/seller/reviews',
});

    // Update artwork average rating
    const allReviews = await Review.find({ artwork: order.artwork });
    const avgRating  = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;

    await Artwork.findByIdAndUpdate(order.artwork, {
      rating:     Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    }
    console.error('Create review error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/reviews/artwork/:artworkId — get reviews for an artwork
const getArtworkReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ artwork: req.params.artworkId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get artwork reviews error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/reviews/seller — seller gets their reviews
const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get seller reviews error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/reviews/buyer — buyer gets their reviews
const getBuyerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ buyer: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get buyer reviews error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/reviews/check/:orderId — check if buyer already reviewed
const checkReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({
      order: req.params.orderId,
      buyer: req.user._id,
    });

    return res.status(200).json({
      success:    true,
      hasReviewed: !!review,
      review:     review || null,
    });
  } catch (error) {
    console.error('Check review error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// POST /api/reviews/:id/reply — seller replies to review
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required',
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    review.reply = reply.trim();
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      review,
    });
  } catch (error) {
    console.error('Reply review error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/reviews/all — admin gets all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get all reviews error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

module.exports = {
  createReview,
  getArtworkReviews,
  getSellerReviews,
  getBuyerReviews,
  checkReviewed,
  replyToReview,
  getAllReviews,
};