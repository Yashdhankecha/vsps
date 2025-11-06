import React from 'react';
import { useAdminLayout } from '../../contexts/AdminLayoutContext';

const AdminPageContainer = ({ children }) => {
  const { sidebarExpanded } = useAdminLayout();
  
  return (
    <main 
      className={`
        transition-all duration-300 ease-in-out 
        ${sidebarExpanded ? 'ml-72' : 'ml-20'} 
        min-h-screen
        w-[calc(100%)]
        max-w-[calc(100%-4.5rem)] 
      `}
    >
      <div className="w-full overflow-x-hidden p-2">
        {children}
      </div>
    </main>
  );
};

export default AdminPageContainer;