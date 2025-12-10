const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { contactManagerAuth, userAuth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Setup multer for file uploads
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/', reviewController.getApprovedReviews);
router.post('/', upload.array('images', 5), reviewController.submitReview);

// Admin routes
router.get('/admin', contactManagerAuth, reviewController.getAllReviews);
router.put('/approve/:id', contactManagerAuth, reviewController.approveReview);
router.delete('/reject/:id', contactManagerAuth, reviewController.rejectReview);
router.delete('/:id', contactManagerAuth, reviewController.deleteReview);

module.exports = router;