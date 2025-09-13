const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter with your Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const emailTemplates = {
  bookingRequest: (data) => ({
    subject: 'Booking Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Thank you for your booking request!</h2>
        <p>Dear ${data.firstName} ${data.surname},</p>
        <p>We have received your booking request for ${data.date}.</p>
        <p>Our team will review your request and notify you soon.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `
  }),

  bookingApproved: (data) => {
    // Define pricing based on event type and Samaj membership
    const pricing = {
      wedding: {
        samajMember: '₹1,25,000',
        nonSamajMember: '₹1,50,000'
      },
      corporate: {
        samajMember: '₹75,000',
        nonSamajMember: '₹90,000'
      },
      birthday: {
        samajMember: '₹50,000',
        nonSamajMember: '₹65,000'
      },
      social: {
        samajMember: '₹60,000',
        nonSamajMember: '₹75,000'
      }
    };

    // Ensure eventType is lowercase and exists in pricing object
    const normalizedEventType = (data.eventType || '').toLowerCase();
    const eventPricing = pricing[normalizedEventType] || pricing.social;
    const applicablePrice = data.isSamajMember ? eventPricing.samajMember : eventPricing.nonSamajMember;

    return {
      subject: 'Booking Request Approved - Payment Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9333EA; text-align: center;">Booking Request Approved!</h2>
          <p>Dear ${data.firstName} ${data.surname},</p>
          <p>We are pleased to inform you that your booking request for ${data.date} has been approved.</p>
          
          <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7E22CE; margin-top: 0;">Booking Details</h3>
            <p><strong>Event Type:</strong> ${data.eventType}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Samaj Membership Status:</strong> ${data.isSamajMember ? 'Samaj Member' : 'Non-Samaj Member'}</p>
            <p><strong>Applicable Price:</strong> ${applicablePrice}</p>
          </div>

          <div style="background-color: #FAF5FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7E22CE; margin-top: 0;">Payment Instructions</h3>
            <p>Please complete the payment at our office:</p>
            <ul>
              <li>Payment Amount: ${applicablePrice}</li>
              <li>Payment Method: Cash/Card at venue</li>
              <li>Please bring valid ID proof when making payment</li>
            </ul>
          </div>

          <p>Your booking will be confirmed after the payment is received.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
      `
    };
  },

  bookingRejected: (data) => ({
    subject: 'Booking Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Booking Request Status Update</h2>
        <p>Dear ${data.firstName} ${data.surname},</p>
        <p>Unfortunately, your booking request for ${data.date} has been rejected due to: ${data.reason}</p>
        <p>Please try selecting another date.</p>
      </div>
    `
  }),

  paymentSuccess: (data) => ({
    subject: 'Payment Successful - Booking Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Payment Successful!</h2>
        <p>Dear ${data.firstName} ${data.surname},</p>
        <p>Your payment has been received successfully. Your booking for ${data.date} is now confirmed.</p>
        <p>You can download your receipt <a href="${data.receiptUrl}">here</a>.</p>
      </div>
    `
  }),

  eventReminder: (data) => ({
    subject: `Reminder: Your Upcoming Event on ${data.date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Event Reminder</h2>
        <p>Dear ${data.firstName} ${data.surname},</p>
        <p>This is a reminder about your upcoming event on ${data.date}.</p>
        <h3>Event Details:</h3>
        ${data.eventDetails}
      </div>
    `
  }),

  bookingConfirmed: (data) => ({
    subject: 'Booking Confirmed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Booking Confirmation</h2>
        <p>Dear ${data.firstName} ${data.surname},</p>
        <p>Your booking for ${data.date} has been confirmed successfully.</p>
        <p>Thank you for choosing our services.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `
  }),

  samuhLaganRequest: (data) => ({
    subject: 'Samuh Lagan Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Thank you for your Samuh Lagan request!</h2>
        <p>Dear ${data.name},</p>
        <p>We have received your Samuh Lagan request for ${data.date}. Our team will review it and notify you soon.</p>
        <p>Please note that this is a special ceremony and requires additional documentation.</p>
      </div>
    `
  }),

  samuhLaganApproved: (data) => ({
    subject: 'Samuh Lagan Request Approved - Payment Instructions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Samuh Lagan Request Approved</h2>
        <p>Dear ${data.name},</p>
        <p>We are pleased to inform you that your Samuh Lagan request for <strong>${data.date}</strong> has been approved.</p>
        
        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Payment Instructions</h3>
          <p><strong>Please complete the payment at our office:</strong></p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>📍 Office Address: [Your Office Address]</li>
            <li>⏰ Office Hours: [Office Hours]</li>
            <li>💰 Payment Methods Accepted: Cash/Card</li>
          </ul>
          <p><strong>Payment Amount:</strong></p>
          <ul>
            <li>Samaj Members: ₹[Amount]</li>
            <li>Non-Samaj Members: ₹[Amount]</li>
          </ul>
        </div>

        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please bring valid ID proof when visiting the office</li>
          <li>Your booking will be confirmed only after payment</li>
          <li>Payment should be made within 3 working days</li>
        </ul>

        <p>If you have any questions, please contact us:</p>
        <p>📞 Phone: [Your Phone Number]<br>
           📧 Email: [Your Email]</p>
      </div>
    `
  }),

  samuhLaganRejected: (data) => ({
    subject: 'Samuh Lagan Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Samuh Lagan Request Status Update</h2>
        <p>Dear ${data.name},</p>
        <p>Unfortunately, your Samuh Lagan request for ${data.date} has been rejected.</p>
        <p>Reason: ${data.reason}</p>
        <p>Please contact us for more information or try selecting another date.</p>
      </div>
    `
  }),

  samuhLaganConfirmed: (data) => ({
    subject: 'Samuh Lagan Booking Confirmed - Payment Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Samuh Lagan Booking Confirmed!</h2>
        <p>Dear ${data.name},</p>
        <p>We are pleased to confirm that your payment has been received and your Samuh Lagan ceremony for <strong>${data.date}</strong> has been confirmed.</p>

        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Important Information</h3>
          <p><strong>Ceremony Details:</strong></p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>📅 Date: ${data.date}</li>
            <li>📍 Venue: [Venue Name]</li>
            <li>⏰ Reporting Time: [Time]</li>
            <li>📋 Ceremony Time: [Time]</li>
          </ul>
        </div>

        <div style="background-color: #FAF5FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Required Documents</h3>
          <p>Please ensure to bring the following documents on the day of the ceremony:</p>
          <ul>
            <li>Original ID proofs of bride and groom</li>
            <li>Birth certificates</li>
            <li>Address proofs</li>
            <li>Photographs as submitted</li>
            <li>Any additional documents submitted during registration</li>
          </ul>
        </div>

        <p><strong>Additional Notes:</strong></p>
        <ul>
          <li>Please arrive at least 30 minutes before the ceremony time</li>
          <li>Dress code: [Dress Code Details]</li>
          <li>Maximum number of guests allowed: [Number]</li>
        </ul>

        <p>If you need any clarification or have questions, please contact us:</p>
        <p>📞 Phone: [Your Phone Number]<br>
           📧 Email: [Your Email]</p>

        <p style="text-align: center; margin-top: 30px; color: #6B21A8;">
          Thank you for choosing our services. We look forward to hosting your ceremony.
        </p>
      </div>
    `
  }),

  studentAwardRequest: (data) => ({
    subject: 'Student Award Registration Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Thank you for your Student Award Registration!</h2>
        <p>Dear ${data.name},</p>
        <p>We have received your registration for the Student Award. Our team will review your application and notify you soon.</p>
        <p>Please note that this is a special recognition for academic excellence.</p>
      </div>
    `
  }),

  studentAwardApproved: (data) => ({
    subject: 'Student Award Application Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Student Award Application Approved</h2>
        <p>Dear ${data.name},</p>
        <p>We are pleased to inform you that your Student Award application has been approved.</p>
        
        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Important Information</h3>
          <p><strong>Award Ceremony Details:</strong></p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>📅 Date: ${data.date}</li>
            <li>📍 Venue: Wadi (Samaj) Hall</li>
            <li>⏰ Reporting Time: 10:00 AM</li>
          </ul>
        </div>

        <p><strong>Required Documents:</strong></p>
        <ul>
          <li>Original marksheet</li>
          <li>School ID card</li>
          <li>Any additional documents submitted during registration</li>
        </ul>

        <p>If you need any clarification or have questions, please contact us:</p>
        <p>📞 Phone: [Your Phone Number]<br>
           📧 Email: [Your Email]</p>
      </div>
    `
  }),

  studentAwardRejected: (data) => ({
    subject: 'Student Award Application Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Student Award Application Status Update</h2>
        <p>Dear ${data.name},</p>
        <p>Unfortunately, your Student Award application has been rejected.</p>
        <p>Reason: ${data.reason || 'Not provided'}</p>
        <p>Please contact us for more information.</p>
      </div>
    `
  }),

  teamRegistrationRequest: (data) => ({
    subject: 'Team Registration Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Thank you for your Team Registration!</h2>
        <p>Dear ${data.captainName},</p>
        <p>We have received your team registration for ${data.gameName}. Our team will review your application and notify you soon.</p>
        
        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Registration Details</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>🎮 Game: ${data.gameName}</li>
            <li>🏆 Team Name: ${data.teamName}</li>
            <li>👤 Captain: ${data.captainName}</li>
            <li>📱 Contact: ${data.mobileNumber}</li>
            <li>📧 Email: ${data.email}</li>
          </ul>
        </div>

        <p>Please note that this registration is subject to approval by our team.</p>
        <p>If you have any questions, please contact us:</p>
        <p>📞 Phone: [Your Phone Number]<br>
           📧 Email: [Your Email]</p>
      </div>
    `
  }),

  teamRegistrationApproved: (data) => ({
    subject: 'Team Registration Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Team Registration Approved!</h2>
        <p>Dear ${data.captainName},</p>
        <p>We are pleased to inform you that your team registration for ${data.gameName} has been approved.</p>
        
        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7E22CE; margin-top: 0;">Team Details</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>🎮 Game: ${data.gameName}</li>
            <li>🏆 Team Name: ${data.teamName}</li>
            <li>👤 Captain: ${data.captainName}</li>
            <li>📱 Contact: ${data.mobileNumber}</li>
          </ul>
        </div>

        <p><strong>Important Information:</strong></p>
        <ul>
          <li>Please ensure all team members are present on the day of the event</li>
          <li>Bring valid ID proofs for all team members</li>
          <li>Follow the tournament schedule and rules</li>
        </ul>

        <p>If you need any clarification or have questions, please contact us:</p>
        <p>📞 Phone: [Your Phone Number]<br>
           📧 Email: [Your Email]</p>
      </div>
    `
  }),

  teamRegistrationRejected: (data) => ({
    subject: 'Team Registration Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA; text-align: center;">Team Registration Status Update</h2>
        <p>Dear ${data.captainName},</p>
        <p>Unfortunately, your team registration for ${data.gameName} has been rejected.</p>
        <p>Reason: ${data.reason || 'Not provided'}</p>
        <p>Please contact us for more information or to submit a new registration.</p>
      </div>
    `
  })
};

const sendEmail = async (to, template, data) => {
  try {
    // Validate recipient email
    if (!to) {
      console.error('No recipient email provided');
      return null;
    }

    // Validate template exists
    if (!emailTemplates[template]) {
      console.error(`Email template '${template}' not found`);
      return null;
    }

    // Get email content
    const emailContent = emailTemplates[template](data);
    
    // Log email attempt
    console.log('Attempting to send email:', {
      to,
      template,
      subject: emailContent.subject
    });

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log(`Email sent successfully: ${template}`, result);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // Throw error to be handled by caller
  }
};

module.exports = { sendEmail }; 