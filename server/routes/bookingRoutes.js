const express = require('express');
const bookingController = require('../controllers/bookingController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminAuth, userAuth, authorizeRoles } = require('../middleware/auth');
const Booking = require('../models/Booking');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const samuhLaganStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/samuh-lagan');
   
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const samuhLaganUpload = multer({ 
  storage: samuhLaganStorage,
  fileFilter: (req, file, cb) => {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
      return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

const studentAwardStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/student-awards');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const studentAwardUpload = multer({ 
  storage: studentAwardStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
      return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});


router.post('/submit', bookingController.submitBookingRequest);


router.get('/', userAuth, bookingController.getAllBookings);

router.put('/approve/:bookingId', adminAuth, bookingController.approveBooking);

router.put('/reject/:bookingId', adminAuth, bookingController.rejectBooking);

router.put('/confirm-payment/:bookingId', bookingController.confirmPayment);


router.post('/test-email', async (req, res) => {
  try {
    console.log('Testing email with:', {
      emailUser: process.env.EMAIL_USER,
      emailPassExists: !!process.env.EMAIL_PASS
    });

    await sendEmail(
      process.env.ADMIN_EMAIL, 
      'bookingRequest',
      {
        firstName: 'Test',
        surname: 'User',
        date: new Date().toLocaleDateString(),
        isSamajMember: false,
        eventType: 'Test Event'
      }
    );
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


router.post('/upload-document', upload.single('document'), bookingController.uploadDocument);


router.put('/update/:bookingId', bookingController.updateBooking);


router.put('/confirm-booking/:bookingId', bookingController.confirmBooking);


router.post('/samuh-lagan/submit', 
  samuhLaganUpload.fields([
    { name: 'bridePhoto', maxCount: 1 },
    { name: 'groomPhoto', maxCount: 1 },
    { name: 'brideDocuments', maxCount: 5 },
    { name: 'groomDocuments', maxCount: 5 }
  ]), 
  bookingController.submitSamuhLaganRequest
);
router.get('/samuh-lagan', bookingController.getAllSamuhLaganRequests);
router.get('/samuh-lagan/:id', bookingController.getSamuhLaganRequestById);
router.put('/samuh-lagan/approve/:requestId', bookingController.approveSamuhLaganRequest);
router.put('/samuh-lagan/reject/:requestId', bookingController.rejectSamuhLaganRequest);
router.put('/samuh-lagan/confirm/:requestId', bookingController.confirmSamuhLaganRequest);


router.post('/student-awards/register', 
  studentAwardUpload.single('marksheet'), 
  bookingController.submitStudentAwardRequest
);

router.get('/student-awards', adminAuth, bookingController.getAllStudentAwardRequests);
router.get('/student-awards/:id', adminAuth, bookingController.getStudentAwardRequestById);
router.put('/student-awards/approve/:requestId', adminAuth, bookingController.approveStudentAwardRequest);
router.put('/student-awards/reject/:requestId', adminAuth, bookingController.rejectStudentAwardRequest);
router.patch('/student-awards/:id', adminAuth, bookingController.updateStudentAward);

// Add delete route for bookings
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add delete routes for different types
router.delete('/samuh-lagan/:id', authMiddleware, async (req, res) => {
  try {
    const SamuhLagan = require('../models/SamuhLagan');
    const registration = await SamuhLagan.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Samuh Lagan registration not found' });
    }

    await SamuhLagan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Samuh Lagan registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting Samuh Lagan registration:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/student-awards/:id', authMiddleware, async (req, res) => {
  try {
    const StudentAward = require('../models/StudentAward');
    const award = await StudentAward.findById(req.params.id);
    
    if (!award) {
      return res.status(404).json({ error: 'Student Award registration not found' });
    }

    await StudentAward.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student Award registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting Student Award registration:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/team-registrations/:id', authMiddleware, async (req, res) => {
  try {
    const TeamRegistration = require('../models/TeamRegistration');
    const registration = await TeamRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Team Registration not found' });
    }

    await TeamRegistration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting Team Registration:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;