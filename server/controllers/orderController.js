const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const User = require('../models/User');
const StoreProduct = require('../models/StoreProduct');
const StoreOrder = require('../models/StoreOrder');
const { createNotification } = require('./notificationController');

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  return 'ORD-' + String(count + 1).padStart(4, '0');
};

const generateStoreOrderNumber = () =>
  'SO-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// ── Artwork Orders ────────────────────────────────────────────

const createOrder = async (req, res) => {
  try {
    const {
      artworkId, fullName, phone,
      address, city, notes, paymentMethod,
    } = req.body;

    if (!artworkId || !fullName || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const artwork = await Artwork.findById(artworkId).populate('artist', 'fullName email');
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }
    if (!artwork.isAvailable) {
      return res.status(400).json({ success: false, message: 'This artwork is no longer available' });
    }

    const orderNumber = await generateOrderNumber();

    // Map paymentMethod — frontend sends 'p2p', model accepts cod/bank/easypaisa/jazzcash
    const methodMap = {
      cod: 'cod', p2p: 'easypaisa',
      easypaisa: 'easypaisa', jazzcash: 'jazzcash', bank: 'bank',
    };
    const mappedMethod = methodMap[paymentMethod] || 'cod';

    const order = new Order({
      orderNumber,
      buyer: req.user._id,
      buyerName: req.user.fullName,
      buyerEmail: req.user.email || '',
      artwork: artwork._id,
      artworkTitle: artwork.title,
      artworkImage: artwork.image,
      artworkPrice: artwork.price,
      totalAmount: artwork.price,
      seller: artwork.artist._id,
      sellerName: artwork.artist.fullName || artwork.artistName || '',
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      notes: notes || '',
      paymentMethod: mappedMethod,
      paymentStatus: 'unpaid',
    });

    await order.save();

    await createNotification({
      recipient: req.user._id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order for "${artwork.title}" has been placed. PKR ${artwork.price.toLocaleString()}`,
      link: '/buyer/orders',
    });

    await createNotification({
      recipient: artwork.artist._id,
      type: 'order',
      title: 'New Order Received!',
      message: `${req.user.fullName} ordered "${artwork.title}" for PKR ${artwork.price.toLocaleString()}`,
      link: '/seller/orders',
    });

    // BUG FIX: Use findByIdAndUpdate to safely bypass validation errors on populated fields
    await Artwork.findByIdAndUpdate(artwork._id, {
      isAvailable: false,
      $inc: { sales: 1 }
    });

    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Create order error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const userId = req.user._id.toString();
    if (order.buyer.toString() !== userId && order.seller.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    if (status === 'delivered') order.paymentStatus = 'paid';

    // Make artwork available again if order is cancelled
    if (status === 'cancelled') {
      await Artwork.findByIdAndUpdate(order.artwork, { isAvailable: true });
    }

    await createNotification({
      recipient: order.buyer,
      type: 'order',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order "${order.artworkTitle}" status updated to: ${status}`,
      link: `/buyer/orders/${order._id}`,
    });

    await order.save();
    return res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ── Store Orders ──────────────────────────────────────────────

const createStoreOrder = async (req, res) => {
  try {
    const {
      items, fullName, phone, address, city,
      notes, paymentMethod, cardLast4, stripePaymentId,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    if (!fullName || !phone || !address || !city) {
      return res.status(400).json({ success: false, message: 'Delivery info required' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await StoreProduct.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
      }

      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        emoji: product.emoji || '🎨',
      });

      subtotal += product.price * item.quantity;
      product.stock = Math.max(0, product.stock - item.quantity);
      if (product.stock === 0) product.inStock = false;
      await product.save();
    }

    const shippingCost = subtotal >= 5000 ? 0 : 200;
    const total = subtotal + shippingCost;
    const buyer = await User.findById(req.user._id);

    const order = new StoreOrder({
      buyer: req.user._id,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email || '',
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
      status: paymentMethod === 'card' ? 'confirmed' : 'pending',
      cardLast4: cardLast4 || '',
      stripePaymentId: stripePaymentId || '',
      fullName, phone, address, city,
      notes: notes || '',
      orderNumber: generateStoreOrderNumber(),
    });

    await order.save();

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'order',
        title: '🛍️ New Store Order!',
        message: `${buyer.fullName} placed a store order — PKR ${total.toLocaleString()}`,
        link: '/admin/store-orders',
      });
    }

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create store order error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getMyStoreOrders = async (req, res) => {
  try {
    const orders = await StoreOrder.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getAllStoreOrders = async (req, res) => {
  try {
    const orders = await StoreOrder.find().sort({ createdAt: -1 }).populate('buyer', 'fullName email');
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateStoreOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await StoreOrder.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await createNotification({
      recipient: order.buyer,
      type: 'order',
      title: 'Store Order Updated',
      message: `Your store order #${order.orderNumber} is now ${status}`,
      link: '/buyer/store-orders',
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  createStoreOrder,
  getMyStoreOrders,
  getAllStoreOrders,
  updateStoreOrderStatus,
};