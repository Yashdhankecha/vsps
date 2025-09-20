import React, { createContext, useContext, useState } from 'react';

const AdminLayoutContext = createContext();

export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error('useAdminLayout must be used within an AdminLayoutProvider');
  }
  return context;
};

export const AdminLayoutProvider = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  return (
    <AdminLayoutContext.Provider value={{
      sidebarExpanded,
      setSidebarExpanded,
      toggleSidebar
    }}>
      {children}
    </AdminLayoutContext.Provider>
  );
};