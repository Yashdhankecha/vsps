const User = require('../models/User');
const Booking = require('../models/Booking');
const { validateObjectId } = require('../utils/validators');

const committeeController = {
  // Get all committee members
  getAllCommitteeMembers: async (req, res) => {
    try {
      const committeeMembers = await User.find({ role: 'committeemember' })
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp')
        .sort({ village: 1, username: 1 });
      
      res.json(committeeMembers);
    } catch (error) {
      console.error('Error fetching committee members:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Search committee members by village
  searchCommitteeMembersByVillage: async (req, res) => {
    try {
      const { village } = req.query;
      
      if (!village) {
        return res.status(400).json({ message: 'Village name is required' });
      }

      const committeeMembers = await User.find({ 
        role: 'committeemember',
        village: { $regex: village, $options: 'i' }
      })
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp')
        .sort({ username: 1 });
      
      res.json(committeeMembers);
    } catch (error) {
      console.error('Error searching committee members:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add a new member to the village (committee member can do this)
  addVillageMember: async (req, res) => {
    try {
      // Only committee members and super admins can add village members
      if (!['committeemember', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Committee members and super admins only.' });
      }

      const { username, email, phone, village } = req.body;

      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required' });
      }

      // For committee members, use their own village if not provided
      let memberVillage = village;
      if (req.user.role === 'committeemember' && !memberVillage) {
        const committeeMember = await User.findById(req.user.id);
        if (!committeeMember || !committeeMember.village) {
          return res.status(400).json({ message: 'Committee member village not found' });
        }
        memberVillage = committeeMember.village;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Check if username is already taken
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Create new village member
      const user = new User({
        username,
        email,
        phone: phone || '',
        role: 'user', // Village members are regular users
        village: memberVillage,
        isVerified: true // Automatically verified by committee member
      });

      // Generate a random password for the user
      const randomPassword = Math.random().toString(36).slice(-8);
      user.password = randomPassword;

      await user.save();

      // TODO: Send email to user with their credentials (optional)

      const newUser = await User.findById(user._id)
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp');

      res.status(201).json({
        message: 'Village member added successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Error adding village member:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  },

  // Book event for a village member (committee member can do this)
  bookEventForMember: async (req, res) => {
    try {
      // Only committee members and super admins can book events for members
      if (!['committeemember', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Committee members and super admins only.' });
      }

      const { 
        memberId,
        eventType,
        date,
        startTime,
        endTime,
        guestCount,
        firstName,
        surname,
        email,
        phone,
        isSamajMember,
        additionalNotes
      } = req.body;

      // Validate required fields
      if (!memberId || !eventType || !date || !startTime || !endTime || !guestCount) {
        return res.status(400).json({ 
          message: 'Member ID, event type, date, start time, end time, and guest count are required' 
        });
      }

      // Validate member ID
      if (!memberId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid member ID format' });
      }

      // Check if member exists and belongs to the committee member's village
      const member = await User.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      // For committee members, verify the member belongs to their village
      if (req.user.role === 'committeemember') {
        const committeeMember = await User.findById(req.user.id);
        if (!committeeMember || !committeeMember.village) {
          return res.status(400).json({ message: 'Committee member village not found' });
        }

        if (member.village !== committeeMember.village) {
          return res.status(403).json({ message: 'You can only book events for members in your village' });
        }
      }

      // Create booking
      const booking = new Booking({
        eventType,
        date: new Date(date),
        startTime,
        endTime,
        guestCount: parseInt(guestCount),
        firstName: firstName || member.username,
        surname: surname || '',
        email: email || member.email,
        phone: phone || member.phone || '',
        isSamajMember: isSamajMember || false,
        additionalNotes: additionalNotes || '',
        status: 'Pending' // Default status
      });

      await booking.save();

      res.status(201).json({
        message: 'Event booked successfully',
        booking
      });
    } catch (error) {
      console.error('Error booking event:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  }
};

module.exports = committeeController;