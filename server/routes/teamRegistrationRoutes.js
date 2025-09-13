const express = require('express');
const router = express.Router();
const { userAuth, adminAuth } = require('../middleware/auth');
const {
  createTeamRegistration,
  getAllTeamRegistrations,
  getTeamRegistration,
  updateTeamRegistrationStatus,
  getUserTeamRegistrations
} = require('../controllers/teamRegistrationController');

// Public routes (require authentication)
router.post('/', userAuth, createTeamRegistration);
router.get('/my-registrations', userAuth, getUserTeamRegistrations);

// Admin routes
router.get('/', adminAuth, getAllTeamRegistrations);
router.get('/:id', adminAuth, getTeamRegistration);
router.put('/:id/status', adminAuth, updateTeamRegistrationStatus);

module.exports = router; 