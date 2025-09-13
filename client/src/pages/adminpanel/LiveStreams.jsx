import { useState, useEffect } from 'react';
import { SignalIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const LiveStreams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreams = async () => {
    try {
      const [liveResponse, upcomingResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/youtube/check-live`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/youtube/upcoming`)
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-2">Error Loading Streams</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          {error.includes('YouTube API configuration missing') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-yellow-700 text-sm">
                Please configure YouTube API credentials in the server's .env file:
              </p>
              <pre className="text-xs mt-2 bg-yellow-100 p-2 rounded">
                YOUTUBE_API_KEY=your_api_key_here<br/>
                YOUTUBE_CHANNEL_ID=your_channel_id_here
              </pre>
            </div>
          )}
          <button
            onClick={fetchStreams}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Live Streams</h2>
          <button
            onClick={() => window.open('https://studio.youtube.com/channel/upload', '_blank')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Stream
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div key={stream.videoId} className="border rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                {stream.live && (
                  <div className="absolute top-4 left-4 flex items-center bg-red-500 text-white px-2 py-1 rounded-full">
                    <SignalIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">Live</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{stream.title}</h3>
                <p className="text-gray-500 text-sm mt-1 truncate">{stream.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-gray-500">
                    <EyeIcon className="h-5 w-5 mr-1" />
                    <span>{stream.viewerCount || '0'}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    stream.live ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {stream.live ? 'Live Now' : new Date(stream.scheduledStartTime).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => window.open(`https://studio.youtube.com/video/${stream.videoId}/edit`, '_blank')}
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => window.open(`https://youtube.com/watch?v=${stream.videoId}`, '_blank')}
                    className="flex-1 px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded"
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
            <p className="text-gray-500">No streams found</p>
            <button
              onClick={() => window.open('https://studio.youtube.com/channel/upload', '_blank')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Your First Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreams;