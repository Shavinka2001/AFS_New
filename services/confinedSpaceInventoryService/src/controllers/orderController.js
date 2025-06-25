const Order = require('../../src/model/order.js');
const path = require('path');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Handle file uploads
    const pictures = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Store the relative path to be accessed via API
        const imagePath = `/uploads/${file.filename}`;
        pictures.push(imagePath);
      });
    }
    // Merge file paths with other data
    let allPictures = [];
    // If client sent existing pictures as JSON string, merge them
    if (req.body.pictures && typeof req.body.pictures === 'string') {
      try {
        const parsedPictures = JSON.parse(req.body.pictures);
        if (Array.isArray(parsedPictures)) {
          allPictures = parsedPictures;
        }
      } catch (e) {
        // fallback: comma separated
        if (req.body.pictures.includes(',')) {
          allPictures = req.body.pictures.split(',');
        } else if (req.body.pictures) {
          allPictures = [req.body.pictures];
        }
      }
    }
    allPictures = [...allPictures, ...pictures].filter(Boolean).slice(0, 3); // Limit to 3 images
    const orderData = { 
      ...req.body,
      pictures: allPictures
    };

    const order = new Order(orderData);
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

// Get orders by userId
exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders for current user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search orders by various fields
exports.searchOrders = async (req, res) => {
  try {
    const query = {};
    
    // Support searching by various fields
    if (req.query.uniqueId) query.uniqueId = { $regex: req.query.uniqueId, $options: 'i' };
    if (req.query.confinedSpaceNameOrId) query.confinedSpaceNameOrId = { $regex: req.query.confinedSpaceNameOrId, $options: 'i' };
    if (req.query.building) query.building = { $regex: req.query.building, $options: 'i' };
    
    // Handle boolean fields with string values
    if (req.query.confinedSpace) query.confinedSpace = req.query.confinedSpace === 'true';
    if (req.query.permitRequired) query.permitRequired = req.query.permitRequired === 'true';
    
    const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single order by id
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
    // Get existing order to handle pictures
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return res.status(404).json({ error: 'Order not found' });

    // Start with existing images from DB
    let pictures = existingOrder.pictures || [];

    // Parse pictures from request body (existing images to keep)
    let keepPictures = [];
    if (req.body.pictures && typeof req.body.pictures === 'string') {
      try {
        const parsedPictures = JSON.parse(req.body.pictures);
        if (Array.isArray(parsedPictures)) {
          keepPictures = parsedPictures;
        }
      } catch (e) {
        if (req.body.pictures.includes(',')) {
          keepPictures = req.body.pictures.split(',');
        } else if (req.body.pictures) {
          keepPictures = [req.body.pictures];
        }
      }
    }

    // Add new uploaded files (if any)
    let newPictures = [];
    if (req.files && req.files.length > 0) {
      newPictures = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Merge: keepPictures (from client) + newPictures (uploaded now)
    pictures = [...keepPictures, ...newPictures]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    // Prepare update data
    const updateData = {
      ...req.body,
      pictures
    };

    // Remove any JSON stringified fields that might cause issues
    delete updateData.pictures_json;
    delete updateData.replaceImages;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

