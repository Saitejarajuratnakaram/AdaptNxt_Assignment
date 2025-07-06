const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.post('/', orderController.placeOrder);
router.get('/', orderController.getOrders);

module.exports = router;
