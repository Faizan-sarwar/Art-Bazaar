const express = require('express');
const router  = express.Router();
const {
  createReview,
  getArtworkReviews,
  getSellerReviews,
  getBuyerReviews,
  checkReviewed,
  replyToReview,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/',                      protect, createReview);
router.get('/artwork/:artworkId',     getArtworkReviews);
router.get('/seller',                 protect, getSellerReviews);
router.get('/buyer',                  protect, getBuyerReviews);
router.get('/check/:orderId',         protect, checkReviewed);
router.post('/:id/reply',             protect, replyToReview);
router.get('/all',                    protect, restrictTo('admin'), getAllReviews);

module.exports = router;