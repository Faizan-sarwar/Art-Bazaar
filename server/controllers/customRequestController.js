const CustomRequest = require('../models/CustomRequest');
const User          = require('../models/User');
const { createNotification } = require('./notificationController');

// POST /api/custom-requests — buyer creates
const createRequest = async (req, res) => {
  try {
    const {
      sellerId, title, category, style,
      medium, size, budget, deadline,
      description, colors,
    } = req.body;

    if (!sellerId || !title || !category || !description) {
      return res.status(400).json({ success: false, message: 'sellerId, title, category, description required' });
    }

    const buyer  = await User.findById(req.user._id);
    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const request = new CustomRequest({
      buyer:       req.user._id,
      buyerName:   buyer.fullName,
      buyerAvatar: buyer.avatar || '',
      seller:      sellerId,
      sellerName:  seller.fullName,
      title,
      category,
      style:       style       || '',
      medium:      medium      || '',
      size:        size        || '',
      budget:      budget      || '',
      deadline:    deadline    || '',
      description,
      colors:      colors      || [],
    });

    await request.save();

    // Notify seller
    await createNotification({
      recipient: sellerId,
      type:      'order',
      title:     'New Custom Request!',
      message:   `${buyer.fullName} sent a custom request: "${title}"`,
      link:      '/seller/custom-requests',
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Create custom request error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/custom-requests/seller — seller gets their requests
const getSellerRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/custom-requests/buyer — buyer gets their sent requests
const getBuyerRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({ buyer: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/custom-requests/:id/respond — seller accepts or declines
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or declined' });
    }

    const request = await CustomRequest.findOne({
      _id:    req.params.id,
      seller: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    // Notify buyer
    await createNotification({
      recipient: request.buyer,
      type:      'order',
      title:     status === 'accepted'
        ? '🎉 Custom Request Accepted!'
        : 'Custom Request Declined',
      message: status === 'accepted'
        ? `${request.sellerName} accepted your request for "${request.title}". Check your messages!`
        : `${request.sellerName} declined your request for "${request.title}".`,
      link: '/buyer/messages',
    });

    return res.status(200).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/custom-requests/:id — buyer deletes
const deleteRequest = async (req, res) => {
  try {
    await CustomRequest.findOneAndDelete({
      _id:   req.params.id,
      buyer: req.user._id,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/custom-requests/sellers — get all artists for buyer to choose from
const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'artist' })
      .select('fullName avatar city specialty bio')
      .limit(20);

    return res.status(200).json({ success: true, sellers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createRequest,
  getSellerRequests,
  getBuyerRequests,
  respondToRequest,
  deleteRequest,
  getSellers,
};