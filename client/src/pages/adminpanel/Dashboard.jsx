import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  EyeIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  TrophyIcon as TrophyIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';
import axiosInstance from '../../utils/axiosConfig';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalSamuhLagan: 0,
    totalStudentAwards: 0,
    totalTeamRegistrations: 0,
    recentBookings: [],
    upcomingEvents: [],
    pendingPayments: [],
    pendingBookingsList: [],
    revenue: {
      monthly: 0,
      yearly: 0,
      monthlyBreakdown: [],
      yearlyBreakdown: []
    },
    // New dashboard stats
    totalUsers: 0,
    activeStreams: 0,
    totalRevenue: 0,
    recentUsers: 0,
    recentBookingsCount: 0,
    userRoles: [],
    bookingStatuses: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Fetch all dashboard data in parallel
      const [dashboardStatsRes, bookingsRes, samuhLaganRes, studentAwardRes] = await Promise.all([
        axiosInstance.get('/api/users/dashboard-stats'),
        axiosInstance.get('/api/bookings'),
        axiosInstance.get('/api/bookings/samuh-lagan'),
        axiosInstance.get('/api/bookings/student-awards')
        // Removed team-registrations since the model was deleted
      ]);

      console.log('All data fetched successfully');
      
      // Process dashboard stats
      const dashboardStats = dashboardStatsRes.data;

      // Ensure arrays with proper fallbacks (Array Method Safety Pattern)
      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : 
                      Array.isArray(bookingsRes.data?.bookings) ? bookingsRes.data.bookings : 
                      Array.isArray(bookingsRes.data?.data) ? bookingsRes.data.data : [];
      
      const samuhLagan = Array.isArray(samuhLaganRes.data) ? samuhLaganRes.data :
                         Array.isArray(samuhLaganRes.data?.bookings) ? samuhLaganRes.data.bookings :
                         Array.isArray(samuhLaganRes.data?.data) ? samuhLaganRes.data.data : [];
      
      const studentAwards = Array.isArray(studentAwardRes.data) ? studentAwardRes.data :
                            Array.isArray(studentAwardRes.data?.awards) ? studentAwardRes.data.awards :
                            Array.isArray(studentAwardRes.data?.data) ? studentAwardRes.data.data : [];

      console.log('Data processed:', {
        bookingsLength: bookings.length,
        samuhLaganLength: samuhLagan.length,
        studentAwardsLength: studentAwards.length
      });

      // Calculate statistics
      const pendingBookings = bookings.filter(b => b.status === 'Pending');
      
      // Get approved bookings that need payment confirmation
      const pendingPayments = bookings.filter(b => 
        b.status === 'Approved' && !b.paymentConfirmed
      ).map(booking => ({
        id: booking._id,
        customerName: booking.firstName && booking.surname ? 
          `${booking.firstName} ${booking.surname}` : 
          booking.name || 'N/A',
        bookingType: booking.eventType,
        amount: booking.amount || 0,
        date: booking.date,
        createdAt: booking.createdAt
      }));
      
      // Get recent bookings (last 5)
      const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      // Get upcoming events (next 5)
      const upcomingEvents = [...bookings]
        .filter(b => new Date(b.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

      // Calculate revenue
      const revenue = calculateRevenue(bookings);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        totalSamuhLagan: samuhLagan.length,
        totalStudentAwards: studentAwards.length,
        totalTeamRegistrations: 0, // Set to 0 since we removed team registrations
        recentBookings,
        upcomingEvents,
        pendingPayments,
        pendingBookingsList: pendingBookings,
        revenue,
        // New dashboard stats
        totalUsers: dashboardStats.totalUsers || 0,
        activeStreams: dashboardStats.activeStreams || 0,
        totalRevenue: dashboardStats.totalRevenue || 0,
        recentUsers: dashboardStats.recentUsers || 0,
        recentBookingsCount: dashboardStats.recentBookings || 0,
        userRoles: dashboardStats.userRoles || [],
        bookingStatuses: dashboardStats.bookingStatuses || []
      });

      setLastUpdated(new Date());
      console.log('Dashboard state updated successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Retry mechanism
      if (retryCount < maxRetries) {
        console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchDashboardData(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          setError('Session expired. Please log in again.');
          // The axiosInstance interceptor should handle redirect to /auth
        } else if (error.response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(`Server error: ${error.response.data?.message || 'Unable to fetch dashboard data'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // Check if the response is HTML (indicates frontend server is serving instead of backend)
        const responseText = error.request.responseText;
        if (responseText && responseText.includes('<html')) {
          setError('Backend server is not running. Please start the server and try again.');
        } else {
          setError('Unable to connect to the server. Please check your connection and try again.');
        }
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // 5 minutes in milliseconds
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const calculateRevenue = (bookings) => {
    // Ensure bookings is always an array (Array Method Safety Pattern)
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Initialize monthly and yearly totals
    let monthlyRevenue = 0;
    let previousMonthlyRevenue = 0;
    let yearlyRevenue = 0;
    const monthlyBreakdown = Array(12).fill(0);
    const yearlyBreakdown = {};
    
    safeBookings.forEach(booking => {
      if (booking && booking.status === 'Booked' && booking.paymentConfirmed) {
        const bookingDate = new Date(booking.date);
        const bookingMonth = bookingDate.getMonth();
        const bookingYear = bookingDate.getFullYear();
        const amount = booking.amount || 0;
        
        // Add to yearly breakdown
        if (!yearlyBreakdown[bookingYear]) {
          yearlyBreakdown[bookingYear] = 0;
        }
        yearlyBreakdown[bookingYear] += amount;
        
        // Add to monthly breakdown
        monthlyBreakdown[bookingMonth] += amount;
        
        // Add to current year's total
        if (bookingYear === currentYear) {
          yearlyRevenue += amount;
        }
        
        // Add to current month's total
        if (bookingYear === currentYear && bookingMonth === currentMonth) {
          monthlyRevenue += amount;
        }
        
        // Add to previous month's total
        if (bookingYear === previousMonthYear && bookingMonth === previousMonth) {
          previousMonthlyRevenue += amount;
        }
      }
    });
    
    // Calculate growth percentage
    let growthPercentage = 0;
    if (previousMonthlyRevenue > 0) {
      growthPercentage = Math.round(((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100);
    } else if (monthlyRevenue > 0) {
      growthPercentage = 100; // If previous month was 0 but current isn't, show 100% growth
    }
    
    return {
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
      monthlyBreakdown,
      yearlyBreakdown,
      growth: growthPercentage
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
        <div className="card-glass animate-fade-in-up">
          <div className="max-w-md w-full mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchDashboardData}
                className="btn-primary px-6 py-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary px-6 py-2"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Add the missing calculatePercentage function
  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  // Get user role counts
  const getUserRoleCount = (role) => {
    const roleData = stats.userRoles.find(r => r._id === role);
    return roleData ? roleData.count : 0;
  };

  // Get booking status counts
  const getBookingStatusCount = (status) => {
    const statusData = stats.bookingStatuses.find(s => s._id === status);
    return statusData ? statusData.count : 0;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-4 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up p-6">
        {/* Welcome Section with Modern Dark Design */}
        <div className="relative mb-8 overflow-hidden animate-fade-in-up">
          <div className="glass-effect p-6 sm:p-8 relative rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-400/20 to-neon-400/20 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-400/20 to-electric-400/20 rounded-tr-full"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                  <ChartBarIconSolid className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Overview</h1>
                  <p className="text-neutral-300 text-base sm:text-lg">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-2">
                  {lastUpdated && (
                    <span className="text-xs text-neutral-400 hidden sm:block">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors border border-white/10 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Refresh dashboard"
                  >
                    {isRefreshing ? (
                      <div className="w-5 h-5 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ArrowTrendingUpIcon className="w-5 h-5 text-neutral-300" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neon-500/20 rounded-lg flex items-center justify-center border border-neon-500/30 shadow-lg shadow-neon-500/20">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-neon-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Today's Revenue</p>
                    <p className="text-lg font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-electric-500/20 rounded-lg flex items-center justify-center border border-electric-500/30 shadow-lg shadow-electric-500/20">
                    <UsersIcon className="w-5 h-5 text-electric-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Active Users</p>
                    <p className="text-lg font-bold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-500/20 rounded-lg flex items-center justify-center border border-secondary-500/30 shadow-lg shadow-secondary-500/20">
                    <SparklesIcon className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Completion Rate</p>
                    <p className="text-lg font-bold text-white">
                      {stats.totalBookings > 0 
                        ? Math.round((getBookingStatusCount('Booked') / stats.totalBookings) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Revenue Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neon-500/20 rounded-xl flex items-center justify-center border border-neon-500/30">
                  <CurrencyDollarIconSolid className="w-7 h-7 text-neon-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Monthly Revenue</h2>
                  <p className="text-sm text-neutral-400">Current month performance</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                ₹{stats.revenue.monthly.toLocaleString()}
              </span>
              <div className="flex items-center space-x-1">
                {stats.revenue.growth >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.revenue.growth)}%
                </span>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              Compared to last month
            </p>
          </div>

          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
                  <UserGroupIconSolid className="w-7 h-7 text-electric-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">User Growth</h2>
                  <p className="text-sm text-neutral-400">New users this month</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {stats.recentUsers}
              </span>
              <div className="flex items-center space-x-1">
                {stats.recentUsers > 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.recentUsers > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.recentUsers}%
                </span>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              {stats.totalUsers} total users
            </p>
          </div>
        </div>

        {/* Booking Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIconSolid className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Booking Stats</h2>
                  <p className="text-sm text-neutral-400">Current status breakdown</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-300">Pending</span>
                  <span className="text-white font-medium">{getBookingStatusCount('Pending')}</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{width: `${calculatePercentage(getBookingStatusCount('Pending'), stats.totalBookings)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-300">Approved</span>
                  <span className="text-white font-medium">{getBookingStatusCount('Approved')}</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-electric-500 h-2 rounded-full" 
                    style={{width: `${calculatePercentage(getBookingStatusCount('Approved'), stats.totalBookings)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-300">Booked</span>
                  <span className="text-white font-medium">{getBookingStatusCount('Booked')}</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-neon-500 h-2 rounded-full" 
                    style={{width: `${calculatePercentage(getBookingStatusCount('Booked'), stats.totalBookings)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-300">Rejected</span>
                  <span className="text-white font-medium">{getBookingStatusCount('Rejected')}</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{width: `${calculatePercentage(getBookingStatusCount('Rejected'), stats.totalBookings)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                  <DocumentChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
                  <p className="text-sm text-neutral-400">Latest booking requests</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/booking-management')}
                className="text-sm text-electric-400 hover:text-electric-300 font-medium flex items-center"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 glass-effect rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-electric flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.eventType}</h3>
                        <p className="text-sm text-neutral-400">
                          {booking.firstName && booking.surname 
                            ? `${booking.firstName} ${booking.surname}` 
                            : booking.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">₹{booking.amount || 0}</p>
                      <p className="text-sm text-neutral-400">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400">No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* User Roles Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-neon rounded-xl flex items-center justify-center shadow-lg">
                  <UserGroupIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">User Roles</h2>
                  <p className="text-sm text-neutral-400">Distribution across the platform</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 glass-effect rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{getUserRoleCount('admin')}</p>
                <p className="text-sm text-neutral-400">Admins</p>
              </div>
              
              <div className="text-center p-4 glass-effect rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{getUserRoleCount('user')}</p>
                <p className="text-sm text-neutral-400">Users</p>
              </div>
              
              <div className="text-center p-4 glass-effect rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UsersIcon className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{getUserRoleCount('committeemember')}</p>
                <p className="text-sm text-neutral-400">Committee</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                  <p className="text-sm text-neutral-400">Next scheduled bookings</p>
                </div>
              </div>
            </div>
            
            {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 glass-effect rounded-xl border border-white/10">
                    <div>
                      <h3 className="font-medium text-white">{event.eventType}</h3>
                      <p className="text-sm text-neutral-400">
                        {event.firstName && event.surname 
                          ? `${event.firstName} ${event.surname}` 
                          : event.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;