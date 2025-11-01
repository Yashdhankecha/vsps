import React, { useState, useEffect } from 'react';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import axios from '../utils/axiosConfig';
import { Card, Input, Button } from '../components';

function ProfileSettings() {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notifications: {
      email: true,
      sms: false
    }
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/users/profile');

      const userData = response.data;
      setProfileData({
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        company: userData.company || '',
        address: userData.address || '',
        notifications: userData.notifications || {
          email: true,
          sms: false
        }
      });

      if (userData.profileImage && userData.profileImage.url) {
        setPreviewImage(userData.profileImage.url);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert('File size too large. Please choose an image under 5MB.');
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axios.put(
          '/api/users/profile-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data && response.data.profileImage) {
          setPreviewImage(response.data.profileImage);
        }
      } catch (err) {
        console.error('Image upload error:', err);
        alert(err.response?.data?.message || 'Failed to upload image');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        '/api/users/profile',
        profileData
      );

      if (response.data) {
        alert('Profile updated successfully!');
      }

    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <div className="text-red-400 text-center">
              {error}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-neutral-300">Manage your account information and preferences</p>
        </div>
        
        <Card className="p-6 glass-effect border border-white/10">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-800/50 border-2 border-white/20">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      e.target.src = 'https://your-default-avatar-url.com/default.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-700/50">
                    <FaUser className="text-neutral-400 text-4xl" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-gradient-electric p-3 rounded-full cursor-pointer hover:shadow-lg hover:shadow-electric-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <FaCamera className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-sm text-neutral-400 mt-3">Click to upload profile picture</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                placeholder="Enter your name"
                variant="dark"
              />
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                variant="dark"
              />
              
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                variant="dark"
              />
              
              <Input
                label="Company"
                type="text"
                name="company"
                value={profileData.company}
                onChange={handleInputChange}
                placeholder="Enter your company"
                variant="dark"
              />
            </div>
            
            <Input
              label="Address"
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              variant="dark"
            />
            
            {/* Notification Preferences */}
            <Card className="p-6 glass-effect border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaEnvelope className="text-electric-400 mr-3" />
                    <span className="text-neutral-200">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.notifications.email}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: e.target.checked
                        }
                      }))}
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-electric"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaPhone className="text-electric-400 mr-3" />
                    <span className="text-neutral-200">SMS Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.notifications.sms}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          sms: e.target.checked
                        }
                      }))}
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-electric"></div>
                  </label>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default ProfileSettings;