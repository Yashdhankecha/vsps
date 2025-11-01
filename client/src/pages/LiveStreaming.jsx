import { useState, useEffect } from 'react';
import { FaPlay, FaCalendarAlt, FaClock, FaUsers, FaShare, FaHeart, FaBell } from 'react-icons/fa';
import axios from '../utils/axiosConfig';
import { Card, Button } from '../components';

function LiveStreaming() {
  const [activeTab, setActiveTab] = useState('live');
  const [liveStream, setLiveStream] = useState(null);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkLiveStatus = async () => {
    try {
      const response = await axios.get('/api/youtube/check-live');
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
      const response = await axios.get('/api/youtube/upcoming');
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
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505236858219-8359eb29e329"
          alt="Live Streaming"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-800/90">
          <div className="container mx-auto h-full flex items-center px-4">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Live Event Streaming</h1>
              <p className="text-lg text-neutral-200">
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
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'live'
                ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
          >
            Live Now
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'upcoming'
                ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
          >
            Upcoming Streams
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500"></div>
          </div>
        ) : (
          <>
            {/* Live Events Section */}
            {activeTab === 'live' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Live Events</h2>
                {liveStream ? (
                  <Card className="glass-effect border border-white/10 overflow-hidden">
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
                        <span className="px-3 py-1 bg-gradient-electric text-white rounded-full flex items-center shadow-lg">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                          LIVE
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {liveStream.title}
                          </h3>
                          <p className="text-neutral-300">{liveStream.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <FaShare className="text-neutral-400 hover:text-white" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <FaHeart className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="text-center p-12 glass-effect border border-white/10">
                    <FaPlay className="text-6xl text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Live Events</h3>
                    <p className="text-neutral-400">No live events at the moment</p>
                  </Card>
                )}
              </div>
            )}

            {/* Upcoming Events Section */}
            {activeTab === 'upcoming' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Upcoming Streams</h2>
                {upcomingStreams.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingStreams.map((stream) => (
                      <Card 
                        key={stream.videoId}
                        className="glass-effect border border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        hoverEffect={true}
                      >
                        <img
                          src={stream.thumbnailUrl}
                          alt={stream.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {stream.title}
                          </h3>
                          <p className="text-neutral-300 mb-4 line-clamp-2">{stream.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-neutral-400">
                              <FaCalendarAlt className="mr-2" />
                              <span className="text-sm">{new Date(stream.scheduledStartTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-neutral-400">
                              <FaClock className="mr-2" />
                              <span className="text-sm">{new Date(stream.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => {
                              // Add reminder functionality here
                              if (Notification.permission === 'granted') {
                                new Notification('Stream Reminder', {
                                  body: `Reminder: ${stream.title} starts soon!`,
                                  icon: stream.thumbnailUrl
                                });
                              }
                            }}
                          >
                            <FaBell className="mr-2" />
                            Set Reminder
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-12 glass-effect border border-white/10">
                    <FaCalendarAlt className="text-6xl text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Streams</h3>
                    <p className="text-neutral-400">Check back later for upcoming events</p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LiveStreaming;