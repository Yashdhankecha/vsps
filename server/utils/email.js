const nodemailer = require('nodemailer');

// Create a transporter object using Gmail with more robust configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '' // Clean password by removing spaces
  },
  tls: {
    rejectUnauthorized: false
  },
  // Add timeout configuration
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 10000      // 10 seconds
});

// Verify transporter configuration with timeout
const verifyTransporter = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Transporter verification timed out'));
    }, 5000);
    
    transporter.verify(function (error, success) {
      clearTimeout(timeout);
      if (error) {
        console.error('Email configuration error:', error);
        reject(error);
      } else {
        console.log('Email server is ready to send messages');
        resolve(success);
      }
    });
  });
};

// Verify transporter on startup
verifyTransporter().catch(err => {
  console.error('Email transporter verification failed:', err.message);
});

// Function to send a contact confirmation email
const sendContactConfirmationEmail = async (userEmail, adminEmail, userName, message) => {
  try {
    // Debug logging to check if env vars are loaded
    console.log('Email configuration check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4) : 'Not found');
    
    // Check if required env vars are present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is incomplete. Please check EMAIL_USER and EMAIL_PASS in .env file.');
    }

    // Email to user - sent FROM admin TO user
    const userMailOptions = {
      from: {
        name: 'Community Web Team',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Thank you for contacting us',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${userName},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Your message:</p>
        <blockquote>${message}</blockquote>
        <p>Best regards,<br>Community Web Team</p>
      `
    };

    // Email to admin - sent FROM system TO admin
    const adminMailOptions = {
      from: {
        name: `${userName} via Contact Form`,
        address: process.env.EMAIL_USER
      },
      replyTo: userEmail,
      to: adminEmail,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p>From: ${userName} (${userEmail})</p>
        <p>Message:</p>
        <blockquote>${message}</blockquote>
        <hr>
        <p><small>To reply to this message, simply reply to this email.</small></p>
      `
    };

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log('Confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file. For Gmail, you need to use an App Password, not your regular password. Visit https://myaccount.google.com/apppasswords to generate an App Password.');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to email server. Please check your network connection.');
    }
    if (error.message.includes('Invalid login')) {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file. For Gmail, you need to use an App Password, not your regular password. Visit https://myaccount.google.com/apppasswords to generate an App Password.');
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Function to send a generic email with timeout
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Debug logging to check if env vars are loaded
    console.log('Email configuration check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4) : 'Not found');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing. Please check EMAIL_USER and EMAIL_PASS environment variables.');
    }

    if (!to) {
      throw new Error('Recipient email address is required');
    }

    const mailOptions = {
      from: {
        name: 'Community Web Team',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      text,
      html
    };

    console.log('Attempting to send email with options:', {
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Create the email sending promise
    const emailPromise = transporter.sendMail(mailOptions);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000);
    });

    // Race the email promise against the timeout
    const info = await Promise.race([emailPromise, timeoutPromise]);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file. For Gmail, you need to use an App Password, not your regular password. Visit https://myaccount.google.com/apppasswords to generate an App Password.');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to email server. Please check your network connection.');
    }
    if (error.code === 'ECONNRESET') {
      throw new Error('Connection was reset while sending email. Please check your network connection.');
    }
    if (error.message.includes('Invalid login')) {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file. For Gmail, you need to use an App Password, not your regular password. Visit https://myaccount.google.com/apppasswords to generate an App Password.');
    }
    if (error.message.includes('timed out')) {
      throw new Error('Email sending timed out. Please check your network connection and email configuration.');
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendContactConfirmationEmail, sendEmail };