const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { adminAuth, userAuth } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validators');

// Get all contacts (admin only)
router.get('/', adminAuth, contactController.getAllContacts);

// Create a new contact message (authenticated users)
router.post('/', userAuth, contactController.createContact);

// Delete a contact (admin only)
router.delete('/:id', adminAuth, validateObjectId, contactController.deleteContact);

// Reply to a contact message (admin only)
router.post('/:id/reply', adminAuth, validateObjectId, contactController.replyToContact);

module.exports = router; 