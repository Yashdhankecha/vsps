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
      color: 'text-electric-700',
      bgColor: 'bg-electric-50',
      borderColor: 'border-electric-200',
      roles: ['superadmin'] // Only super admin can access dashboard
    },
    {
      name: 'User Management',
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      path: '/admin/users',
      color: 'text-secondary-700',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      roles: ['admin', 'superadmin', 'usermanager']
    },
    {
      name: 'Content Management',
      icon: PhotoIcon,
      iconSolid: PhotoIconSolid,
      path: '/admin/content-management',
      color: 'text-neon-700',
      bgColor: 'bg-neon-50',
      borderColor: 'border-neon-200',
      roles: ['admin', 'superadmin', 'contentmanager']
    },
    {
      name: 'Form Management',
      icon: ClipboardDocumentListIcon,
      path: '/admin/form-management',
      color: 'text-sunset-700',
      bgColor: 'bg-sunset-50',
      borderColor: 'border-sunset-200',
      roles: ['admin', 'superadmin', 'formmanager']
    },
    {
      name: 'Form Responses',
      icon: EnvelopeIcon, // Using EnvelopeIcon or clipboard for responses
      path: '/admin/form-responses',
      color: 'text-neon-700',
      bgColor: 'bg-neon-50',
      borderColor: 'border-neon-200',
      roles: ['admin', 'superadmin', 'formmanager']
    },
    {
      name: 'Booking Management',
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
      path: '/admin/booking-management',
      color: 'text-electric-700',
      bgColor: 'bg-electric-50',
      borderColor: 'border-electric-200',
      roles: ['admin', 'superadmin', 'bookingmanager']
    },
    {
      name: 'Booked Dates',
      icon: CalendarDaysIcon,
      path: '/admin/booked-dates',
      color: 'text-secondary-700',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      roles: ['admin', 'superadmin', 'bookingmanager']
    },
    {
      name: 'Contact Management',
      icon: EnvelopeIcon,
      path: '/admin/contact-management',
      color: 'text-neon-700',
      bgColor: 'bg-neon-50',
      borderColor: 'border-neon-200',
      roles: ['admin', 'superadmin', 'contactmanager']
    },
    {
      name: 'Reviews Management',
      icon: ChatBubbleLeftRightIcon,
      path: '/admin/reviews',
      color: 'text-electric-700',
      bgColor: 'bg-electric-50',
      borderColor: 'border-electric-200',
      roles: ['admin', 'superadmin', 'contactmanager']
    },
    {
      name: 'Live Streams',
      icon: SignalIcon,
      path: '/admin/live-streams',
      color: 'text-sunset-700',
      bgColor: 'bg-sunset-50',
      borderColor: 'border-sunset-200',
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
    <div className={`${sidebarExpanded ? 'w-72' : 'w-20'} transition-all duration-300 ease-in-out bg-gradient-to-b from-white via-slate-50 to-gray-100 border-r border-gray-200/60 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-sm animate-fade-in-right`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-md z-10"
      >
        {sidebarExpanded ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          {sidebarExpanded && (
            <div className="animate-fade-in-right">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.role === 'superadmin' ? 'Super Admin' :
                  user?.role === 'usermanager' ? 'User Manager' :
                    user?.role === 'contentmanager' ? 'Content Manager' :
                      user?.role === 'formmanager' ? 'Form Manager' :
                        user?.role === 'bookingmanager' ? 'Booking Manager' :
                          user?.role === 'contactmanager' ? 'Contact Manager' : 'Admin'} Panel
              </h2>
              <p className="text-xs text-gray-500 font-medium">Management Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          const Icon = active && item.iconSolid ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden border ${active
                ? `${item.bgColor} ${item.color} ${item.borderColor} shadow-sm font-semibold`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium border-transparent hover:border-gray-200'
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
              <div className={`w-5 h-5 mr-3 transition-all duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Clear all auth-related state and storage
            localStorage.clear();
            // Redirect to auth page
            window.location.href = '/auth';
          }}
          className={`flex items-center space-x-3 p-3 rounded-xl bg-red-50 border border-red-200 ${sidebarExpanded ? '' : 'justify-center'
            } hover:bg-red-100 transition-colors duration-200 w-full`}
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600" />
          </div>
          {sidebarExpanded && (
            <div className="animate-fade-in-right">
              <p className="text-sm font-medium text-red-600">Logout</p>
              <p className="text-xs text-red-500">Sign out of account</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;