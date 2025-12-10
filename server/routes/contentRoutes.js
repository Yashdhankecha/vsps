const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { contentManagerAuth } = require('../middleware/auth');
const GalleryItem = require('../models/GalleryItem');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} = require('../controllers/contentController');

const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public route - no auth needed
router.get('/gallery', getGalleryItems);

// Protected routes - only accessible by content managers and admins
router.post('/gallery', contentManagerAuth, upload.single('file'), createGalleryItem);
router.put('/gallery/:id', contentManagerAuth, upload.single('file'), updateGalleryItem);
router.delete('/gallery/:id', contentManagerAuth, deleteGalleryItem);

module.exports = router;