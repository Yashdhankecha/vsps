import { useState, useEffect, useCallback } from 'react';
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
  XCircleIcon
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
    const currentYear = now.getFullYear();

    // Initialize monthly and yearly totals
    let monthlyRevenue = 0;
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
      }
    });

    return {
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
      monthlyBreakdown,
      yearlyBreakdown
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
        <div className="card-glass animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
        {/* Welcome Section with Modern Dark Design */}
        <div className="relative mb-8 overflow-hidden animate-fade-in-up">
          <div className="glass-effect p-8 relative rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-400/20 to-neon-400/20 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-400/20 to-electric-400/20 rounded-tr-full"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                  <ChartBarIconSolid className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                  <p className="text-neutral-300 text-lg">Welcome back! Here's what's happening today.</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="card-hover p-8 relative overflow-hidden">
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
              <span className="text-4xl font-bold text-white">
                ₹{stats.revenue.monthly.toLocaleString()}
              </span>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400" />
                <span className="text-neon-400 font-semibold text-sm">
                  +{calculateGrowth(stats.revenue.monthly, Math.max(stats.revenue.monthly - 1000, 0))}%
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            
            {/* Mini Chart */}
            <div className="grid grid-cols-6 gap-2">
              {stats.revenue.monthlyBreakdown.slice(0, 6).map((amount, index) => (
                <div key={index} className="text-center">
                  <div className="h-8 bg-neutral-700/50 rounded-sm mb-2 relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-neon rounded-sm transition-all duration-1000"
                      style={{
                        height: `${Math.max((amount / Math.max(...stats.revenue.monthlyBreakdown)) * 100, 10)}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {new Date(0, index).toLocaleString('default', { month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-hover p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
                  <BanknotesIcon className="w-7 h-7 text-electric-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Yearly Revenue</h2>
                  <p className="text-sm text-neutral-400">Annual performance metrics</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-4xl font-bold text-white">
                ₹{stats.revenue.yearly.toLocaleString()}
              </span>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-electric-400" />
                <span className="text-electric-400 font-semibold text-sm">
                  +{calculateGrowth(stats.revenue.yearly, Math.max(stats.revenue.yearly - 5000, 0))}%
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              {new Date().getFullYear()} Annual Report
            </p>
            
            {/* Yearly Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats.revenue.yearlyBreakdown).map(([year, amount]) => (
                <div key={year} className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-white/5">
                  <span className="text-neutral-300">{year}</span>
                  <span className="font-semibold text-white">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
                <CalendarIcon className="w-6 h-6 text-electric-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neon-500/20 rounded-xl flex items-center justify-center border border-neon-500/30">
                <UserGroupIcon className="w-6 h-6 text-neon-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Pending Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center border border-secondary-500/30">
                <AcademicCapIcon className="w-6 h-6 text-secondary-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Samuh Lagan</p>
                <p className="text-2xl font-bold text-white">{stats.totalSamuhLagan}</p>
              </div>
            </div>
          </div>

          <div className="card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-sunset opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sunset-500/20 rounded-xl flex items-center justify-center border border-sunset-500/30">
                <TrophyIcon className="w-6 h-6 text-sunset-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Student Awards</p>
                <p className="text-2xl font-bold text-white">{stats.totalStudentAwards}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          {/* Recent Bookings */}
          <div className="card-hover p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-electric-500/20 rounded-lg flex items-center justify-center border border-electric-500/30">
                <DocumentChartBarIcon className="w-5 h-5 text-electric-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            </div>
            
            {stats.recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-400">No recent bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-white/5 hover:bg-neutral-800/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-electric rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {booking.firstName && booking.surname ? 
                            `${booking.firstName} ${booking.surname}` : 
                            booking.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-neutral-400">{booking.eventType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ₹{booking.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card-hover p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-neon-500/20 rounded-lg flex items-center justify-center border border-neon-500/30">
                <ClockIcon className="w-5 h-5 text-neon-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
            </div>
            
            {stats.upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-400">No upcoming events found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-white/5 hover:bg-neutral-800/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {event.firstName && event.surname ? 
                            `${event.firstName} ${event.surname}` : 
                            event.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-neutral-400">{event.eventType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ₹{event.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;