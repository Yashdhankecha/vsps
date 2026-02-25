import React from 'react';
import { FaYoutube, FaRocket, FaClock } from 'react-icons/fa';
import { Card } from '../components';

function LiveStreaming() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center animate-fade-in-up">
        <Card className="glass-effect overflow-hidden border border-gray-200 shadow-premium p-8 sm:p-16">
          <div className="relative mb-8 sm:mb-12">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-electric rounded-3xl mx-auto flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <FaYoutube className="text-white text-5xl sm:text-6xl" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <FaRocket className="text-white text-xl" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 bg-gradient-to-r from-electric-600 to-sky-600 bg-clip-text text-transparent">
            Coming Soon
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            We're building a state-of-the-art live streaming experience for our community.
            Stay tuned for high-quality broadcasts of all our major events!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Days', value: '--' },
              { label: 'Hours', value: '--' },
              { label: 'Mins', value: '--' },
              { label: 'Secs', value: '--' }
            ].map((item, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center px-6 py-3 bg-gray-100 rounded-full text-gray-600 font-semibold border border-gray-200">
              <FaClock className="mr-2 text-electric-500" />
              Under Maintenance
            </div>
          </div>
        </Card>

        <div className="mt-12 text-gray-500 font-medium">
          © {new Date().getFullYear()} VSPS Community. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default LiveStreaming;