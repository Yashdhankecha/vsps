const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getHomeContent,
  updateHomeContent,
  handleHeroSlide,
  deleteHeroSlide,
  updateAbout,
  updateIntroduction,
  updateLeadership,
  deleteLeadershipMember,
  updateHeroSlider
} = require('../controllers/homeContentController');
const { uploadPDF } = require('../middleware/upload');
const { contentManagerAuth } = require('../middleware/auth');

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
router.get('/home', getHomeContent);

// Protected routes - only accessible by content managers and admins
router.post('/home', contentManagerAuth, upload.single('image'), updateHomeContent);

router.put('/home/hero-slider', contentManagerAuth, updateHeroSlider);
router.post('/home/hero-slide', contentManagerAuth, upload.single('image'), handleHeroSlide);
router.delete('/home/hero-slide/:id', contentManagerAuth, deleteHeroSlide);

router.put('/home/about', contentManagerAuth, upload.single('image'), updateAbout);

router.put('/home/introduction', contentManagerAuth, uploadPDF.single('pdfFile'), updateIntroduction);

router.put('/home/leadership', contentManagerAuth, upload.any(), updateLeadership);
router.delete('/home/leadership/members/:id', contentManagerAuth, deleteLeadershipMember);

module.exports = router;