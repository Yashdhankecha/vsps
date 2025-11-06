const User = require('../models/User');
const Booking = require('../models/Booking');

const userController = {
  
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { username, phone, company, address } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

     
      if (username) user.username = username;
      if (phone) user.phone = phone;
      if (company) user.company = company;
      if (address) user.address = address;

      await user.save();

      const updatedUser = await User.findById(req.user.id)
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp');

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

     
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  
  updateNotifications: async (req, res) => {
    try {
      const { notifications } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.notifications = notifications;
      await user.save();

      res.json({
        message: 'Notifications updated successfully',
        notifications: user.notifications
      });
    } catch (error) {
      console.error('Notifications update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  
  updateProfileImage: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      console.log('Image mime type:', req.file.mimetype); 
      console.log('Base64 image length:', base64Image.length); 

      
      await user.updateProfileImage(imageUrl);

    
      const updatedImageUrl = user.getProfileImageUrl();
      console.log('Updated image URL:', updatedImageUrl); 

      res.json({
        message: 'Profile image updated successfully',
        profileImage: updatedImageUrl
      });
    } catch (error) {
      console.error('Profile image update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

 
  removeProfileImage: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.removeProfileImage();

      res.json({
        message: 'Profile image removed successfully',
        profileImage: user.getProfileImageUrl()
      });
    } catch (error) {
      console.error('Profile image removal error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
     
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
  
      const users = await User.find({})
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp');
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const userId = req.params.id;
      
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (userId === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

     
      await Booking.deleteMany({ email: user.email });

    
      await User.findByIdAndDelete(userId);
      
      res.json({ 
        message: 'User and associated bookings deleted successfully',
        deletedUserId: userId 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  },

  
  updateUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const userId = req.params.id;
      
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const { username, email, role, isVerified } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required' });
      }

      if (role && !['user', 'committee', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      user.username = username;
      user.email = email;
      if (role) user.role = role;
      if (typeof isVerified === 'boolean') user.isVerified = isVerified;

      await user.save();

      const updatedUser = await User.findById(userId)
        .select('-password -passwordHistory -verificationToken -resetPasswordToken -otp');

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  },

 
  getDashboardStats: async (req, res) => {
    try {
      console.log('Fetching dashboard stats for user:', req.user.id);
      
      if (req.user.role !== 'admin') {
        console.log('Access denied for user:', req.user.id, 'Role:', req.user.role);
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      // Get total users count
      const totalUsers = await User.countDocuments();
      console.log('Total users:', totalUsers);

      // Get total bookings count
      const totalBookings = await Booking.countDocuments();
      console.log('Total bookings:', totalBookings);

      // Get active streams (set to 0 for now as this feature isn't implemented)
      const activeStreams = 0;

      // Get bookings with 'Booked' status for revenue calculation
      const bookedBookings = await Booking.find({ 
        status: 'Booked'
      });
      console.log('Booked bookings count:', bookedBookings.length);

      // Calculate total revenue from booked bookings
      const totalRevenue = bookedBookings.reduce((sum, booking) => {
        // Use actual amount from booking if available, otherwise calculate
        if (booking.amount && typeof booking.amount === 'number') {
          return sum + booking.amount;
        }
        
        // Fallback calculation based on event type and guest count
        let amount = 1000; // Base amount

        // Apply discount for samaj members
        if (booking.isSamajMember) {
          amount = 800;
        }

        // Additional charges for weddings
        if (booking.eventType === 'wedding') {
          amount += 500;
        }
        
        // Additional charges for large events
        if (booking.guestCount > 100) {
          amount += 200;
        }

        return sum + amount;
      }, 0);
      console.log('Total revenue calculated:', totalRevenue);

      // Get user role distribution
      const userRoles = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);
      console.log('User roles distribution:', userRoles);

      // Get booking status distribution
      const bookingStatuses = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      console.log('Booking statuses distribution:', bookingStatuses);

      // Get recent user registrations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });
      console.log('Recent users (last 7 days):', recentUsers);

      // Get recent bookings (last 7 days)
      const recentBookings = await Booking.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });
      console.log('Recent bookings (last 7 days):', recentBookings);

      const stats = {
        totalUsers,
        totalBookings,
        activeStreams,
        totalRevenue,
        userRoles,
        bookingStatuses,
        recentUsers,
        recentBookings
      };

      console.log('Dashboard stats response:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = userController; 