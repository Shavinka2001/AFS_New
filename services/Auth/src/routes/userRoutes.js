const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Helper middleware to check admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403).json({ message: "Admin access required" });
};

// Public routes (register and login) - these must come before the protected routes!
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get("/", protect, isAdmin, userController.getAllUsers);

// Self-update route (no admin required, just authentication)
router.put("/self", protect, upload.single('profileImage'), userController.updateSelf);

// Admin protected routes with ID parameter
router.get("/:id", protect, isAdmin, userController.getUserById);
router.put("/:id", protect, isAdmin, userController.updateUserById);
router.delete("/:id", protect, isAdmin, userController.deleteUser);

module.exports = router;