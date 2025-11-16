const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { adminAuth, userAuth } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validators');

// Public routes (user authentication required)
router.post('/', userAuth, contactController.createContact);

// Admin routes
router.get('/', adminAuth, contactController.getAllContacts);
router.get('/stats', adminAuth, contactController.getContactStats);
router.get('/:id', adminAuth, validateObjectId, contactController.getContactById);
router.post('/:id/reply', adminAuth, validateObjectId, contactController.replyToContact);
router.delete('/:id', adminAuth, validateObjectId, contactController.deleteContact);

module.exports = router;