const express = require('express');
const router  = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/storeController');
const { createStoreOrder, getMyStoreOrders, getAllStoreOrders, updateStoreOrderStatus } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ── Store Orders (MUST be before /:id routes) ─────────────────
router.post('/orders',           protect,                      createStoreOrder);
router.get('/orders/my',         protect,                      getMyStoreOrders);
router.get('/orders/admin',      protect, restrictTo('admin'), getAllStoreOrders);
router.put('/orders/:id/status', protect, restrictTo('admin'), updateStoreOrderStatus);

// ── Store Products ────────────────────────────────────────────
router.get('/',       getProducts);
router.post('/',      protect, restrictTo('admin'), upload.single('image'), createProduct);
router.put('/:id',    protect, restrictTo('admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;