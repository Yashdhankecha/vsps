import { useState, useEffect } from 'react';
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
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings and other data
      const [bookingsRes, samuhLaganRes, studentAwardRes, teamRegRes] = await Promise.all([
        axiosInstance.get('/api/bookings'),
        axiosInstance.get('/api/bookings/samuh-lagan'),
        axiosInstance.get('/api/bookings/student-awards'),
        axiosInstance.get('/api/admin/forms/team-registrations')
      ]);

      // Debug: Log the actual API response structure
      console.log('API Response structures:', {
        bookings: bookingsRes.data,
        samuhLagan: samuhLaganRes.data,
        studentAwards: studentAwardRes.data,
        teamRegistrations: teamRegRes.data
      });

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
      
      const teamRegistrations = Array.isArray(teamRegRes.data) ? teamRegRes.data :
                                Array.isArray(teamRegRes.data?.registrations) ? teamRegRes.data.registrations :
                                Array.isArray(teamRegRes.data?.data) ? teamRegRes.data.data : [];

      // Debug: Log the processed arrays
      console.log('Processed arrays:', {
        bookingsLength: bookings.length,
        samuhLaganLength: samuhLagan.length,
        studentAwardsLength: studentAwards.length,
        teamRegistrationsLength: teamRegistrations.length
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
        totalTeamRegistrations: teamRegistrations.length,
        recentBookings,
        upcomingEvents,
        pendingPayments,
        pendingBookingsList: pendingBookings,
        revenue
      });

      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Loading Dashboard</h3>
            <p className="text-neutral-300">Please wait while we prepare your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card-glass p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <div>
                  <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                  <p className="text-neutral-300 text-lg">Welcome back! Here's what's happening today.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neon-500/20 rounded-lg flex items-center justify-center border border-neon-500/30 shadow-lg shadow-neon-500/20">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-neon-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Today's Revenue</p>
                    <p className="text-lg font-bold text-white">₹45,280</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-electric-500/20 rounded-lg flex items-center justify-center border border-electric-500/30 shadow-lg shadow-electric-500/20">
                    <UsersIcon className="w-5 h-5 text-electric-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Active Users</p>
                    <p className="text-lg font-bold text-white">1,248</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-500/20 rounded-lg flex items-center justify-center border border-secondary-500/30 shadow-lg shadow-secondary-500/20">
                    <SparklesIcon className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Completion Rate</p>
                    <p className="text-lg font-bold text-white">94.5%</p>
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
                <span className="text-neon-400 font-semibold text-sm">+15.3%</span>
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
                <span className="text-electric-400 font-semibold text-sm">+28.7%</span>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <Link to="/admin/bookings" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-electric-500/30">
            <div className="flex items-center space-x-4">
              <div className="bg-electric-500/20 p-3 rounded-lg border border-electric-500/30 group-hover:bg-electric-500/30 transition-colors shadow-lg shadow-electric-500/20">
                <CalendarIcon className="h-6 w-6 text-electric-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Manage Bookings</h3>
                <p className="text-sm text-neutral-300">View and manage all bookings</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/users" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-neon-500/30">
            <div className="flex items-center space-x-4">
              <div className="bg-neon-500/20 p-3 rounded-lg border border-neon-500/30 group-hover:bg-neon-500/30 transition-colors shadow-lg shadow-neon-500/20">
                <UserGroupIcon className="h-6 w-6 text-neon-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">User Management</h3>
                <p className="text-sm text-neutral-300">Manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/booked-dates" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-secondary-500/30">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary-500/20 p-3 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-colors shadow-lg shadow-secondary-500/20">
                <CalendarIconSolid className="h-6 w-6 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">View Calendar</h3>
                <p className="text-sm text-neutral-300">Check booked dates</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/reports" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-secondary-500/30">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary-500/20 p-3 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-colors shadow-lg shadow-secondary-500/20">
                <ChartBarIcon className="h-6 w-6 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reports</h3>
                <p className="text-sm text-neutral-300">View booking statistics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;