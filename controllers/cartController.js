const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    res.json(cart || { user: req.user.userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.user.userId, items: [{ product: productId, quantity }] });
    } else {
      const item = cart.items.find(i => i.product.toString() === productId);
      if (item) {
        item.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity) return res.status(400).json({ message: 'Quantity required' });
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart item', error: err.message });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items.id(itemId).remove();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error removing cart item', error: err.message });
  }
};
