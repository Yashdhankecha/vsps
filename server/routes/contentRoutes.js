const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

router.get('/gallery', getGalleryItems);
router.post('/gallery', upload.single('file'), createGalleryItem);
router.put('/gallery/:id', upload.single('file'), updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

module.exports = router; 