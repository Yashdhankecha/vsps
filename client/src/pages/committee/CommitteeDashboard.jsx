import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import {
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const CommitteeDashboard = () => {
  const [stats, setStats] = useState({
    pendingBookings: 0,
    pendingAwards: 0,
    samuhDataEntries: 0,
    totalApprovals: 0,
    recentActivity: [],
    pendingItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommitteeData();
  }, []);

  const fetchCommitteeData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [bookingsRes, awardsRes, samuhRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/bookings/student-awards'),
        axios.get('/api/bookings/samuh-lagan')
      ]);

      const bookings = bookingsRes.data || [];
      const awards = awardsRes.data || [];
      const samuhData = samuhRes.data || [];

      // Filter pending items
      const pendingBookings = bookings.filter(b => b.status === 'Pending');
      const pendingAwards = awards.filter(a => a.status === 'Pending');
      
      // Calculate stats
      const approvedBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Booked');
      
      // Recent activity (last 10 items)
      const recentActivity = [
        ...pendingBookings.slice(0, 3).map(b => ({
          id: b._id,
          type: 'booking',
          title: 'New Booking Request',
          description: `${b.firstName || 'Unknown'} ${b.surname || ''} - ${b.eventType}`,
          time: new Date(b.createdAt).toLocaleTimeString(),
          status: b.status,
          priority: 'high'
        })),
        ...pendingAwards.slice(0, 3).map(a => ({
          id: a._id,
          type: 'award',
          title: 'Award Application',
          description: `${a.studentName || 'Unknown Student'} - ${a.category}`,
          time: new Date(a.createdAt).toLocaleTimeString(),
          status: a.status,
          priority: 'medium'
        })),
        ...samuhData.slice(0, 2).map(s => ({
          id: s._id,
          type: 'samuh',
          title: 'Samuh Marriage Data',
          description: `${s.brideName || 'Unknown'} & ${s.groomName || 'Unknown'}`,
          time: new Date(s.createdAt).toLocaleTimeString(),
          status: 'completed',
          priority: 'low'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

      setStats({
        pendingBookings: pendingBookings.length,
        pendingAwards: pendingAwards.length,
        samuhDataEntries: samuhData.length,
        totalApprovals: approvedBookings.length,
        recentActivity,
        pendingItems: [...pendingBookings, ...pendingAwards]
      });

      setError(null);
    } catch (error) {
      console.error('Error fetching committee data:', error);
      setError('Failed to load committee data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const quickApprove = async (itemId, type, action) => {
    try {
      const endpoint = type === 'booking' ? '/api/bookings' : '/api/bookings/student-awards';
      await axios.patch(`${endpoint}/${itemId}`, {
        status: action === 'approve' ? 'Approved' : 'Rejected'
      });
      
      // Refresh data
      fetchCommitteeData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading committee dashboard...</p>
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
    <div className="p-6 bg-gradient-mesh min-h-screen">
      {/* Welcome Section */}
      <div className="glass-effect rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-electric opacity-20 rounded-bl-full"></div>
        <h1 className="text-2xl font-bold mb-2">Committee Dashboard</h1>
        <p className="text-neutral-300">Manage community bookings, awards, and data efficiently.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card-hover p-6 transition-shadow border-l-4 border-sunset-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Pending Bookings</p>
              <h3 className="text-2xl font-bold text-white">{stats.pendingBookings}</h3>
            </div>
            <div className="bg-sunset-500/20 p-3 rounded-lg border border-sunset-500/30">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-sunset-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/committee/booking-approvals" className="text-sm text-sunset-400 hover:text-sunset-300 hover:underline">
              Review bookings →
            </Link>
          </div>
        </div>

        <div className="card-hover p-6 transition-shadow border-l-4 border-electric-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Pending Awards</p>
              <h3 className="text-2xl font-bold text-white">{stats.pendingAwards}</h3>
            </div>
            <div className="bg-electric-500/20 p-3 rounded-lg border border-electric-500/30">
              <AcademicCapIcon className="h-6 w-6 text-electric-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/committee/student-awards" className="text-sm text-electric-400 hover:text-electric-300 hover:underline">
              Review awards →
            </Link>
          </div>
        </div>

        <div className="card-hover p-6 transition-shadow border-l-4 border-neon-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Samuh Data</p>
              <h3 className="text-2xl font-bold text-white">{stats.samuhDataEntries}</h3>
            </div>
            <div className="bg-neon-500/20 p-3 rounded-lg border border-neon-500/30">
              <UserGroupIcon className="h-6 w-6 text-neon-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/committee/samuh-data" className="text-sm text-neon-400 hover:text-neon-300 hover:underline">
              Manage data →
            </Link>
          </div>
        </div>

        <div className="card-hover p-6 transition-shadow border-l-4 border-secondary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Approvals</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalApprovals}</h3>
            </div>
            <div className="bg-secondary-500/20 p-3 rounded-lg border border-secondary-500/30">
              <ChartBarIcon className="h-6 w-6 text-secondary-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/committee/reports" className="text-sm text-secondary-400 hover:text-secondary-300 hover:underline">
              View reports →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Pending Approvals
            </h2>
            <span className="text-sm text-gray-500">{stats.pendingItems.length} items</span>
          </div>
          
          <div className="space-y-4">
            {stats.pendingItems.length > 0 ? (
              stats.pendingItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.eventType ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <p className="font-medium text-gray-900">
                        {item.firstName && item.surname 
                          ? `${item.firstName} ${item.surname}` 
                          : item.studentName || item.name || 'Unknown'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.eventType || item.category || 'Student Award'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => quickApprove(item._id, item.eventType ? 'booking' : 'award', 'approve')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      title="Approve"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => quickApprove(item._id, item.eventType ? 'booking' : 'award', 'reject')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Reject"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                    <Link
                      to={item.eventType ? '/committee/booking-approvals' : '/committee/student-awards'}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No pending approvals</p>
                <p className="text-sm">All items have been reviewed</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/committee/booking-approvals" 
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-yellow-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Review Bookings</h3>
              <p className="text-sm text-gray-500">Approve or reject booking requests</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/committee/student-awards" 
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Awards</h3>
              <p className="text-sm text-gray-500">Review student award applications</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/committee/samuh-data" 
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Data</h3>
              <p className="text-sm text-gray-500">Manage Samuh marriage records</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CommitteeDashboard;