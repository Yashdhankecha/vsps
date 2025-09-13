const TeamRegistration = require('../models/TeamRegistration');
const Form = require('../models/Form');
const { sendEmail } = require('../utils/emailService');
const { teamRegistrationThankYou, teamRegistrationApproval, teamRegistrationRejection } = require('../utils/emailTemplates');

// Create new team registration
const createTeamRegistration = async (req, res) => {
  try {
    const { gameName, teamName, captainName, mobileNumber, email, teamMembers } = req.body;

    // Check if the registration form is active
    const form = await Form.findOne({ formType: 'teamRegistration' });
    if (!form || !form.active) {
      return res.status(400).json({ message: 'Team registration form is not currently active' });
    }

    // Validate minimum team members based on game
    const minTeamMembers = {
      'Cricket': 11,
      'Football': 11,
      'Volleyball': 6,
      'Badminton': 2,
      'Kabaddi': 7
    };

    if (teamMembers.length < minTeamMembers[gameName]) {
      return res.status(400).json({ 
        message: `Minimum ${minTeamMembers[gameName]} team members required for ${gameName}` 
      });
    }

    // Create new team registration
    const teamRegistration = new TeamRegistration({
      user: req.user._id,
      gameName,
      teamName,
      captainName,
      mobileNumber,
      email,
      teamMembers
    });

    await teamRegistration.save();

    // Send confirmation email
    await sendEmail(
      email,
      'teamRegistrationThankYou',
      {
        captainName,
        gameName,
        teamName,
        mobileNumber,
        email,
        teamMembers
      }
    );

    res.status(201).json({
      success: true,
      message: 'Team registration submitted successfully',
      data: teamRegistration
    });
  } catch (error) {
    console.error('Error in createTeamRegistration:', error);
    res.status(500).json({ message: 'Error creating team registration' });
  }
};

// Get all team registrations (admin only)
const getAllTeamRegistrations = async (req, res) => {
  try {
    const teamRegistrations = await TeamRegistration.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teamRegistrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team registrations',
      error: error.message
    });
  }
};

// Get single team registration
const getTeamRegistration = async (req, res) => {
  try {
    const teamRegistration = await TeamRegistration.findById(req.params.id)
      .populate('user', 'username email');

    if (!teamRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Team registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teamRegistration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team registration',
      error: error.message
    });
  }
};

// Update team registration status (admin only)
const updateTeamRegistrationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    const teamRegistration = await TeamRegistration.findById(id);
    if (!teamRegistration) {
      return res.status(404).json({ message: 'Team registration not found' });
    }

    teamRegistration.status = status;
    if (status === 'Rejected' && rejectionReason) {
      teamRegistration.rejectionReason = rejectionReason;
    }

    await teamRegistration.save();

    // Send status update email
    const template = status === 'Approved' ? 'teamRegistrationApproval' : 'teamRegistrationRejection';
    await sendEmail(
      teamRegistration.email,
      template,
      {
        captainName: teamRegistration.captainName,
        gameName: teamRegistration.gameName,
        teamName: teamRegistration.teamName,
        mobileNumber: teamRegistration.mobileNumber,
        email: teamRegistration.email,
        teamMembers: teamRegistration.teamMembers,
        rejectionReason: teamRegistration.rejectionReason
      }
    );

    res.json({
      success: true,
      message: 'Team registration status updated successfully',
      data: teamRegistration
    });
  } catch (error) {
    console.error('Error in updateTeamRegistrationStatus:', error);
    res.status(500).json({ message: 'Error updating team registration status' });
  }
};

// Get user's team registrations
const getUserTeamRegistrations = async (req, res) => {
  try {
    const teamRegistrations = await TeamRegistration.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teamRegistrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user team registrations',
      error: error.message
    });
  }
};

module.exports = {
  createTeamRegistration,
  getAllTeamRegistrations,
  getTeamRegistration,
  updateTeamRegistrationStatus,
  getUserTeamRegistrations
}; 