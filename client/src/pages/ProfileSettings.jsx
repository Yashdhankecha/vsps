import React, { useState, useEffect } from 'react';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from '../utils/axiosConfig';
import { Card, Input, Button } from '../components';

function ProfileSettings() {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
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
        address: userData.address || ''
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
    <div className="min-h-screen bg-gradient-mesh py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {profileData.username ? `${profileData.username}'s Profile` : 'Profile Settings'}
          </h1>
          <p className="text-neutral-300 text-lg">Manage your account information</p>
        </div>
        
        <div className="card-glass p-6 sm:p-8 animate-fade-in-up">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-electric-500/20 to-neon-500/20 border-4 border-white/20 shadow-xl">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={profileData.username || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      e.target.src = 'https://your-default-avatar-url.com/default.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-electric-500/30 to-neon-500/30">
                    <FaUser className="text-white text-5xl" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-gradient-electric p-3 rounded-full cursor-pointer hover:shadow-lg hover:shadow-electric-500/30 transition-all duration-300 transform hover:scale-110 shadow-lg group-hover:rotate-12">
                <FaCamera className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-sm text-neutral-400 mt-3">Click camera icon to upload profile picture</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-neutral-200 font-medium">Name</label>
                <Input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  variant="dark"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-neutral-200 font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  variant="dark"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-neutral-200 font-medium">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  variant="dark"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-neutral-200 font-medium">Location</label>
                <Input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  variant="dark"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="pt-6">
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;