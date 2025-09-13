const samuhLaganThankYou = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Registration</h1>
        </div>
        <div class="content">
            <p>Dear ${context.userName},</p>
            <p>We have received your Samuh Lagan registration for the ceremony date: ${context.ceremonyDate}.</p>
            <p>Our team will review your application and get back to you shortly.</p>
            <p>You can check the status of your registration by logging into your account.</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const samuhLaganApproval = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Approved</h1>
        </div>
        <div class="content">
            <p>Dear ${context.userName},</p>
            <p>We are pleased to inform you that your Samuh Lagan registration for ${context.ceremonyDate} has been approved.</p>
            <p>Please visit the Wadi office to complete your payment and finalize the booking.</p>
            <p>Office Hours: Monday to Friday, 9:00 AM to 5:00 PM</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const samuhLaganConfirmation = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed</h1>
        </div>
        <div class="content">
            <p>Dear ${context.userName},</p>
            <p>Your Samuh Lagan booking for ${context.ceremonyDate} has been confirmed.</p>
            <p>We look forward to hosting your ceremony. If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const samuhLaganRejection = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Update</h1>
        </div>
        <div class="content">
            <p>Dear ${context.userName},</p>
            <p>We regret to inform you that your Samuh Lagan registration could not be processed at this time.</p>
            <p>Reason: ${context.reason}</p>
            <p>If you have any questions or would like to discuss this further, please contact our office.</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const samuhLaganDeleted = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Deleted</h1>
        </div>
        <div class="content">
            <p>Dear ${context.name},</p>
            <p>This is to inform you that your Samuh Lagan registration for the ceremony date ${context.date} has been deleted from our system.</p>
            <p>If you wish to register again, please submit a new application through our website.</p>
            <p>If you have any questions, please contact our office.</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const studentAwardDeleted = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Deleted</h1>
        </div>
        <div class="content">
            <p>Dear ${context.name},</p>
            <p>This is to inform you that your Student Award registration for ${context.schoolName} has been deleted from our system.</p>
            <p>If you wish to register again, please submit a new application through our website.</p>
            <p>If you have any questions, please contact our office.</p>
            <p>Best regards,<br>Wadi Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const teamRegistrationConfirmation = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4B5563; text-align: center;">Team Registration Confirmation</h2>
      
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1F2937; margin-bottom: 10px;">Dear ${data.captainName},</p>
        
        <p style="color: #1F2937; margin-bottom: 10px;">Thank you for registering your team for the ${data.gameName} tournament. Your registration has been received and is currently under review.</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="color: #4B5563; margin-bottom: 10px;">Registration Details:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;"><strong>Team Name:</strong> ${data.teamName}</li>
            <li style="margin-bottom: 8px;"><strong>Game:</strong> ${data.gameName}</li>
            <li style="margin-bottom: 8px;"><strong>Captain:</strong> ${data.captainName}</li>
            <li style="margin-bottom: 8px;"><strong>Contact:</strong> ${data.mobileNumber}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${data.email}</li>
            <li style="margin-bottom: 8px;"><strong>Team Members:</strong> ${data.teamMembers.join(', ')}</li>
          </ul>
        </div>
        
        <p style="color: #1F2937; margin-bottom: 10px;">We will review your registration and notify you of the status. Please keep this email for your records.</p>
        
        <p style="color: #1F2937; margin-bottom: 10px;">If you have any questions, please contact us.</p>
        
        <p style="color: #1F2937; margin-top: 20px;">Best regards,<br>Patel Samaj Team</p>
      </div>
    </div>
  `;
};

const teamRegistrationStatusUpdate = (data) => {
  const statusColor = data.status === 'Approved' ? '#059669' : '#DC2626';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4B5563; text-align: center;">Team Registration Status Update</h2>
      
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1F2937; margin-bottom: 10px;">Dear ${data.captainName},</p>
        
        <p style="color: #1F2937; margin-bottom: 10px;">Your team registration for ${data.gameName} has been <strong style="color: ${statusColor}">${data.status}</strong>.</p>
        
        ${data.status === 'Rejected' && data.rejectionReason ? `
          <div style="background-color: #FEE2E2; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="color: #991B1B; margin-bottom: 10px;">Reason for Rejection:</h3>
            <p style="color: #7F1D1D;">${data.rejectionReason}</p>
          </div>
        ` : ''}
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="color: #4B5563; margin-bottom: 10px;">Registration Details:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;"><strong>Team Name:</strong> ${data.teamName}</li>
            <li style="margin-bottom: 8px;"><strong>Game:</strong> ${data.gameName}</li>
            <li style="margin-bottom: 8px;"><strong>Captain:</strong> ${data.captainName}</li>
            <li style="margin-bottom: 8px;"><strong>Contact:</strong> ${data.mobileNumber}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${data.email}</li>
            <li style="margin-bottom: 8px;"><strong>Team Members:</strong> ${data.teamMembers.join(', ')}</li>
          </ul>
        </div>
        
        ${data.status === 'Approved' ? `
          <p style="color: #1F2937; margin-bottom: 10px;">Congratulations! Your team has been approved to participate in the tournament. We will contact you with further details about the event schedule and requirements.</p>
        ` : `
          <p style="color: #1F2937; margin-bottom: 10px;">If you have any questions about this decision, please contact us.</p>
        `}
        
        <p style="color: #1F2937; margin-top: 20px;">Best regards,<br>Patel Samaj Team</p>
      </div>
    </div>
  `;
};

const teamRegistrationThankYou = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Team Registration Received</h1>
        </div>
        <div class="content">
            <p>Dear ${context.captainName},</p>
            <p>Thank you for registering your team "${context.teamName}" for the ${context.gameName} tournament.</p>
            <p>Registration Details:</p>
            <ul>
                <li><strong>Team Name:</strong> ${context.teamName}</li>
                <li><strong>Game:</strong> ${context.gameName}</li>
                <li><strong>Captain:</strong> ${context.captainName}</li>
                <li><strong>Contact:</strong> ${context.mobileNumber}</li>
                <li><strong>Email:</strong> ${context.email}</li>
                <li><strong>Team Members:</strong> ${context.teamMembers.join(', ')}</li>
            </ul>
            <p>Your registration is currently under review. We will notify you once the status is updated.</p>
            <p>Best regards,<br>Patel Samaj Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const teamRegistrationApproval = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Team Registration Approved</h1>
        </div>
        <div class="content">
            <p>Dear ${context.captainName},</p>
            <p>Congratulations! Your team "${context.teamName}" has been approved to participate in the ${context.gameName} tournament.</p>
            <p>Registration Details:</p>
            <ul>
                <li><strong>Team Name:</strong> ${context.teamName}</li>
                <li><strong>Game:</strong> ${context.gameName}</li>
                <li><strong>Captain:</strong> ${context.captainName}</li>
                <li><strong>Contact:</strong> ${context.mobileNumber}</li>
                <li><strong>Email:</strong> ${context.email}</li>
                <li><strong>Team Members:</strong> ${context.teamMembers.join(', ')}</li>
            </ul>
            <p>We will contact you shortly with tournament schedule and other important details.</p>
            <p>Best regards,<br>Patel Samaj Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const teamRegistrationRejection = (context) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6a1b9a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Team Registration Update</h1>
        </div>
        <div class="content">
            <p>Dear ${context.captainName},</p>
            <p>We regret to inform you that your team registration for "${context.teamName}" in ${context.gameName} could not be approved at this time.</p>
            <p>Reason: ${context.rejectionReason}</p>
            <p>Registration Details:</p>
            <ul>
                <li><strong>Team Name:</strong> ${context.teamName}</li>
                <li><strong>Game:</strong> ${context.gameName}</li>
                <li><strong>Captain:</strong> ${context.captainName}</li>
                <li><strong>Contact:</strong> ${context.mobileNumber}</li>
                <li><strong>Email:</strong> ${context.email}</li>
                <li><strong>Team Members:</strong> ${context.teamMembers.join(', ')}</li>
            </ul>
            <p>If you have any questions about this decision, please contact our office.</p>
            <p>Best regards,<br>Patel Samaj Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    samuhLaganThankYou,
    samuhLaganApproval,
    samuhLaganConfirmation,
    samuhLaganRejection,
    samuhLaganDeleted,
    studentAwardDeleted,
    teamRegistrationConfirmation,
    teamRegistrationStatusUpdate,
    teamRegistrationThankYou,
    teamRegistrationApproval,
    teamRegistrationRejection
}; 