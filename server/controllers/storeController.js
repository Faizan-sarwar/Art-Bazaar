const StoreProduct = require('../models/StoreProduct');

// GET /api/store — public
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await StoreProduct.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/store — admin only
const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, emoji, gradient, badge,
      inStock, stock, featured,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, description, price, category required' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const product = new StoreProduct({
      name,
      description,
      price:         Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      emoji:         emoji    || '🎨',
      gradient:      gradient || 'from-purple-100 to-pink-100',
      badge:         badge    || '',
      // FormData sends booleans as strings — must compare with string 'true'
      inStock:       inStock  === 'true' || inStock  === true,
      stock:         Number(stock)  || 0,
      featured:      featured === 'true' || featured === true,
      image,
    });

    await product.save();
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/store/:id — admin only
const updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, emoji, gradient, badge,
      inStock, stock, featured,
    } = req.body;

    const updates = {
      name,
      description,
      category,
      emoji,
      gradient,
      badge,
      price:         Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock:         Number(stock) || 0,
      // FormData sends booleans as strings — must compare with string 'true'
      inStock:       inStock  === 'true' || inStock  === true,
      featured:      featured === 'true' || featured === true,
    };

    // Only update image if a new file was uploaded
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const product = await StoreProduct.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/store/:id — admin only
const deleteProduct = async (req, res) => {
  try {
    await StoreProduct.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };