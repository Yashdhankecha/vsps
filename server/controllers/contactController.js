const Contact = require('../models/Contact');
const { validateObjectId } = require('../utils/validators');
const { sendEmail } = require('../utils/email');

// Helper function to send email with timeout
const sendEmailWithTimeout = async (emailOptions, timeoutMs = 5000) => {
  try {
    const emailPromise = sendEmail(emailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out')), timeoutMs);
    });
    
    return await Promise.race([emailPromise, timeoutPromise]);
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw error;
  }
};

const contactController = {
  // Get all contacts with pagination and filtering
  getAllContacts: async (req, res) => {
    try {
      const { page = 1, limit = 50, status, search } = req.query;
      const skip = (page - 1) * limit;
      
      // Build filter object
      let filter = {};
      if (status && (status === 'pending' || status === 'replied')) {
        filter.status = status;
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }
      
      const contacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Contact.countDocuments(filter);
      
      res.json({
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ 
        message: 'Error fetching contacts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get a single contact by ID
  getContactById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ 
        message: 'Error fetching contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

      res.status(200).json({ 
        message: 'Contact deleted successfully',
        contactId: id 
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ 
        message: 'Error deleting contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Create a new contact message
  createContact: async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ 
          message: 'Name, email, and message are required' 
        });
      }

      const contact = new Contact({
        name,
        email,
        phone,
        message
      });

      await contact.save();

      // Send confirmation email to user asynchronously
      setImmediate(async () => {
        try {
          await sendEmailWithTimeout({
            to: email,
            subject: 'Thank you for contacting us',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6B46C1;">Thank you for contacting us!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you soon.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Your message:</strong></p>
                  <p>${message}</p>
                </div>
                <p>Best regards,<br>Community Web Team</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email to user:', emailError.message);
        }
      });

      // Send notification email to admin asynchronously
      setImmediate(async () => {
        try {
          if (process.env.ADMIN_EMAIL) {
            await sendEmailWithTimeout({
              to: process.env.ADMIN_EMAIL,
              subject: 'New Contact Form Submission',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #6B46C1;">New Contact Form Submission</h2>
                  <p><strong>From:</strong> ${name} (${email})</p>
                  ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                  </div>
                  <p><small>To reply to this message, please log in to the admin panel.</small></p>
                </div>
              `
            });
          }
        } catch (emailError) {
          console.error('Failed to send notification email to admin:', emailError.message);
        }
      });

      res.status(201).json({
        message: 'Contact message received successfully',
        contact
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ 
        message: 'Error processing contact message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Reply to a contact message
  replyToContact: async (req, res) => {
    try {
      const { reply } = req.body;
      const { id } = req.params;
      
      // Validate input
      if (!reply || reply.trim().length === 0) {
        return res.status(400).json({ message: 'Reply message is required' });
      }

      if (!validateObjectId(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      // Find and update contact
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      // Update contact with reply
      contact.reply = reply.trim();
      contact.repliedAt = new Date();
      contact.status = 'replied';
      
      const savedContact = await contact.save();

      // Respond immediately
      res.status(200).json({
        message: 'Reply saved successfully',
        contact: savedContact
      });

      // Send reply email asynchronously
      setImmediate(async () => {
        try {
          await sendEmailWithTimeout({
            to: contact.email,
            subject: `Re: Your Contact Form Submission`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6B46C1;">Thank you for your message</h2>
                <p>Dear ${contact.name},</p>
                <p>We have received your message and here is our response:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Our response:</strong></p>
                  <p>${reply}</p>
                </div>
                <hr>
                <h3>Your original message:</h3>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p>${contact.message}</p>
                </div>
                <p>Best regards,<br>Community Web Team</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send reply email:', emailError.message);
          // We don't send an error response here because the reply was already saved
        }
      });

    } catch (error) {
      console.error('Error replying to contact:', error);
      res.status(500).json({ 
        message: 'Error processing reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get contact statistics
  getContactStats: async (req, res) => {
    try {
      const total = await Contact.countDocuments();
      const pending = await Contact.countDocuments({ status: 'pending' });
      const replied = await Contact.countDocuments({ status: 'replied' });
      
      res.json({
        total,
        pending,
        replied,
        today: await Contact.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        })
      });
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      res.status(500).json({ 
        message: 'Error fetching contact statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = contactController;