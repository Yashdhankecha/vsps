import React from 'react';
import { SignalIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const LiveStreams = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-premium border border-gray-200 p-8 sm:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-electric-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-inner border border-gray-200">
              <AdjustmentsHorizontalIcon className="w-10 h-10 text-gray-500 animate-spin-slow" />
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-200 mb-6 uppercase tracking-wider">
              <SignalIcon className="w-4 h-4" />
              <span>Feature Paused</span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-4">
              Live Stream Management
            </h1>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed font-medium">
              The live streaming module is currently undergoing backend maintenance and integration updates.
              Management tools will be available soon.
            </p>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 font-medium">
              Need assistance? Contact the technical team at <span className="text-electric-600 font-bold">developerstripod@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreams;