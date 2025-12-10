const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { adminAuth, contactManagerAuth, userAuth } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validators');

// Public routes (user authentication required)
router.post('/', userAuth, contactController.createContact);

// Admin routes
router.get('/', contactManagerAuth, contactController.getAllContacts);
router.get('/stats', contactManagerAuth, contactController.getContactStats);
router.get('/:id', contactManagerAuth, validateObjectId, contactController.getContactById);
router.post('/:id/reply', contactManagerAuth, validateObjectId, contactController.replyToContact);
router.delete('/:id', contactManagerAuth, validateObjectId, contactController.deleteContact);

module.exports = router;