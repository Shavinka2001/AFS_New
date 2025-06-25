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
router.get('/assigned/me', locationController.getAssignedLocations); // New route to get assigned locations

// Building routes (accessible to all authenticated users)
router.get('/:locationId/buildings', locationController.getBuildingsForLocation);

// Routes accessible to admins only
router.post('/', isAdmin, locationController.createLocation);
router.put('/:id', isAdmin, locationController.updateLocation);
router.delete('/:id', isAdmin, locationController.deleteLocation);
router.patch('/:id/toggle-status', isAdmin, locationController.toggleLocationStatus);
router.post('/:locationId/assign-technicians', locationController.assignTechnicians); // Allow both admins and technicians (for self-detachment)

// Building management routes (accessible to admins and location creators)
router.post('/:locationId/buildings', locationController.addBuildingToLocation);
router.put('/:locationId/buildings/:buildingId', locationController.updateBuildingInLocation);
router.delete('/:locationId/buildings/:buildingId', locationController.deleteBuildingFromLocation);

module.exports = router;
