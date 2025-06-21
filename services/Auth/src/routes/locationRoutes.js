const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

// Routes accessible to admins only
router.post('/', isAdmin, locationController.createLocation);
router.put('/:id', isAdmin, locationController.updateLocation);
router.delete('/:id', isAdmin, locationController.deleteLocation);
router.patch('/:id/toggle-status', isAdmin, locationController.toggleLocationStatus);

module.exports = router;
