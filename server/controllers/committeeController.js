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

      // Set password to phone number by default
      user.password = phone;

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
  },

  // Get members belonging to committee member's village
  getVillageMembers: async (req, res) => {
    try {
      if (!['committeemember', 'superadmin', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      let targetVillage;

      if (req.user.role === 'committeemember') {
        const committeeMember = await User.findById(req.user.id);
        if (!committeeMember || !committeeMember.village) {
          return res.status(400).json({ message: 'Committee member village not found' });
        }
        targetVillage = committeeMember.village;
      } else {
        targetVillage = req.query.village;
        if (!targetVillage) {
          return res.status(200).json([]);
        }
      }

      // Find users in this village with role 'user' (villagers)
      const villageMembers = await User.find({
        village: targetVillage,
        role: 'user'
      })
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp')
        .sort({ username: 1 });

      res.json(villageMembers);
    } catch (error) {
      console.error('Error fetching village members:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get dashboard stats for committee member
  getDashboardStats: async (req, res) => {
    try {
      if (!['committeemember', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      let villageName;
      if (req.user.role === 'committeemember') {
        const committeeMember = await User.findById(req.user.id);
        if (!committeeMember || !committeeMember.village) {
          return res.status(400).json({ message: 'Committee member village not found' });
        }
        villageName = committeeMember.village;
      } else {
        // Superadmin might pass village query param, or we might not support it yet. 
        // For now let's assume superadmin behaves like a committee member if they have a village, 
        // or if they don't, return 0s or handle error. 
        // Simplified: strictly use user's village for now as per prompt context.
        if (req.query.village) {
          villageName = req.query.village;
        } else {
          // If superadmin and no village param, return empty stats?
          return res.json({
            totalMembers: 0,
            pendingBookings: 0,
            upcomingEvents: 0,
            totalEvents: 0,
            pendingApprovals: 0
          });
        }
      }

      // Use regex for booking village name matching as it might be case sensitive or have whitespace
      const villageRegex = { $regex: villageName, $options: 'i' };

      // 1. Total Members: Verified users in the village
      const totalMembers = await User.countDocuments({
        village: villageName,
        role: 'user',
        isVerified: true
      });

      // 2. Pending Bookings: Bookings for this village that are pending
      const pendingBookings = await Booking.countDocuments({
        villageName: villageRegex,
        status: 'Pending'
      });

      // 3. Upcoming Events: Confirmed bookings in future
      const upcomingEvents = await Booking.countDocuments({
        villageName: villageRegex,
        status: { $in: ['Approved', 'Booked', 'Confirmed'] },
        date: { $gte: new Date() }
      });

      // 4. Total Events: All bookings (excluding rejected/cancelled if desired, but "Total Events" usually implies completed or confirmed ones)
      // Let's count all non-cancelled/rejected for "Total Events" generally, or maybe just all. 
      // User prompt shows "Total Events 15". 
      const totalEvents = await Booking.countDocuments({
        villageName: villageRegex,
        status: { $in: ['Approved', 'Booked', 'Confirmed', 'Completed'] }
      });

      // 5. Pending Approvals: Unverified users in the village
      const pendingApprovals = await User.countDocuments({
        village: villageName,
        role: 'user',
        isVerified: false
      });

      res.json({
        totalMembers,
        pendingBookings,
        upcomingEvents,
        totalEvents,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = committeeController;