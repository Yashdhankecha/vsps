import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import {
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const CommitteeReports = () => {
  const [reportData, setReportData] = useState({
    bookings: [],
    awards: [],
    samuhData: [],
    stats: {
      totalBookings: 0,
      approvedBookings: 0,
      pendingBookings: 0,
      totalAwards: 0,
      approvedAwards: 0,
      pendingAwards: 0,
      samuhEntries: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [bookingsRes, awardsRes, samuhRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/bookings/student-awards'),
        axios.get('/api/bookings/samuh-lagan')
      ]);

      const bookings = bookingsRes.data || [];
      const awards = awardsRes.data || [];
      const samuhData = samuhRes.data || [];

      // Filter data by date range
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date

      const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      const filteredAwards = awards.filter(award => {
        const awardDate = new Date(award.createdAt);
        return awardDate >= startDate && awardDate <= endDate;
      });

      const filteredSamuhData = samuhData.filter(data => {
        const dataDate = new Date(data.createdAt);
        return dataDate >= startDate && dataDate <= endDate;
      });

      // Calculate statistics
      const stats = {
        totalBookings: filteredBookings.length,
        approvedBookings: filteredBookings.filter(b => b.status === 'Approved' || b.status === 'Booked').length,
        pendingBookings: filteredBookings.filter(b => b.status === 'Pending').length,
        rejectedBookings: filteredBookings.filter(b => b.status === 'Rejected').length,
        totalAwards: filteredAwards.length,
        approvedAwards: filteredAwards.filter(a => a.status === 'Approved').length,
        pendingAwards: filteredAwards.filter(a => a.status === 'Pending').length,
        rejectedAwards: filteredAwards.filter(a => a.status === 'Rejected').length,
        samuhEntries: filteredSamuhData.length
      };

      setReportData({
        bookings: filteredBookings,
        awards: filteredAwards,
        samuhData: filteredSamuhData,
        stats
      });

      setError(null);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = (type) => {
    // Simple CSV export functionality
    let csvContent = '';
    let filename = '';

    if (type === 'bookings') {
      csvContent = 'Date Created,Name,Event Type,Date,Status,Amount\n';
      reportData.bookings.forEach(booking => {
        csvContent += `${new Date(booking.createdAt).toLocaleDateString()},\"${booking.firstName} ${booking.surname}\",${booking.eventType},${new Date(booking.date).toLocaleDateString()},${booking.status},${booking.amount || 0}\n`;
      });
      filename = `bookings_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    } else if (type === 'awards') {
      csvContent = 'Date Applied,Student Name,Category,Grade,School,Status,Award Result\n';
      reportData.awards.forEach(award => {
        csvContent += `${new Date(award.createdAt).toLocaleDateString()},\"${award.studentName}\",${award.category},${award.grade},\"${award.school}\",${award.status},\"${award.result || 'N/A'}\"\n`;
      });
      filename = `awards_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Committee Reports</h1>
        <p className="text-gray-600">View and export community activity reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={() => exportReport('bookings')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export Bookings
            </button>
            <button
              onClick={() => exportReport('awards')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export Awards
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.totalBookings}</h3>
              <div className="mt-2 text-sm">
                <span className="text-green-600">{reportData.stats.approvedBookings} Approved</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="text-yellow-600">{reportData.stats.pendingBookings} Pending</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Student Awards</p>
              <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.totalAwards}</h3>
              <div className="mt-2 text-sm">
                <span className="text-green-600">{reportData.stats.approvedAwards} Approved</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="text-yellow-600">{reportData.stats.pendingAwards} Pending</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Samuh Marriage Data</p>
              <h3 className="text-2xl font-bold text-gray-900">{reportData.stats.samuhEntries}</h3>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Records Added</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Committee Actions</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData.stats.approvedBookings + reportData.stats.approvedAwards + reportData.stats.rejectedBookings + reportData.stats.rejectedAwards}
              </h3>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Total Decisions</span>
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed View */}
      {reportType === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {reportData.bookings.slice(0, 5).map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.firstName} {booking.surname}
                    </p>
                    <p className="text-sm text-gray-600">{booking.eventType}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Approved' || booking.status === 'Booked' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Awards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Awards</h3>
            <div className="space-y-4">
              {reportData.awards.slice(0, 5).map((award, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {award.studentName}
                    </p>
                    <p className="text-sm text-gray-600">{award.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(award.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    award.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    award.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {award.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary View */}
      {reportType === 'summary' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((reportData.stats.approvedBookings / Math.max(reportData.stats.totalBookings, 1)) * 100)}%
              </div>
              <p className="text-gray-600">Booking Approval Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((reportData.stats.approvedAwards / Math.max(reportData.stats.totalAwards, 1)) * 100)}%
              </div>
              <p className="text-gray-600">Award Approval Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {reportData.stats.samuhEntries}
              </div>
              <p className="text-gray-600">Marriage Records Added</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeReports;