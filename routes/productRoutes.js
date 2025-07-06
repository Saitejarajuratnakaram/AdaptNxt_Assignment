const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Seed products
router.post('/seed', productController.seedProducts);

// List products with pagination and search
router.get('/', productController.getProducts);

// Admin: Create product
router.post('/', auth, role('admin'), productController.createProduct);
// Admin: Update product
router.put('/:id', auth, role('admin'), productController.updateProduct);
// Admin: Delete product
router.delete('/:id', auth, role('admin'), productController.deleteProduct);

module.exports = router;
