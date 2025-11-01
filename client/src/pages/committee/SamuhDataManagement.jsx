import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import {
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SamuhDataManagement = () => {
  const [samuhData, setSamuhData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    marriageDate: '',
    venue: '',
    brideParents: '',
    groomParents: '',
    samaj: '',
    address: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSamuhData();
  }, []);

  useEffect(() => {
    filterData();
  }, [samuhData, searchTerm]);

  const fetchSamuhData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/samuh-lagan');
      const data = response.data || [];
      
      // Sort by marriage date (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.marriageDate || b.createdAt) - new Date(a.marriageDate || a.createdAt)
      );
      
      setSamuhData(sortedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching Samuh data:', error);
      setError('Failed to load Samuh marriage data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(samuhData);
      return;
    }

    const filtered = samuhData.filter(data => 
      (data.brideName && data.brideName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (data.groomName && data.groomName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (data.samaj && data.samaj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (data.venue && data.venue.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredData(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editingData) {
        // Update existing data
        await axios.put(`/api/bookings/samuh-lagan/${editingData._id}`, formData);
        setSamuhData(prev => prev.map(item => 
          item._id === editingData._id ? { ...item, ...formData } : item
        ));
      } else {
        // Create new data
        const response = await axios.post('/api/bookings/samuh-lagan', formData);
        setSamuhData(prev => [response.data, ...prev]);
      }
      
      // Reset form
      setFormData({
        brideName: '',
        groomName: '',
        marriageDate: '',
        venue: '',
        brideParents: '',
        groomParents: '',
        samaj: '',
        address: '',
        notes: ''
      });
      setShowForm(false);
      setEditingData(null);
    } catch (error) {
      console.error('Error saving Samuh data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (data) => {
    setFormData({
      brideName: data.brideName || '',
      groomName: data.groomName || '',
      marriageDate: data.marriageDate ? new Date(data.marriageDate).toISOString().split('T')[0] : '',
      venue: data.venue || '',
      brideParents: data.brideParents || '',
      groomParents: data.groomParents || '',
      samaj: data.samaj || '',
      address: data.address || '',
      notes: data.notes || ''
    });
    setEditingData(data);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await axios.delete(`/api/bookings/samuh-lagan/${id}`);
      setSamuhData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting Samuh data:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      brideName: '',
      groomName: '',
      marriageDate: '',
      venue: '',
      brideParents: '',
      groomParents: '',
      samaj: '',
      address: '',
      notes: ''
    });
    setEditingData(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Samuh marriage data...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Samuh Marriage Data</h1>
            <p className="text-gray-600">Manage community marriage records and data</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Record</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bride, groom, samaj, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Records: {filteredData.length}</span>
            <span>This Year: {filteredData.filter(d => new Date(d.marriageDate).getFullYear() === new Date().getFullYear()).length}</span>
          </div>
        </div>
      </div>

      {/* Data List */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((data) => (
            <div
              key={data._id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {data.brideName || 'Bride Name'} & {data.groomName || 'Groom Name'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(data)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(data._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Marriage Date:</span>
                      <p className="font-medium text-gray-900">
                        {data.marriageDate ? new Date(data.marriageDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Venue:</span>
                      <p className="font-medium text-gray-900">{data.venue || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Samaj:</span>
                      <p className="font-medium text-gray-900">{data.samaj || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Bride's Parents:</span>
                      <p className="font-medium text-gray-900">{data.brideParents || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Groom's Parents:</span>
                      <p className="font-medium text-gray-900">{data.groomParents || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium text-gray-900">{data.address || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {data.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-gray-700 text-sm mt-1">{data.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No marriage records found</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms to see more results.'
                : 'Start by adding the first Samuh marriage record.'}
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingData ? 'Edit Marriage Record' : 'Add New Marriage Record'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bride Name *
                    </label>
                    <input
                      type="text"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Groom Name *
                    </label>
                    <input
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marriage Date
                    </label>
                    <input
                      type="date"
                      name="marriageDate"
                      value={formData.marriageDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bride's Parents
                    </label>
                    <input
                      type="text"
                      name="brideParents"
                      value={formData.brideParents}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Groom's Parents
                    </label>
                    <input
                      type="text"
                      name="groomParents"
                      value={formData.groomParents}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Samaj
                    </label>
                    <input
                      type="text"
                      name="samaj"
                      value={formData.samaj}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or comments..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>{editingData ? 'Update Record' : 'Save Record'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamuhDataManagement;