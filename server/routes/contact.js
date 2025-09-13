const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/Contact');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const { sendContactConfirmationEmail } = require('../utils/email');

router.post('/', authMiddleware, async (req, res) => {
  const { name, email, subject, message } = req.body;
  const userId = req.user.id; 

  try {
    const newMessage = new ContactMessage({
      userId,
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();


    const adminEmail = process.env.ADMIN_EMAIL; 
    await sendContactConfirmationEmail(email, adminEmail, name, message);

    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again.' });
  }
});

// Reply to a contact message
router.post('/:id/reply', authMiddleware, async (req, res) => {
  const { reply } = req.body;
  const contactId = req.params.id;

  try {
    // Find the contact message
    const contact = await ContactMessage.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact message not found.' });
    }

    // Update reply, status, and repliedAt
    contact.reply = reply;
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();

    // Send reply email to the user
    await sendContactConfirmationEmail(contact.email, process.env.ADMIN_EMAIL, contact.name, reply);

    res.json({ success: true, message: 'Reply sent and saved.' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ success: false, error: 'Failed to send reply.' });
  }
});

module.exports = router;