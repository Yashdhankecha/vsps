import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlayIcon, 
  PlusIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';

const VideoManagement = () => {
  const [videos] = useState([
    { 
      id: 1, 
      title: 'Introduction to Our Services', 
      duration: '2:30', 
      status: 'Published', 
      views: 1234,
      uploadDate: '2024-01-15',
      description: 'An overview of our temple services and booking process'
    },
    { 
      id: 2, 
      title: 'Temple Tour Guide', 
      duration: '5:45', 
      status: 'Draft', 
      views: 856,
      uploadDate: '2024-01-10',
      description: 'Virtual tour of our temple facilities and sacred spaces'
    },
    { 
      id: 3, 
      title: 'Ceremonial Procedures', 
      duration: '8:20', 
      status: 'Published', 
      views: 2103,
      uploadDate: '2024-01-05',
      description: 'Step-by-step guide for various ceremonial procedures'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <FilmIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Video Management</h1>
              <p className="text-neutral-300 text-sm sm:text-base">Manage and organize video content</p>
            </div>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <DocumentArrowUpIcon className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Total Videos</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{videos.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
              <FilmIcon className="w-5 h-5 sm:w-6 sm:h-6 text-electric-400" />
            </div>
          </div>
        </div>

        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Published</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{videos.filter(v => v.status === 'Published').length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-500/20 rounded-xl flex items-center justify-center border border-neon-500/30">
              <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neon-400" />
            </div>
          </div>
        </div>

        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Total Views</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center border border-secondary-500/30">
              <PlayIconSolid className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-400" />
            </div>
          </div>
        </div>

        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-sunset opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Drafts</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{videos.filter(v => v.status === 'Draft').length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sunset-500/20 rounded-xl flex items-center justify-center border border-sunset-500/30">
              <PencilIcon className="w-5 h-5 sm:w-6 sm:h-6 text-sunset-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="card-glass animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="border-b border-white/10 pb-4 sm:pb-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Video Library</h2>
          <p className="text-neutral-300 text-sm mt-1">Manage your video content and uploads</p>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="card-hover border border-white/10">
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 h-32 relative rounded-t-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <PlayIconSolid className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    video.status === 'Published' ? 'bg-neon-500/20 text-neon-300 border border-neon-500/30' : 
                    'bg-sunset-500/20 text-sunset-300 border border-sunset-500/30'
                  }`}>
                    {video.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                    {video.duration}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 text-sm">{video.title}</h3>
                <p className="text-neutral-300 text-xs mb-3 line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-xs py-2">
                    <PencilIcon className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 btn-accent text-xs py-2">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    View
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30">
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card-hover overflow-hidden">
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 h-48 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                    <PlayIconSolid className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    video.status === 'Published' ? 'bg-neon-500/20 text-neon-300 border border-neon-500/30' : 
                    'bg-sunset-500/20 text-sunset-300 border border-sunset-500/30'
                  }`}>
                    {video.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                    {video.duration}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-white mb-2">{video.title}</h3>
                <p className="text-neutral-300 text-sm mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between text-sm text-neutral-400 mb-4">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm">
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 btn-accent text-sm">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-700/30 rounded-full flex items-center justify-center">
              <FilmIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No videos uploaded yet</h3>
            <p className="text-neutral-400 mb-6">Start by uploading your first video to the library</p>
            <button className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload First Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManagement;