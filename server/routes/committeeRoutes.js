const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committeeController');
const { committeeMemberAuth, userAuth } = require('../middleware/auth');

// Public routes
router.get('/members', committeeController.getAllCommitteeMembers);
router.get('/members/search', committeeController.searchCommitteeMembersByVillage);

// Committee member routes (committee members and super admins)
router.post('/members/add', committeeMemberAuth, committeeController.addVillageMember);
router.post('/bookings', committeeMemberAuth, committeeController.bookEventForMember);

module.exports = router;