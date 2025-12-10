const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { contentManagerAuth } = require('../middleware/auth');
const {
  getEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory
} = require('../controllers/eventCategoryController');


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


router.get('/events/categories', getEventCategories);
router.post('/events/categories', contentManagerAuth, upload.single('image'), createEventCategory);
router.put('/events/categories/:id', contentManagerAuth, upload.single('image'), updateEventCategory);
router.delete('/events/categories/:id', contentManagerAuth, deleteEventCategory);

module.exports = router;