import { useState, useEffect } from 'react';
import { FaPlay, FaCalendarAlt, FaClock, FaUsers, FaShare, FaHeart } from 'react-icons/fa';
import axios from 'axios';

function LiveStreaming() {
  const [activeTab, setActiveTab] = useState('live');
  const [liveStream, setLiveStream] = useState(null);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkLiveStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/youtube/check-live`);
      if (response.data.live) {
        if (!liveStream) {
          // Show notification when stream goes live
          if (Notification.permission === 'granted') {
            new Notification('🔴 Live Stream Started!', {
              body: response.data.title,
              icon: response.data.thumbnailUrl
            });
          }
        }
        setLiveStream(response.data);
      } else {
        setLiveStream(null);
      }
    } catch (error) {
      console.error('Error checking live status:', error);
    }
  };

  const fetchUpcomingStreams = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/youtube/upcoming`);
      setUpcomingStreams(response.data.upcomingStreams);
    } catch (error) {
      console.error('Error fetching upcoming streams:', error);
    }
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Initial fetch
    checkLiveStatus();
    fetchUpcomingStreams();

    // Set up polling interval
    const liveInterval = setInterval(checkLiveStatus, 30000); // Check every 30 seconds
    const upcomingInterval = setInterval(fetchUpcomingStreams, 300000); // Check every 5 minutes

    setLoading(false);

    return () => {
      clearInterval(liveInterval);
      clearInterval(upcomingInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505236858219-8359eb29e329"
          alt="Live Streaming"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-600/90">
          <div className="container mx-auto h-full flex items-center px-4">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Live Event Streaming</h1>
              <p className="text-lg opacity-90">
                Experience our events from anywhere in the world. Watch live streams of ongoing events
                or set reminders for upcoming broadcasts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'live'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-purple-50'
            }`}
          >
            Live Now
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-purple-50'
            }`}
          >
            Upcoming Streams
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Live Events Section */}
            {activeTab === 'live' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Events</h2>
                {liveStream ? (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="relative">
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                          src={`https://www.youtube.com/embed/${liveStream.videoId}?autoplay=1`}
                          title="YouTube Live"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-[500px]"
                        />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                          LIVE
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {liveStream.title}
                          </h3>
                          <p className="text-gray-600">{liveStream.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-100 rounded-full">
                            <FaShare className="text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-full">
                            <FaHeart className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <FaPlay className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No live events at the moment</p>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events Section */}
            {activeTab === 'upcoming' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Streams</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingStreams.map((stream) => (
                    <div
                      key={stream.videoId}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <img
                        src={stream.thumbnailUrl}
                        alt={stream.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {stream.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{stream.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-gray-500">
                            <FaCalendarAlt className="mr-2" />
                            <span>{new Date(stream.scheduledStartTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FaClock className="mr-2" />
                            <span>{new Date(stream.scheduledStartTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <button className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          Set Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Information Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Watch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlay className="text-2xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Join Stream</h3>
              <p className="text-gray-600">Click the 'Join Stream' button on any live event to start watching</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShare className="text-2xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Event</h3>
              <p className="text-gray-600">Share the stream link with friends and family to watch together</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-2xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Reminders</h3>
              <p className="text-gray-600">Never miss an event by setting reminders for upcoming streams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveStreaming;