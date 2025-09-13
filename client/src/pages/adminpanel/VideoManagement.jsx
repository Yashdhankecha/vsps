import { useState } from 'react';
import { PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

const VideoManagement = () => {
  const [videos] = useState([
    { id: 1, title: 'Introduction Video', duration: '2:30', status: 'Published', views: 1234 },

  ]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Video Management</h2>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Upload Video
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 h-48 relative">
                <PlayIcon className="h-12 w-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{video.title}</h3>
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{video.duration}</span>
                  <span>{video.views} views</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    video.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.status}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoManagement;