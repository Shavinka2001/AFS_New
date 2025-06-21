const Location = require('../model/Location');

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const { name, latitude, longitude, address, description } = req.body;
    
    // Basic validation
    if (!name || !latitude || !longitude || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Please provide name, coordinates and address.' 
      });
    }
    
    // Create location with user ID from token
    const location = await Location.create({
      name,
      latitude,
      longitude,
      address,
      description: description || '',
      createdBy: req.user.userId // From auth middleware
    });
    
    res.status(201).json({
      success: true,
      location
    });
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error creating location' 
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstname lastname email');
      
    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error fetching locations' 
    });
  }
};

// Get a single location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('createdBy', 'firstname lastname email');
      
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    res.json({
      success: true,
      location
    });
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error fetching location' 
    });
  }
};

// Update a location
exports.updateLocation = async (req, res) => {
  try {
    const updates = req.body;
    const locationId = req.params.id;
    
    // Find the location first to check permissions
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow the creator or admins to update
    if (location.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to update this location' 
      });
    }
    
    const updatedLocation = await Location.findByIdAndUpdate(
      locationId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstname lastname email');
    
    res.json({
      success: true,
      location: updatedLocation
    });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error updating location' 
    });
  }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    
    // Find the location first to check permissions
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow the creator or admins to delete
    if (location.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this location' 
      });
    }
    
    await Location.findByIdAndDelete(locationId);
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error deleting location' 
    });
  }
};

// Toggle location active status
exports.toggleLocationStatus = async (req, res) => {
  try {
    const locationId = req.params.id;
    
    // Find the location
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow admins to change status
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can change location status' 
      });
    }
    
    // Toggle the status
    location.isActive = !location.isActive;
    await location.save();
    
    res.json({
      success: true,
      message: `Location ${location.isActive ? 'activated' : 'deactivated'} successfully`,
      location
    });
  } catch (err) {
    console.error('Error toggling location status:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error toggling location status' 
    });
  }
};
