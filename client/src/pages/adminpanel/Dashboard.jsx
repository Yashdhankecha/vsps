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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="opacity-90">Here's what's happening with your bookings today.</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{stats.revenue.monthly.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleString('default', { month: 'long' })}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {stats.revenue.monthlyBreakdown.map((amount, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500">
                  {new Date(0, index).toLocaleString('default', { month: 'short' })}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ₹{amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Yearly Revenue</h2>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{stats.revenue.yearly.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date().getFullYear()}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(stats.revenue.yearlyBreakdown)
              .sort(([yearA], [yearB]) => yearB - yearA)
              .slice(0, 4)
              .map(([year, amount]) => (
                <div key={year} className="text-center">
                  <div className="text-xs text-gray-500">{year}</div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{amount.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {stats.pendingBookings} pending bookings
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Samuh Lagan</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalSamuhLagan}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/booking-management" className="text-sm text-blue-600 hover:underline">
              View all requests →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Student Awards</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudentAwards}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/booking-management" className="text-sm text-green-600 hover:underline">
              View all awards →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Registrations</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalTeamRegistrations}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/booking-management" className="text-sm text-amber-600 hover:underline">
              View all teams →
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Bookings</h2>
            </div>
            <Link to="/admin/booking-management" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.pendingBookingsList.length > 0 ? (
              stats.pendingBookingsList.slice(0, 5).map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.firstName && booking.surname ? 
                        `${booking.firstName} ${booking.surname}` : 
                        booking.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">{booking.eventType}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    to="/admin/booking-management"
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending bookings</p>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
            </div>
            <Link to="/admin/booking-management" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.pendingPayments.length > 0 ? (
              stats.pendingPayments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {payment.bookingType}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{payment.amount}
                    </span>
                    <Link 
                      to="/admin/booking-management"
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending payments</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/admin/booking-management" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentBookings.map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.firstName && booking.surname ? 
                      `${booking.firstName} ${booking.surname}` : 
                      booking.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{booking.eventType}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Booked' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/admin/booked-dates" className="text-sm text-purple-600 hover:underline">
              View calendar
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.firstName && event.surname ? 
                      `${event.firstName} ${event.surname}` : 
                      event.name || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
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
        <Link to="/admin/booking-management" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
              <p className="text-sm text-gray-500">View and manage all bookings</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/booked-dates" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Calendar</h3>
              <p className="text-sm text-gray-500">Check booked dates</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/reports" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reports</h3>
              <p className="text-sm text-gray-500">View booking statistics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;