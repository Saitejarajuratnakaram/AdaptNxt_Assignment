const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Place an order from current cart
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ user: req.user.userId, items, total });
    // Clear cart
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
};

// Get current user's orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};
