const Order = require('../../src/model/order.js');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({ ...req.body });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all orders (admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders by userId (for frontend)
exports.getOrdersByUserId = async (req, res) => {
  console.log(`Fetching orders for userId: ${req.params.userId}`);
  
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search orders by query parameters
exports.searchOrders = async (req, res) => {
  try {
    const query = {};

    if (req.query.dateOfSurvey) query.dateOfSurvey = new Date(req.query.dateOfSurvey);
    if (req.query.surveyor) query.surveyors = { $in: [req.query.surveyor] };
    if (req.query.confinedSpaceNameOrId) {
      query.confinedSpaceNameOrId = { $regex: req.query.confinedSpaceNameOrId, $options: 'i' };
    }
    if (req.query.building) {
      query.building = { $regex: req.query.building, $options: 'i' };
    }

    const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
