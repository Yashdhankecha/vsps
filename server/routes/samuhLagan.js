const express = require('express');
const router = express.Router();
const SamuhLagan = require('../models/SamuhLagan');
const { adminAuth, userAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Submit new Samuh Lagan registration
router.post('/', userAuth, async (req, res) => {
  try {
    const samuhLagan = new SamuhLagan({
      user: req.user._id,
      ...req.body
    });

    await samuhLagan.save();

    
    try {
      
      if (samuhLagan.bride.email) {
        await sendEmail(samuhLagan.bride.email, 'samuhLaganRequest', {
          name: samuhLagan.bride.name,
          date: samuhLagan.ceremonyDate
        });
      }

      if (samuhLagan.groom.email) {
        await sendEmail(samuhLagan.groom.email, 'samuhLaganRequest', {
          name: samuhLagan.groom.name,
          date: samuhLagan.ceremonyDate
        });
      }
    } catch (emailError) {
      console.error('Failed to send thank you emails:', emailError);
      
    }

    res.status(201).json({ message: 'Registration submitted successfully' });
  } catch (error) {
    console.error('Error submitting registration:', error);
    res.status(400).json({ error: error.message });
  }
});


router.get('/', adminAuth, async (req, res) => {
  try {
    const registrations = await SamuhLagan.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/my-registrations', userAuth, async (req, res) => {
  try {
    const registrations = await SamuhLagan.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.patch('/:id/approve', adminAuth, async (req, res) => {
  try {
    const registration = await SamuhLagan.findById(req.params.id)
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'approved';
    await registration.save();

    
    try {
     
      if (registration.bride.email) {
        await sendEmail(registration.bride.email, 'samuhLaganApproved', {
          name: registration.bride.name,
          date: registration.ceremonyDate
        });
      }

      
      if (registration.groom.email) {
        await sendEmail(registration.groom.email, 'samuhLaganApproved', {
          name: registration.groom.name,
          date: registration.ceremonyDate
        });
      }
    } catch (emailError) {
      console.error('Failed to send approval emails:', emailError);
      
    }

    res.json({ message: 'Registration approved successfully' });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: error.message });
  }
});


router.patch('/:id/confirm-payment', adminAuth, async (req, res) => {
  try {
    const registration = await SamuhLagan.findById(req.params.id)
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'confirmed';
    registration.paymentStatus = 'paid';
    await registration.save();

    
    try {
     
      if (registration.bride.email) {
        await sendEmail(registration.bride.email, 'samuhLaganConfirmed', {
          name: registration.bride.name,
          date: registration.ceremonyDate
        });
      }

      
      if (registration.groom.email) {
        await sendEmail(registration.groom.email, 'samuhLaganConfirmed', {
          name: registration.groom.name,
          date: registration.ceremonyDate
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      
    }

    res.json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});


router.patch('/:id/reject', adminAuth, async (req, res) => {
  try {
    const registration = await SamuhLagan.findById(req.params.id)
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'rejected';
    registration.rejectionReason = req.body.reason;
    await registration.save();

    try {
     
      if (registration.bride.email) {
        await sendEmail(registration.bride.email, 'samuhLaganRejected', {
          name: registration.bride.name,
          date: registration.ceremonyDate,
        reason: req.body.reason
        });
      }

      
      if (registration.groom.email) {
        await sendEmail(registration.groom.email, 'samuhLaganRejected', {
          name: registration.groom.name,
          date: registration.ceremonyDate,
          reason: req.body.reason
        });
      }
    } catch (emailError) {
      console.error('Failed to send rejection emails:', emailError);
      
    }

    res.json({ message: 'Registration rejected successfully' });
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({ error: error.message });
  }
});


router.put('/update/:id', adminAuth, async (req, res) => {
  try {
    const updated = await SamuhLagan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/test-email', adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    console.log('Testing email configuration:', {
      emailUser: process.env.EMAIL_USER,
      emailPassExists: !!process.env.EMAIL_PASS,
      recipientEmail: email
    });

    await sendEmail(email, 'samuhLaganRequest', {
      name: 'Test User',
      date: new Date().toLocaleDateString()
    });

    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const registration = await SamuhLagan.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    
    if (registration.status !== 'rejected') {
      return res.status(400).json({ 
        error: 'Only rejected registrations can be deleted' 
      });
    }

    await SamuhLagan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 