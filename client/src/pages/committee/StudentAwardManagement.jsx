import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrophyIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const StudentAwardManagement = () => {
  const [awards, setAwards] = useState([]);
  const [filteredAwards, setFilteredAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAward, setSelectedAward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAwards();
  }, []);

  useEffect(() => {
    filterAwards();
  }, [awards, searchTerm, statusFilter, categoryFilter]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/student-awards');
      const awardsData = response.data || [];
      
      // Sort by creation date (newest first)
      const sortedAwards = awardsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setAwards(sortedAwards);
      setError(null);
    } catch (error) {
      console.error('Error fetching awards:', error);
      setError('Failed to load student awards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterAwards = () => {
    let filtered = [...awards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(award => 
        (award.studentName && award.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (award.school && award.school.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (award.category && award.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (award.parentName && award.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(award => award.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(award => award.category === categoryFilter);
    }

    setFilteredAwards(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(awards.map(a => a.category).filter(Boolean))];
    return categories;
  };

  const handleAwardAction = async (awardId, action, result = '', reason = '') => {
    try {
      setActionLoading(true);
      let newStatus;
      let updateData = {
        reviewedBy: 'Committee Member', // This should ideally come from the auth context
        reviewedAt: new Date()
      };

      if (action === 'approve') {
        newStatus = 'Approved';
        updateData.result = result;
      } else if (action === 'reject') {
        newStatus = 'Rejected';
        updateData.rejectionReason = reason;
      }

      updateData.status = newStatus;

      await axios.patch(`/api/bookings/student-awards/${awardId}`, updateData);

      // Update local state
      setAwards(prev => prev.map(award => 
        award._id === awardId 
          ? { ...award, ...updateData }
          : award
      ));

      setShowModal(false);
      setSelectedAward(null);
    } catch (error) {
      console.error('Error updating award:', error);
      alert('Failed to update award. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Awarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'academic excellence':
        return <AcademicCapIcon className="h-5 w-5 text-blue-600" />;
      case 'sports achievement':
        return <TrophyIcon className="h-5 w-5 text-yellow-600" />;
      case 'cultural performance':
        return <StarIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <AcademicCapIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student awards...</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Award Management</h1>
        <p className="text-gray-600">Review and manage student award applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search awards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Awarded">Awarded</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {filteredAwards.length}</span>
            <span>Pending: {filteredAwards.filter(a => a.status === 'Pending').length}</span>
          </div>
        </div>
      </div>

      {/* Awards List */}
      <div className="space-y-4">
        {filteredAwards.length > 0 ? (
          filteredAwards.map((award) => (
            <div
              key={award._id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(award.category)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {award.studentName || 'Unknown Student'}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(award.status)}`}>
                        {award.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAward(award);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {award.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAward(award);
                              setShowModal(true);
                            }}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAward(award);
                              setShowModal(true);
                            }}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {award.category || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Grade {award.grade || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {award.school || 'School not provided'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Applied: {new Date(award.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Parent Info */}
                  {award.parentName && (
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Parent: {award.parentName}</span>
                      {award.parentPhone && <span>Phone: {award.parentPhone}</span>}
                    </div>
                  )}

                  {/* Achievement Description */}
                  {award.achievement && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Achievement:</strong> {award.achievement}
                      </p>
                    </div>
                  )}

                  {/* Award Result */}
                  {award.result && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Award Result:</strong> {award.result}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {award.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {award.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No awards found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No student award applications available for review.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal for award details and actions */}
      {showModal && selectedAward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  {getCategoryIcon(selectedAward.category)}
                  <span className="ml-2">Student Award Details</span>
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Award Information */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <p className="text-gray-900">{selectedAward.studentName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedAward.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grade</label>
                    <p className="text-gray-900">Grade {selectedAward.grade || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School</label>
                    <p className="text-gray-900">{selectedAward.school || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                    <p className="text-gray-900">{selectedAward.parentName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
                    <p className="text-gray-900">{selectedAward.parentPhone || 'Not provided'}</p>
                  </div>
                </div>

                {selectedAward.achievement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Achievement Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedAward.achievement}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Date</label>
                  <p className="text-gray-900">{new Date(selectedAward.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAward.status === 'Pending' && (
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        const result = prompt('Please specify the award result (e.g., "First Prize in Academic Excellence", "Certificate of Merit"):');
                        if (result) {
                          handleAwardAction(selectedAward._id, 'approve', result);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Approve & Set Award'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleAwardAction(selectedAward._id, 'reject', '', reason);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reject Application'}
                    </button>
                  </div>
                </div>
              )}

              {/* Current Status Display */}
              {selectedAward.status !== 'Pending' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Review Status</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAward.status)}`}>
                      {selectedAward.status}
                    </span>
                    {selectedAward.reviewedAt && (
                      <span className="text-sm text-gray-500">
                        on {new Date(selectedAward.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {selectedAward.result && (
                    <p className="text-sm text-green-800 bg-green-100 p-2 rounded">
                      <strong>Award:</strong> {selectedAward.result}
                    </p>
                  )}
                  {selectedAward.rejectionReason && (
                    <p className="text-sm text-red-800 bg-red-100 p-2 rounded">
                      <strong>Rejection Reason:</strong> {selectedAward.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAwardManagement;