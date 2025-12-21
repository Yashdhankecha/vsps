import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminLayout } from '../../contexts/AdminLayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const { sidebarExpanded, toggleSidebar } = useAdminLayout();
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  // Define all menu items
  const allMenuItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      path: '/committee/dashboard',
      color: 'text-electric-400',
      bgColor: 'bg-electric-500/20',
      borderColor: 'border-electric-500/30',
      roles: ['committeemember', 'superadmin']
    },
    {
      name: 'Add Member',
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      path: '/committee/add-member',
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
      borderColor: 'border-secondary-500/30',
      roles: ['committeemember', 'superadmin']
    },
    {
      name: 'My Village Members',
      icon: UserGroupIcon,
      path: '/committee/village-members',
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
      borderColor: 'border-primary-500/30',
      roles: ['committeemember', 'superadmin']
    },
    {
      name: 'Committee Members',
      icon: MagnifyingGlassIcon,
      path: '/committee/members',
      color: 'text-sunset-400',
      bgColor: 'bg-sunset-500/20',
      borderColor: 'border-sunset-500/30',
      roles: ['committeemember', 'superadmin']
    }
  ];

  // Filter menu items based on user role
  const getMenuItems = () => {
    if (!user || !user.role) return [];

    // Super admin gets all items
    if (user.role === 'superadmin') {
      return allMenuItems;
    }

    // Filter items based on user role
    return allMenuItems.filter(item => item.roles && item.roles.includes(user.role));
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-black/90 md:bg-transparent z-50
          transition-all duration-300 ease-in-out 
          border-r border-white/10 backdrop-blur-xl flex flex-col
          ${sidebarExpanded ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-20'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={toggleSidebar}
          className="absolute right-4 top-4 p-2 text-white/50 hover:text-white md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Desktop Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 glass-effect border border-white/20 rounded-full items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 shadow-lg z-10"
        >
          {sidebarExpanded ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10 mt-8 md:mt-0">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${!sidebarExpanded && 'mx-auto'}`}>
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            {sidebarExpanded && (
              <div className="animate-fade-in-right overflow-hidden whitespace-nowrap">
                <h2 className="text-xl font-bold text-white">
                  {user?.role === 'superadmin' ? 'Super Admin' :
                    user?.role === 'committeemember' ? 'Committee' : 'Admin'}
                </h2>
                <p className="text-xs text-neutral-300 font-medium">Dashboard</p>
              </div>
            )}
          </div>

          {sidebarExpanded && user?.village && (
            <div className="mt-4 animate-fade-in-right md:block">
              <div className="px-3 py-1.5 bg-electric-500/10 border border-electric-500/20 rounded-lg">
                <p className="text-xs text-electric-300 font-medium truncate">
                  Village: {user.village}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            const Icon = active && item.iconSolid ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                title={!sidebarExpanded ? item.name : ''}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden border ${active
                  ? `${item.bgColor} ${item.color} ${item.borderColor} shadow-lg font-semibold`
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white font-medium border-transparent hover:border-white/10'
                  } ${!sidebarExpanded && 'justify-center'}`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-current rounded-r"></div>
                )}

                <Icon className="w-5 h-5 flex-shrink-0" />

                {sidebarExpanded && (
                  <span className="ml-3 truncate animate-fade-in-right">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            title={!sidebarExpanded ? 'Logout' : ''}
            className={`group flex items-center w-full px-4 py-3 rounded-xl text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${!sidebarExpanded && 'justify-center'}`}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && (
              <span className="ml-3 animate-fade-in-right">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;