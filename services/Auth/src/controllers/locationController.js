const Location = require('../model/Location');
const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');

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

// Assign technicians to a location
exports.assignTechnicians = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { technicianIds } = req.body;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    if (!locationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Location ID is required' 
      });
    }

    if (!technicianIds || !Array.isArray(technicianIds)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Technician IDs array is required' 
      });
    }
    
    // Special case: Allow non-admin technicians to detach themselves from a location
    // This is used for the "Close Work" functionality
    const isSelfDetachment = !isAdmin && technicianIds.length === 0;

    // Find the location
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `Location with ID ${locationId} not found` 
      });
    }

    // Get currently assigned technicians to identify which ones to remove
    const previouslyAssignedTechs = [...location.assignedTechnicians];
    const techsToRemove = previouslyAssignedTechs.filter(
      techId => !technicianIds.includes(techId.toString())
    );    // For self-detachment, we need to check if the user is assigned to this location
    if (isSelfDetachment) {
      // Verify the user is actually assigned to this location
      if (!previouslyAssignedTechs.includes(userId) && 
          !previouslyAssignedTechs.some(id => id.toString() === userId)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'You are not assigned to this location'
        });
      }
      
      // If it's a self-detachment, we only remove the current user
      techsToRemove.push(userId);
    }
    // Admin is adding/updating technicians - do the regular checks
    else if (!isSelfDetachment) {
      // Check if any of the new technicians are already assigned to another location
      for (const techId of technicianIds) {
        // Skip technicians that are already assigned to this location
        if (previouslyAssignedTechs.includes(techId.toString())) {
          continue;
        }
        
        const technician = await User.findById(techId);
        
        if (technician && technician.assignedLocations && technician.assignedLocations.length > 0) {
          // Check if the technician is assigned to a different location
          const otherLocations = technician.assignedLocations.filter(
            locId => locId.toString() !== locationId
          );
          
          if (otherLocations.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              message: `Technician ${technician.firstname} ${technician.lastname} is already assigned to another location. A technician can only be assigned to one location at a time.`
            });
          }
        }
      }
    }
      if (isSelfDetachment) {
      // For self-detachment, just remove the user from the location's technicians
      location.assignedTechnicians = location.assignedTechnicians.filter(
        techId => techId.toString() !== userId
      );
      await location.save();
      
      // Remove this location from the user's assignedLocations
      await User.findByIdAndUpdate(
        userId,
        { $pull: { assignedLocations: locationId } },
        { new: true }
      );
    } else {
      // Regular admin update
      // Update the location with the new technicians
      location.assignedTechnicians = technicianIds;
      await location.save();
  
      // Update each technician user by adding this location to their assignedLocations
      for (const techId of technicianIds) {
        // First remove any existing location assignments
        await User.findByIdAndUpdate(
          techId,
          { $set: { assignedLocations: [locationId] } }, // Replace with just this location
          { new: true }
        );
      }
    }

    // For technicians who were removed, update their assignedLocations as well
    for (const techId of techsToRemove) {
      await User.findByIdAndUpdate(
        techId,
        { $pull: { assignedLocations: locationId } },
        { new: true }
      );
    }

    res.status(StatusCodes.OK).json({
      message: 'Technicians assigned successfully',
      location
    });
  } catch (error) {
    console.error('Error in assignTechnicians:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error assigning technicians', 
      error: error.message
    });
  }
};

// Get all locations assigned to the logged-in technician
exports.getAssignedLocations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all locations where the user is an assigned technician
    const locations = await Location.find({ assignedTechnicians: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstname lastname email')
      .populate('assignedTechnicians', 'firstname lastname email');
    
    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (err) {
    console.error('Error fetching assigned locations:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error fetching assigned locations' 
    });
  }
};

// Add building to location
exports.addBuildingToLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { name, description } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Building name is required' 
      });
    }
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow the creator or admins to add buildings
    if (location.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to add buildings to this location' 
      });
    }
    
    // Check if building name already exists in this location
    const existingBuilding = location.buildings.find(building => 
      building.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingBuilding) {
      return res.status(400).json({ 
        success: false, 
        message: 'A building with this name already exists in this location' 
      });
    }
    
    // Add new building
    location.buildings.push({
      name: name.trim(),
      description: description || '',
      isActive: true
    });
    
    await location.save();
    
    res.status(201).json({
      success: true,
      message: 'Building added successfully',
      location
    });
  } catch (err) {
    console.error('Error adding building to location:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error adding building to location' 
    });
  }
};

// Update building in location
exports.updateBuildingInLocation = async (req, res) => {
  try {
    const { locationId, buildingId } = req.params;
    const { name, description, isActive } = req.body;
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow the creator or admins to update buildings
    if (location.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to update buildings in this location' 
      });
    }
    
    const building = location.buildings.id(buildingId);
    
    if (!building) {
      return res.status(404).json({ 
        success: false, 
        message: 'Building not found' 
      });
    }
    
    // Check if building name already exists in this location (excluding current building)
    if (name && name !== building.name) {
      const existingBuilding = location.buildings.find(b => 
        b._id.toString() !== buildingId && 
        b.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingBuilding) {
        return res.status(400).json({ 
          success: false, 
          message: 'A building with this name already exists in this location' 
        });
      }
    }
    
    // Update building fields
    if (name) building.name = name.trim();
    if (description !== undefined) building.description = description;
    if (isActive !== undefined) building.isActive = isActive;
    
    await location.save();
    
    res.json({
      success: true,
      message: 'Building updated successfully',
      location
    });
  } catch (err) {
    console.error('Error updating building:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error updating building' 
    });
  }
};

// Delete building from location
exports.deleteBuildingFromLocation = async (req, res) => {
  try {
    const { locationId, buildingId } = req.params;
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    // Only allow the creator or admins to delete buildings
    if (location.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete buildings from this location' 
      });
    }
    
    const building = location.buildings.id(buildingId);
    
    if (!building) {
      return res.status(404).json({ 
        success: false, 
        message: 'Building not found' 
      });
    }
    
    // Remove building from the location
    location.buildings.pull(buildingId);
    await location.save();
    
    res.json({
      success: true,
      message: 'Building deleted successfully',
      location
    });
  } catch (err) {
    console.error('Error deleting building:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error deleting building' 
    });
  }
};

// Get buildings for a location
exports.getBuildingsForLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }
    
    res.json({
      success: true,
      buildings: location.buildings,
      location: {
        _id: location._id,
        name: location.name,
        address: location.address
      }
    });
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error fetching buildings' 
    });
  }
};
