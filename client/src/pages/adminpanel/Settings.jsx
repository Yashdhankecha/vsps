import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth-related state and storage
    localStorage.clear();
    // Redirect to auth page
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-neutral-300 text-lg">Account settings and logout</p>
        </div>

        <div className="card-hover p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <ArrowRightOnRectangleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Logout</h2>
            <p className="text-neutral-300 mb-6">Sign out of your admin account</p>
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center space-x-2 mx-auto"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
