const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');

// Public routes (none for locations - all require authentication)

// Protected routes (require authentication)
router.get('/search', protect, locationController.searchLocations);
router.get('/nearby', protect, locationController.getNearbyLocations);

// Admin routes (require admin privileges)
router.post('/', protect, isAdmin, locationController.createLocation);
router.get('/', protect, locationController.getAllLocations); // All users can view locations
router.get('/:id', protect, locationController.getLocationById);
router.put('/:id', protect, isAdmin, locationController.updateLocation);
router.delete('/:id', protect, isAdmin, locationController.deleteLocation);

module.exports = router;
