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
import axios from 'axios';
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Initialize monthly and yearly totals
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    const monthlyBreakdown = Array(12).fill(0);
    const yearlyBreakdown = {};

    bookings.forEach(booking => {
      if (booking.status === 'Booked' && booking.paymentConfirmed) {
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
        axios.get('/api/bookings'),
        axios.get('/api/bookings/samuh-lagan'),
        axios.get('/api/bookings/student-awards'),
        axios.get('/api/admin/forms/team-registrations')
      ]);

      const bookings = bookingsRes.data || [];
      const samuhLagan = samuhLaganRes.data || [];
      const studentAwards = studentAwardRes.data || [];
      const teamRegistrations = teamRegRes.data || [];

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
      setError('Failed to load dashboard data. Please try again later.');
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
    <div className="min-h-screen bg-gradient-mesh p-6">
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
            {Object.entries(stats.revenue.yearlyBreakdown)
              .sort(([yearA], [yearB]) => yearB - yearA)
              .slice(0, 4)
              .map(([year, amount]) => (
                <div key={year} className="bg-neutral-700/30 rounded-xl p-3 text-center border border-neutral-600/30">
                  <div className="text-lg font-bold text-white">{year}</div>
                  <div className="text-sm text-neutral-300">
                    ₹{amount.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-electric opacity-20 rounded-bl-3xl group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-400 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-electric-500/30">
              <CalendarIconSolid className="w-6 h-6 text-electric-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400" />
              <span className="text-neon-400 font-semibold text-sm">+12.5%</span>
              <span className="text-neutral-400 text-sm">vs last month</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-neutral-400">
            <span className="font-medium text-secondary-400">{stats.pendingBookings}</span> pending approval
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-neon opacity-20 rounded-bl-3xl group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-400 mb-1">Samuh Lagan</p>
              <p className="text-3xl font-bold text-white">{stats.totalSamuhLagan}</p>
            </div>
            <div className="w-12 h-12 bg-neon-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-neon-500/30">
              <UserGroupIconSolid className="w-6 h-6 text-neon-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400" />
              <span className="text-neon-400 font-semibold text-sm">+8.3%</span>
              <span className="text-neutral-400 text-sm">this quarter</span>
            </div>
          </div>
          <div className="mt-3">
            <Link to="/admin/booking-management" className="text-xs text-neon-400 hover:text-neon-300 font-medium hover:underline transition-colors duration-200">
              View all requests →
            </Link>
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-400 mb-1">Student Awards</p>
              <p className="text-3xl font-bold text-white">{stats.totalStudentAwards}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-secondary-500/30">
              <AcademicCapIconSolid className="w-6 h-6 text-secondary-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400" />
              <span className="text-neon-400 font-semibold text-sm">+15.7%</span>
              <span className="text-neutral-400 text-sm">applications</span>
            </div>
          </div>
          <div className="mt-3">
            <Link to="/admin/booking-management" className="text-xs text-secondary-400 hover:text-secondary-300 font-medium hover:underline transition-colors duration-200">
              View all awards →
            </Link>
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-electric opacity-20 rounded-bl-3xl group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-400 mb-1">Team Registrations</p>
              <p className="text-3xl font-bold text-white">{stats.totalTeamRegistrations}</p>
            </div>
            <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-electric-500/30">
              <TrophyIconSolid className="w-6 h-6 text-electric-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400" />
              <span className="text-neon-400 font-semibold text-sm">+22.1%</span>
              <span className="text-neutral-400 text-sm">new teams</span>
            </div>
          </div>
          <div className="mt-3">
            <Link to="/admin/booking-management" className="text-xs text-electric-400 hover:text-electric-300 font-medium hover:underline transition-colors duration-200">
              View all teams →
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Bookings */}
        <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="h-5 w-5 text-sunset-400" />
              <h2 className="text-lg font-semibold text-white">Pending Bookings</h2>
            </div>
            <Link to="/admin/booking-management" className="text-sm text-electric-400 hover:text-electric-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.pendingBookingsList.length > 0 ? (
              stats.pendingBookingsList.slice(0, 5).map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sunset-500/10 rounded-lg hover:bg-sunset-500/20 transition-colors border border-sunset-500/20">
                  <div>
                    <p className="font-medium text-white">
                      {booking.firstName && booking.surname ? 
                        `${booking.firstName} ${booking.surname}` : 
                        booking.name || 'N/A'}
                    </p>
                    <p className="text-sm text-neutral-300">{booking.eventType}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    to="/admin/booking-management"
                    className="px-3 py-1 bg-sunset-500/20 text-sunset-300 rounded-full text-sm font-medium hover:bg-sunset-500/30 transition-colors border border-sunset-500/30"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-neutral-400 text-center py-4">No pending bookings</p>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-sunset-400" />
              <h2 className="text-lg font-semibold text-white">Pending Payments</h2>
            </div>
            <Link to="/admin/booking-management" className="text-sm text-electric-400 hover:text-electric-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.pendingPayments.length > 0 ? (
              stats.pendingPayments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sunset-500/10 rounded-lg hover:bg-sunset-500/20 transition-colors border border-sunset-500/20">
                  <div>
                    <p className="font-medium text-white">
                      {payment.customerName}
                    </p>
                    <p className="text-sm text-neutral-300">
                      {payment.bookingType}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-white">
                      ₹{payment.amount}
                    </span>
                    <Link 
                      to="/admin/booking-management"
                      className="px-3 py-1 bg-sunset-500/20 text-sunset-300 rounded-full text-sm font-medium hover:bg-sunset-500/30 transition-colors border border-sunset-500/30"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-400 text-center py-4">No pending payments</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
            <Link to="/admin/booking-management" className="text-sm text-electric-400 hover:text-electric-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentBookings.map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors border border-neutral-600/30">
                <div>
                  <p className="font-medium text-white">
                    {booking.firstName && booking.surname ? 
                      `${booking.firstName} ${booking.surname}` : 
                      booking.name || 'N/A'}
                  </p>
                  <p className="text-sm text-neutral-300">{booking.eventType}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Booked' ? 'bg-neon-500/20 text-neon-300 border border-neon-500/30' :
                    booking.status === 'Approved' ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30' :
                    booking.status === 'Pending' ? 'bg-sunset-500/20 text-sunset-300 border border-sunset-500/30' :
                    'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
            <Link to="/admin/booked-dates" className="text-sm text-electric-400 hover:text-electric-300 hover:underline">
              View calendar
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors border border-neutral-600/30">
                <div>
                  <p className="font-medium text-white">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-neutral-300">
                    {event.firstName && event.surname ? 
                      `${event.firstName} ${event.surname}` : 
                      event.name || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-300">
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/booking-management" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-electric-500/30">
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

        <Link to="/admin/booked-dates" className="glass-effect rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group border border-white/10 hover:border-neon-500/30">
          <div className="flex items-center space-x-4">
            <div className="bg-neon-500/20 p-3 rounded-lg border border-neon-500/30 group-hover:bg-neon-500/30 transition-colors shadow-lg shadow-neon-500/20">
              <ChartBarIcon className="h-6 w-6 text-neon-400" />
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
  );
};

export default Dashboard;