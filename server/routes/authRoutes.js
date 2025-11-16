const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister, handleValidationErrors } = require('../validators/authValidator');

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/verify-otp', authController.verifyOTP); 
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);
router.post('/verify-reset-otp', authController.verifyResetOTP);

module.exports = router;