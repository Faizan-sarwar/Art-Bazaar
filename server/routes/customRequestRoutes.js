const express = require('express');
const router  = express.Router();
const {
  createRequest,
  getSellerRequests,
  getBuyerRequests,
  respondToRequest,
  deleteRequest,
  getSellers,
} = require('../controllers/customRequestController');
const { protect } = require('../middleware/auth');

router.get('/sellers',        protect, getSellers);
router.post('/',              protect, createRequest);
router.get('/seller',         protect, getSellerRequests);
router.get('/buyer',          protect, getBuyerRequests);
router.put('/:id/respond',    protect, respondToRequest);
router.delete('/:id',         protect, deleteRequest);

module.exports = router;