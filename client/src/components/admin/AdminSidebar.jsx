import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminLayout } from '../../contexts/AdminLayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  PhotoIcon,
  VideoCameraIcon,
  CalendarIcon,
  ChartBarIcon,
  SignalIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PhotoIcon as PhotoIconSolid,
  UsersIcon as UsersIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const { sidebarExpanded, toggleSidebar } = useAdminLayout();
  const { user } = useAuth();
  const location = useLocation();

  // Define all menu items
  const allMenuItems = [
    { 
      name: 'Dashboard', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      path: '/admin/dashboard',
      color: 'text-electric-400',
      bgColor: 'bg-electric-500/20',
      borderColor: 'border-electric-500/30',
      roles: ['superadmin'] // Only super admin can access dashboard
    },
    { 
      name: 'User Management', 
      icon: UsersIcon, 
      iconSolid: UsersIconSolid,
      path: '/admin/users',
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
      borderColor: 'border-secondary-500/30',
      roles: ['admin', 'superadmin', 'usermanager']
    },
    { 
      name: 'Content Management', 
      icon: PhotoIcon, 
      iconSolid: PhotoIconSolid,
      path: '/admin/content-management',
      color: 'text-neon-400',
      bgColor: 'bg-neon-500/20',
      borderColor: 'border-neon-500/30',
      roles: ['admin', 'superadmin', 'contentmanager']
    },
    { 
      name: 'Form Management', 
      icon: ClipboardDocumentListIcon, 
      path: '/admin/form-management',
      color: 'text-sunset-400',
      bgColor: 'bg-sunset-500/20',
      borderColor: 'border-sunset-500/30',
      roles: ['admin', 'superadmin', 'formmanager']
    },
    { 
      name: 'Booking Management', 
      icon: CalendarIcon, 
      iconSolid: CalendarIconSolid,
      path: '/admin/booking-management',
      color: 'text-electric-400',
      bgColor: 'bg-electric-500/20',
      borderColor: 'border-electric-500/30',
      roles: ['admin', 'superadmin', 'bookingmanager']
    },
    { 
      name: 'Booked Dates', 
      icon: CalendarDaysIcon, 
      path: '/admin/booked-dates',
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
      borderColor: 'border-secondary-500/30',
      roles: ['admin', 'superadmin', 'bookingmanager'] // Only booking manager and admins can access
    },
    { 
      name: 'Contact Management', 
      icon: EnvelopeIcon, 
      path: '/admin/contact-management',
      color: 'text-neon-400',
      bgColor: 'bg-neon-500/20',
      borderColor: 'border-neon-500/30',
      roles: ['admin', 'superadmin', 'contactmanager']
    },
    { 
      name: 'Reviews Management', 
      icon: ChatBubbleLeftRightIcon, 
      path: '/admin/reviews',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      roles: ['admin', 'superadmin', 'contactmanager']
    },
    { 
      name: 'Live Streams', 
      icon: SignalIcon, 
      path: '/admin/live-streams',
      color: 'text-sunset-400',
      bgColor: 'bg-sunset-500/20',
      borderColor: 'border-sunset-500/30',
      roles: ['admin', 'superadmin']
    },
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
    <div className={`${sidebarExpanded ? 'w-72' : 'w-20'} transition-all duration-300 ease-in-out glass-effect border-r border-white/10 h-screen flex flex-col backdrop-blur-xl fixed left-0 top-0 z-50 animate-fade-in-right`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 glass-effect border border-white/20 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 shadow-lg z-10"
      >
        {sidebarExpanded ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          {sidebarExpanded && (
            <div className="animate-fade-in-right">
              <h2 className="text-xl font-bold text-white">
                {user?.role === 'superadmin' ? 'Super Admin' : 
                 user?.role === 'usermanager' ? 'User Manager' :
                 user?.role === 'contentmanager' ? 'Content Manager' :
                 user?.role === 'formmanager' ? 'Form Manager' :
                 user?.role === 'bookingmanager' ? 'Booking Manager' :
                 user?.role === 'contactmanager' ? 'Contact Manager' : 'Admin'} Panel
              </h2>
              <p className="text-xs text-neutral-300 font-medium">Management Dashboard</p>
            </div>
          )}
        </div>
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
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden border ${
                active 
                  ? `${item.bgColor} ${item.color} ${item.borderColor} shadow-lg font-semibold` 
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white font-medium border-transparent hover:border-white/10'
              }`}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            >
              {/* Active indicator */}
              {active && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color.replace('text-', 'bg-')} rounded-r-full`}></div>
              )}
              
              {/* Icon */}
              <div className={`w-5 h-5 mr-3 transition-all duration-200 ${
                active ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Label */}
              {sidebarExpanded && (
                <span className="truncate animate-fade-in-right">
                  {item.name}
                </span>
              )}
              
              {/* Hover effect */}
              {!active && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            // Clear all auth-related state and storage
            localStorage.clear();
            // Redirect to auth page
            window.location.href = '/auth';
          }}
          className={`flex items-center space-x-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 ${
            sidebarExpanded ? '' : 'justify-center'
          } hover:bg-red-500/30 transition-colors duration-200 w-full`}
        >
          <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-400" />
          </div>
          {sidebarExpanded && (
            <div className="animate-fade-in-right">
              <p className="text-sm font-medium text-red-400">Logout</p>
              <p className="text-xs text-red-300">Sign out of account</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;