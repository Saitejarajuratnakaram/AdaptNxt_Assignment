const Product = require('../models/Product');

// Seed initial products
exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Products already seeded.' });
    const products = [
      { name: 'Classic T-shirt', description: '100% cotton, unisex', price: 20, category: 'Clothing', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', stock: 100 },
      { name: 'Running Sneakers', description: 'Lightweight, breathable', price: 50, category: 'Footwear', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', stock: 50 },
      { name: 'Travel Backpack', description: 'Water-resistant, 30L', price: 35, category: 'Accessories', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', stock: 30 },
      { name: 'Blue Denim Jeans', description: 'Slim fit, stretchable', price: 40, category: 'Clothing', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', stock: 60 },
      { name: 'Digital Watch', description: 'Waterproof, LED display', price: 80, category: 'Accessories', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', stock: 20 },
      { name: 'Wireless Earbuds', description: 'Noise cancelling, 24h battery', price: 60, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', stock: 40 },
      { name: 'Yoga Mat', description: 'Non-slip, eco-friendly', price: 25, category: 'Fitness', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', stock: 70 },
      { name: 'Coffee Mug', description: 'Ceramic, 350ml', price: 12, category: 'Home', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', stock: 90 },
      { name: 'Desk Lamp', description: 'LED, adjustable', price: 30, category: 'Home', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', stock: 25 },
      { name: 'Bluetooth Speaker', description: 'Portable, waterproof', price: 45, category: 'Electronics', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', stock: 35 }
    ];
    await Product.insertMany(products);
    res.status(201).json({ message: 'Products seeded.' });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding products', error: err.message });
  }
};

// GET /products - List all products with pagination and search
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, category } = req.query;
    const query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// Admin: Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }
    const product = await Product.create({ name, description, price, category, image, stock });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// Admin: Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// Admin: Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

// ... (other product controller functions will be added here)
