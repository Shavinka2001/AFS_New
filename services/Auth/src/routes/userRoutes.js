const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { refreshToken } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure uploads directory exists
        const fs = require('fs');
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
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

// Public routes (register and login)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', refreshToken);

// Authentication check routes
router.get('/verify-token', protect, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      userType: req.user.userType,
      isAdmin: req.user.isAdmin
    }
  });
});

// Protected routes
router.get("/", protect, isAdmin, userController.getAllUsers);

// Self-update route (no admin required, just authentication)
router.put("/self", protect, upload.single('profileImage'), userController.updateSelf);

// Admin protected routes with ID parameter
router.get("/:id", protect, isAdmin, userController.getUserById);
router.put("/:id", protect, isAdmin, userController.updateUserById);
router.delete("/:id", protect, isAdmin, userController.deleteUser);

// Admin-only route to create new users
router.post("/", protect, isAdmin, userController.createUser);

// Add this route for approving users
router.patch('/approve/:id', protect, isAdmin, userController.approveUser);

module.exports = router;