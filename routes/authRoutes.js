const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin: Get all users and their orders
router.get('/admin/users-orders', auth, role('admin'), authController.getAllUsersWithOrders);

module.exports = router;
