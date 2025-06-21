const Location = require('../models/location');

// Create new location
exports.createLocation = async (req, res) => {
  try {
    // Add the user ID who's creating this location
    const locationData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const location = new Location(locationData);
    const savedLocation = await location.save();
    
    res.status(201).json({
      success: true,
      data: savedLocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create location'
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const locations = await Location.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Location.countDocuments();
    
    res.json({
      success: true,
      count: locations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch locations'
    });
  }
};

// Get single location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch location'
    });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedLocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    await Location.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete location'
    });
  }
};

// Search locations by name, address or type
exports.searchLocations = async (req, res) => {
  try {
    const { query, type } = req.query;
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (type) {
      searchQuery.type = type;
    }
    
    const locations = await Location.find(searchQuery);
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search locations'
    });
  }
};

// Get locations near a specific point
exports.getNearbyLocations = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Convert maxDistance from kilometers to meters (default: 10km)
    const radius = parseFloat(maxDistance) || 10;
    
    const locations = await Location.find({
      'coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    });
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get nearby locations'
    });
  }
};
