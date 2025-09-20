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
      `}
    >
      {children}
    </main>
  );
};

export default AdminPageContainer;