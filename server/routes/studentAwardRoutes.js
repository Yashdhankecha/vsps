const express = require('express');
const router = express.Router();
const StudentAward = require('../models/StudentAward');
const { adminAuth } = require('../middleware/auth');

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const registration = await StudentAward.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

   
    if (registration.status !== 'rejected') {
      return res.status(400).json({ 
        error: 'Only rejected registrations can be deleted' 
      });
    }

   
    await StudentAward.findByIdAndDelete(req.params.id);

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/status', async (req, res) => {
  try {
    
    res.json({ 
      active: true,
      message: 'Student Award form is active'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error checking student award form status',
      error: error.message 
    });
  }
});

module.exports = router; 