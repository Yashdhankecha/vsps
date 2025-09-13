const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { adminAuth, userAuth } = require('../middleware/auth');
const SamuhLagan = require('../models/SamuhLagan');
const TeamRegistration = require('../models/TeamRegistration');
const { sendEmail } = require('../utils/emailService');


router.get('/public/status', async (req, res) => {
  try {
    console.log('Fetching form statuses...');
    const forms = await Form.find({});
    const formStatus = {};
    
    forms.forEach(form => {
      formStatus[form.formType] = {
        active: form.active,
        startTime: form.startTime,
        endTime: form.endTime,
        eventDate: form.eventDate,
        isCurrentlyActive: form.isCurrentlyActive()
      };
    });

    console.log('Form statuses:', formStatus);
    res.json(formStatus);
  } catch (error) {
    console.error('Error fetching form status:', error);
    res.status(500).json({ message: 'Error fetching form status' });
  }
});


router.get('/status/:formType?', adminAuth, async (req, res) => {
  try {
    const { formType } = req.params;
    const forms = await Form.find({});
    
    
    if (forms.length === 0) {
      const defaultForms = [
        { formType: 'samuhLagan', active: false },
        { formType: 'studentAwards', active: false },
        { formType: 'teamRegistration', active: false }
      ];
      
      await Form.insertMany(defaultForms);
      return res.json({
        samuhLagan: { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false },
        studentAwards: { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false },
        teamRegistration: { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false }
      });
    }

    
    if (formType) {
      const form = forms.find(f => f.formType === formType);
      if (!form) {
        return res.status(404).json({ message: 'Form type not found' });
      }
      return res.json({
        ...form.toObject(),
        isCurrentlyActive: form.isCurrentlyActive()
      });
    }

    
    const formStatus = {
      samuhLagan: forms.find(f => f.formType === 'samuhLagan') || { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false },
      studentAwards: forms.find(f => f.formType === 'studentAwards') || { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false },
      teamRegistration: forms.find(f => f.formType === 'teamRegistration') || { active: false, lastUpdated: null, startTime: null, endTime: null, eventDate: null, isCurrentlyActive: false }
    };

    
    if (formStatus.samuhLagan._id) {
      formStatus.samuhLagan.isCurrentlyActive = forms.find(f => f.formType === 'samuhLagan').isCurrentlyActive();
    }
    
    if (formStatus.studentAwards._id) {
      formStatus.studentAwards.isCurrentlyActive = forms.find(f => f.formType === 'studentAwards').isCurrentlyActive();
    }

    if (formStatus.teamRegistration._id) {
      formStatus.teamRegistration.isCurrentlyActive = forms.find(f => f.formType === 'teamRegistration').isCurrentlyActive();
    }

    res.json(formStatus);
  } catch (error) {
    console.error('Error fetching form status:', error);
    res.status(500).json({ message: 'Error fetching form status' });
  }
});


router.put('/status/:formType', adminAuth, async (req, res) => {
  try {
    const { formType } = req.params;
    const { active, startTime, endTime, eventDate } = req.body;

    console.log('Received form update request:', {
      formType,
      active,
      startTime,
      endTime,
      eventDate
    });

   
    if (!['samuhLagan', 'studentAwards', 'teamRegistration'].includes(formType)) {
      return res.status(400).json({ 
        message: 'Invalid form type', 
        details: `Form type must be either 'samuhLagan', 'studentAwards', or 'teamRegistration', received: ${formType}` 
      });
    }

    if (typeof active !== 'boolean') {
      return res.status(400).json({ 
        message: 'Invalid active status', 
        details: 'Active status must be a boolean value' 
      });
    }

   
    if (startTime) {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid start time format', 
          details: `Received: ${startTime}. Expected a valid date string.` 
        });
      }
    }

    if (endTime) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid end time format', 
          details: `Received: ${endTime}. Expected a valid date string.` 
        });
      }
    }

    if (eventDate) {
      const eventDateObj = new Date(eventDate);
      if (isNaN(eventDateObj.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid event date format', 
          details: `Received: ${eventDate}. Expected a valid date string.` 
        });
      }
    }

    
    if (startTime && endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      if (endDate <= startDate) {
        return res.status(400).json({ 
          message: 'Invalid time range', 
          details: 'End time must be after start time' 
        });
      }
    }

   
    let form = await Form.findOne({ formType });
    if (!form) {
      form = new Form({ formType });
    }

    form.active = active;
    form.startTime = startTime;
    form.endTime = endTime;
    form.eventDate = eventDate;
    form.lastUpdated = new Date();

    await form.save();

    
    const updatedForm = {
      [formType]: {
        active: form.active,
        lastUpdated: form.lastUpdated,
        startTime: form.startTime,
        endTime: form.endTime,
        eventDate: form.eventDate,
        isCurrentlyActive: form.isCurrentlyActive()
      }
    };

    console.log('Form updated successfully:', updatedForm);
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form status:', error);
    res.status(500).json({ 
      message: 'Error updating form status', 
      details: `Unexpected error: ${error.message}` 
    });
  }
});


router.get('/check-form-visibility/:formName', async (req, res) => {
  try {
    const { formName } = req.params;
    
    const formTypeMap = {
      'registrationForm': 'samuhLagan',
      'studentAwardForm': 'studentAwards',
      'teamRegistrationForm': 'teamRegistration'
    };
    
    const formType = formTypeMap[formName];
    
    if (!formType) {
      return res.status(400).json({ 
        message: 'Invalid form name', 
        details: `Form name must be one of: ${Object.keys(formTypeMap).join(', ')}` 
      });
    }
    
    const form = await Form.findOne({ formType });
    
    if (!form) {
      return res.status(404).json({ 
        message: 'Form not found', 
        details: `No form found with type: ${formType}` 
      });
    }
    
    const isVisible = form.isCurrentlyActive();
    
    res.json({ 
      visible: isVisible,
      formStatus: {
        active: form.active,
        startTime: form.startTime,
        endTime: form.endTime,
        eventDate: form.eventDate,
        isCurrentlyActive: form.isCurrentlyActive(),
        lastUpdated: form.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error checking form visibility:', error);
    res.status(500).json({ 
      message: 'Error checking form visibility', 
      details: `Unexpected error: ${error.message}` 
    });
  }
});


router.get('/can-access-form/:formName', userAuth, async (req, res) => {
  try {
    const { formName } = req.params;
    
    const formTypeMap = {
      'registrationForm': 'samuhLagan',
      'studentAwardForm': 'studentAwards',
      'teamRegistrationForm': 'teamRegistration'
    };
    
    const formType = formTypeMap[formName];
    
    if (!formType) {
      return res.status(400).json({ 
        message: 'Invalid form name', 
        details: `Form name must be one of: ${Object.keys(formTypeMap).join(', ')}` 
      });
    }
    
    const form = await Form.findOne({ formType });
    
    if (!form) {
      return res.status(404).json({ 
        message: 'Form not found', 
        details: `No form found with type: ${formType}` 
      });
    }
    
    const isVisible = form.isCurrentlyActive();
    
    res.json({ 
      canAccess: isVisible,
      formStatus: {
        active: form.active,
        startTime: form.startTime,
        endTime: form.endTime,
        eventDate: form.eventDate,
        isCurrentlyActive: form.isCurrentlyActive()
      }
    });
  } catch (error) {
    console.error('Error checking form access:', error);
    res.status(500).json({ 
      message: 'Error checking form access',
      error: error.message
    });
  }
});

// Admin endpoint to set form timer
router.post('/set-form-timer', adminAuth, async (req, res) => {
  try {
    const { formName, startTime, endTime } = req.body;
    
    console.log('Received form timer request:', {
      formName,
      startTime,
      endTime
    });
    
    if (!['samuhLagan', 'studentAwards'].includes(formName)) {
      return res.status(400).json({ 
        message: 'Invalid form name', 
        details: `Form name must be either 'samuhLagan' or 'studentAwards', received: ${formName}` 
      });
    }
    
    if (startTime) {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid start time format', 
          details: `Received: ${startTime}. Expected a valid date string.` 
        });
      }
    }

    if (endTime) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid end time format', 
          details: `Received: ${endTime}. Expected a valid date string.` 
        });
      }
    }
    
    if (startTime && endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      if (endDate <= startDate) {
        return res.status(400).json({ 
          message: 'Invalid time range', 
          details: 'End time must be after start time' 
        });
      }
    }
    
    const form = await Form.findOneAndUpdate(
      { formType: formName },
      {
        active: true,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        lastUpdated: new Date()
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );
    
    if (!form) {
      return res.status(500).json({ 
        message: 'Error updating form', 
        details: 'Form not found after update attempt' 
      });
    }
    
    console.log('Form updated successfully:', form);
    
    const response = {
      [formName]: {
        active: form.active,
        lastUpdated: form.lastUpdated,
        startTime: form.startTime,
        endTime: form.endTime,
        isCurrentlyActive: form.isCurrentlyActive()
      }
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error setting form timer:', error);
    res.status(500).json({ 
      message: 'Error setting form timer', 
      details: `Unexpected error: ${error.message}` 
    });
  }
});

router.post('/samuhLagan/submit', userAuth, async (req, res) => {
  try {
    const form = await Form.findOne({ formType: 'samuhLagan' });
    if (!form || !form.isCurrentlyActive()) {
      return res.status(400).json({ 
        message: 'Form is not currently active',
        details: 'The Samuh Lagan registration form is not currently accepting submissions'
      });
    }

    const registration = new SamuhLagan({
      ...req.body,
      submittedBy: req.user._id
    });

    await registration.save();

    res.json({
      success: true,
      message: 'Registration submitted successfully',
      registrationId: registration._id
    });
  } catch (error) {
    console.error('Error submitting Samuh Lagan registration:', error);
    res.status(500).json({ 
      message: 'Error submitting registration',
      details: error.message
    });
  }
});

router.get('/samuhLagan/user-submissions', userAuth, async (req, res) => {
  try {
    const submissions = await SamuhLagan.find({ submittedBy: req.user._id })
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ 
      message: 'Error fetching submissions',
      details: error.message
    });
  }
});

router.post('/team-registrations', userAuth, async (req, res) => {
  try {
    const form = await Form.findOne({ formType: 'teamRegistration' });
    if (!form || !form.isCurrentlyActive()) {
      return res.status(400).json({ 
        message: 'Form is not currently active',
        details: 'The team registration form is not currently accepting submissions'
      });
    }

    // Validate required fields
    const { gameName, teamName, captainName, mobileNumber, email, teamMembers } = req.body;
    
    if (!gameName || !teamName || !captainName || !mobileNumber || !email || !teamMembers) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'Please provide all required fields: gameName, teamName, captainName, mobileNumber, email, and teamMembers'
      });
    }

    // Validate game name
    const validGames = ['Cricket', 'Football', 'Volleyball', 'Badminton', 'Kabaddi'];
    if (!validGames.includes(gameName)) {
      return res.status(400).json({
        message: 'Invalid game name',
        details: `Game name must be one of: ${validGames.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Validate mobile number format (basic validation)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return res.status(400).json({
        message: 'Invalid mobile number',
        details: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Validate team members array
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({
        message: 'Invalid team members',
        details: 'Please provide at least one team member'
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Authentication required',
        details: 'You must be logged in to submit a team registration'
      });
    }

    // Create new team registration
    const registration = new TeamRegistration({
      gameName,
      teamName,
      captainName,
      mobileNumber,
      email,
      teamMembers,
      submittedBy: req.user._id,
      status: 'pending'
    });

    await registration.save();

    // Send confirmation email
    try {
      await sendEmail(email, 'teamRegistrationRequest', {
        gameName,
        teamName,
        captainName,
        mobileNumber,
        email
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Team registration submitted successfully',
      registrationId: registration._id
    });
  } catch (error) {
    console.error('Error submitting team registration:', error);
    res.status(500).json({ 
      message: 'Error submitting registration',
      details: error.message
    });
  }
});

// Add GET route for fetching all team registrations
router.get('/team-registrations', adminAuth, async (req, res) => {
  try {
    const registrations = await TeamRegistration.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching team registrations:', error);
    res.status(500).json({ 
      message: 'Error fetching team registrations',
      details: error.message
    });
  }
});

router.put('/team-registrations/:id/approve', adminAuth, async (req, res) => {
  try {
    const registration = await TeamRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Team registration not found' });
    }

    registration.status = 'approved';
    registration.approvedBy = req.user._id;
    registration.approvedAt = new Date();
    await registration.save();

    // Send approval email
    try {
      await sendEmail(registration.email, 'teamRegistrationApproved', {
        gameName: registration.gameName,
        teamName: registration.teamName,
        captainName: registration.captainName,
        mobileNumber: registration.mobileNumber,
        email: registration.email
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Team registration approved successfully' });
  } catch (error) {
    console.error('Error approving team registration:', error);
    res.status(500).json({ message: 'Error approving registration' });
  }
});

router.put('/team-registrations/:id/reject', adminAuth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const registration = await TeamRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Team registration not found' });
    }

    registration.status = 'rejected';
    registration.rejectionReason = rejectionReason;
    registration.rejectedBy = req.user._id;
    registration.rejectedAt = new Date();
    await registration.save();

    // Send rejection email
    try {
      await sendEmail(registration.email, 'teamRegistrationRejected', {
        gameName: registration.gameName,
        teamName: registration.teamName,
        captainName: registration.captainName,
        rejectionReason
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Team registration rejected successfully' });
  } catch (error) {
    console.error('Error rejecting team registration:', error);
    res.status(500).json({ message: 'Error rejecting registration' });
  }
});

module.exports = router; 