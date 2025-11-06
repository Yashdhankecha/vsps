const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { adminAuth, userAuth } = require('../middleware/auth');
const SamuhLagan = require('../models/SamuhLagan');
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

module.exports = router; 