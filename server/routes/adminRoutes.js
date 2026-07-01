const express = require('express');
const router  = express.Router();
const {
  getStats, getUsers, deleteUser,
  getArtworks, approveArtwork, authenticateArtwork, deleteArtwork,
  getOrders, updateOrderStatus, getRecentActivity,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const adminOnly = [protect, restrictTo('admin')];

router.get   ('/stats',                       ...adminOnly, getStats);
router.get   ('/users',                       ...adminOnly, getUsers);
router.delete('/users/:id',                   ...adminOnly, deleteUser);
router.get   ('/artworks',                    ...adminOnly, getArtworks);
router.put   ('/artworks/:id/approve',        ...adminOnly, approveArtwork);
router.put   ('/artworks/:id/authenticate',   ...adminOnly, authenticateArtwork);
router.delete('/artworks/:id',                ...adminOnly, deleteArtwork);
router.get   ('/orders',                      ...adminOnly, getOrders);
router.put   ('/orders/:id/status',           ...adminOnly, updateOrderStatus);
router.get   ('/recent',                      ...adminOnly, getRecentActivity);

module.exports = router;