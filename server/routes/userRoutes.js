const express = require('express');
const router = express.Router();
const { adminAuth, userManagerAuth, userAuth, committeeMemberAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Profile routes
router.get('/profile', userAuth, userController.getProfile);
router.put('/profile', userAuth, userController.updateProfile);
router.put('/password', userAuth, userController.updatePassword);
router.put('/notifications', userAuth, userController.updateNotifications);
router.put('/profile-image', userAuth, upload.single('image'), userController.updateProfileImage);
router.delete('/profile-image', userAuth, userController.removeProfileImage);

// Admin routes - only accessible by admins and user managers
router.get('/all', userManagerAuth, userController.getAllUsers);
router.post('/create', userManagerAuth, userController.createUser);
router.delete('/:id', userManagerAuth, userController.deleteUser);
router.put('/:id', userManagerAuth, userController.updateUser);
router.get('/dashboard-stats', adminAuth, userController.getDashboardStats);

// Committee member routes - for villager approval
router.get('/unapproved', committeeMemberAuth, userController.getUnapprovedVillagers);
router.put('/:id/approve', committeeMemberAuth, userController.approveVillager);

// Booking routes for user
router.get('/bookings', userAuth, bookingController.getUserBookings);
router.post('/bookings/:id/cancel', userAuth, bookingController.cancelBooking);

module.exports = router;