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
        text: `Dear ${name},

Thank you for contacting us. We have received your message and will get back to you soon.

Best regards,
Your Team`
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
      
      console.log('Received reply request:', { id: req.params.id, reply });
      
      if (!reply) {
        return res.status(400).json({ message: 'Reply message is required' });
      }

      const contact = await Contact.findById(req.params.id);
      
      console.log('Found contact:', contact);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      contact.reply = reply;
      contact.repliedAt = new Date();
      contact.status = 'replied';
      
      const savedContact = await contact.save();
      console.log('Contact saved:', savedContact);

      // Respond immediately without waiting for email
      res.status(200).json({
        message: 'Reply saved successfully',
        contact: savedContact
      });

      // Send email asynchronously after response is sent
      setTimeout(async () => {
        try {
          await sendEmail({
            to: contact.email,
            subject: `Re: Your Contact Form Submission`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6B46C1;">Thank you for your message</h2>
                <p>Dear ${contact.name},</p>
                <p>We have received your message and here is our response:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;">${reply}</p>
                </div>
                <hr>
                <h3>Your original message:</h3>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;">${contact.message}</p>
                </div>
                <p>Best regards,<br>Community Web Team</p>
              </div>
            `
          });
          console.log('Reply email sent successfully');
        } catch (emailError) {
          console.error('Error sending email (non-blocking):', emailError.message);
          // Log the error but don't affect the main flow
        }
      }, 100); // Small delay to ensure response is sent
    } catch (error) {
      console.error('Error replying to contact:', error);
      // Ensure we always send a response
      if (!res.headersSent) {
        res.status(500).json({ 
          message: 'Error processing reply',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
};

module.exports = contactController;