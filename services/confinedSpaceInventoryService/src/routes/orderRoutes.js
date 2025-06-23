const express = require('express');
const router = express.Router();
const orderController = require('../../src/controllers/orderController.js');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');

// Authentication middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Protected routes
router.post('/', protect, upload.array('images', 3), orderController.createOrder);
router.get('/', protect, orderController.getOrders); // Admin: all orders
router.get('/user/:userId', protect, orderController.getOrdersByUserId); // Get orders by specific userId
router.get('/my-orders', protect, orderController.getMyOrders); // Get current user's orders
router.get('/search', protect, orderController.searchOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id', protect, upload.array('images', 3), orderController.updateOrder);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router;
