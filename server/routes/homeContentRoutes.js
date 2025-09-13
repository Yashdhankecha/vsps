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

router.get('/home', getHomeContent);
router.post('/home', upload.single('image'), updateHomeContent);

router.put('/home/hero-slider', updateHeroSlider);
router.post('/home/hero-slide', upload.single('image'), handleHeroSlide);
router.delete('/home/hero-slide/:id', deleteHeroSlide);

router.put('/home/about', upload.single('image'), updateAbout);

router.put('/home/introduction', uploadPDF.single('pdfFile'), updateIntroduction);

router.put('/home/leadership', upload.any(), updateLeadership);
router.delete('/home/leadership/members/:id', deleteLeadershipMember);

module.exports = router; 