const Contact = require('../models/Contact');
const { validateObjectId } = require('../utils/validators');
const { sendEmail } = require('../utils/email');

const contactController = {
  // Get all contacts
  getAllContacts: async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      res.json(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ message: 'Error fetching contacts' });
    }
  },

  // Get a single contact by ID
  getContactById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const contact = await Contact.findById(id)
        .populate('userId', 'name email');

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ message: 'Error fetching contact', error: error.message });
    }
  },

  // Delete a contact
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
  },

  // Create a new contact message
  createContact: async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      const contact = new Contact({
        name,
        email,
        phone,
        message
      });

      await contact.save();

      // Send confirmation email to user
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting us',
        text: `Dear ${name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nYour Team`
      });

      // Send notification email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: 'New Contact Form Submission',
        text: `New contact form submission from ${name} (${email}).\n\nMessage: ${message}`
      });

      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ message: 'Error creating contact message' });
    }
  },

  // Reply to a contact message
  replyToContact: async (req, res) => {
    try {
      const { reply } = req.body;
      
      if (!reply) {
        return res.status(400).json({ message: 'Reply message is required' });
      }

      const contact = await Contact.findById(req.params.id);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      contact.reply = reply;
      contact.repliedAt = new Date();
      contact.status = 'replied';
      await contact.save();

      try {
        // Send reply email to user
        await sendEmail({
          to: contact.email,
          subject: 'Reply to your message',
          text: `Dear ${contact.name},\n\n${reply}\n\nBest regards,\nYour Team`
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({
          message: 'Reply saved but email could not be sent. Please check email configuration.',
          error: emailError.message
        });
      }

      res.json(contact);
    } catch (error) {
      console.error('Error replying to contact:', error);
      res.status(500).json({ 
        message: 'Error sending reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = contactController; 