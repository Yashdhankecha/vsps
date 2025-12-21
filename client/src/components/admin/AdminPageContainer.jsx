import React from 'react';
import { useAdminLayout } from '../../contexts/AdminLayoutContext';

const AdminPageContainer = ({ children }) => {
  const { sidebarExpanded, setSidebarExpanded } = useAdminLayout();

  return (
    <main
      className={`
        transition-all duration-300 ease-in-out 
        ${sidebarExpanded ? 'md:ml-72' : 'md:ml-20'} 
        ml-0
        min-h-screen
        w-full
        md:max-w-[calc(100%-4.5rem)]
      `}
    >
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarExpanded(true)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-white font-semibold">Committee Dashboard</span>
          <div className="w-10"></div> {/* Spacer for centering if needed */}
        </div>
      </div>

      <div className="w-full overflow-x-hidden p-2 sm:p-4">
        {children}
      </div>
    </main>
  );
};

export default AdminPageContainer;