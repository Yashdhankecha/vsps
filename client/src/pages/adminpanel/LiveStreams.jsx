import React, { useState, useEffect } from 'react';
import { SignalIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../utils/axiosConfig';

const LiveStreams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreams = async () => {
    try {
      const [liveResponse, upcomingResponse] = await Promise.all([
        axiosInstance.get('/api/youtube/check-live'),
        axiosInstance.get('/api/youtube/upcoming')
      ]);

      const allStreams = [
        ...(liveResponse.data.live ? [liveResponse.data] : []),
        ...upcomingResponse.data.upcomingStreams
      ];

      setStreams(allStreams);
      setError(null);
    } catch (err) {
      console.error('Error fetching streams:', err);
      const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
      setError(`Failed to fetch streams: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
            <h3 className="text-xl font-bold text-white">Loading Streams</h3>
            <p className="text-neutral-300">Please wait while we fetch live stream data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="glass-effect p-8 text-center animate-fade-in-up border border-white/10">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <SignalIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Streams</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            {error.includes('YouTube API configuration missing') && (
              <div className="bg-sunset-500/10 border border-sunset-500/30 rounded-xl p-4 mb-6">
                <p className="text-sunset-300 text-sm mb-3">
                  Please configure YouTube API credentials in the server's .env file:
                </p>
                <pre className="text-xs bg-neutral-800/50 p-3 rounded-lg text-neutral-300 overflow-x-auto">
                  YOUTUBE_API_KEY=your_api_key_here<br/>
                  YOUTUBE_CHANNEL_ID=your_channel_id_here
                </pre>
              </div>
            )}
            <button
              onClick={fetchStreams}
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
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
            <SignalIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Live Streams</h1>
        </div>
        <p className="text-neutral-300 text-lg">Manage and monitor your live streaming content</p>
      </div>

      <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Stream Management</h2>
          <button
            onClick={() => window.open('https://studio.youtube.com/channel/upload', '_blank')}
            className="btn-primary flex items-center space-x-2 mt-4 lg:mt-0"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Stream</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div key={stream.videoId} className="card-hover overflow-hidden">
              <div className="relative">
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                {stream.live && (
                  <div className="absolute top-4 left-4 flex items-center bg-red-500 text-white px-3 py-1 rounded-full border border-red-400 shadow-lg">
                    <SignalIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate text-white">{stream.title}</h3>
                <p className="text-neutral-300 text-sm mt-1 truncate">{stream.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-neutral-400">
                    <EyeIcon className="h-5 w-5 mr-1" />
                    <span>{stream.viewerCount || '0'}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    stream.live 
                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                      : 'bg-electric-500/20 text-electric-300 border-electric-500/30'
                  }`}>
                    {stream.live ? 'Live Now' : new Date(stream.scheduledStartTime).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => window.open(`https://studio.youtube.com/video/${stream.videoId}/edit`, '_blank')}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => window.open(`https://youtube.com/watch?v=${stream.videoId}`, '_blank')}
                    className="flex-1 btn-accent text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {streams.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-700/30 rounded-full flex items-center justify-center">
              <SignalIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400 mb-4">No streams found</p>
            <button
              onClick={() => window.open('https://studio.youtube.com/channel/upload', '_blank')}
              className="btn-primary"
            >
              Create Your First Stream
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default LiveStreams;