import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [expanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/admin/dashboard' },
    { name: 'User Management', icon: UsersIcon, path: '/admin/users' },
    { name: 'Content Management', icon: PhotoIcon, path: '/admin/content-management' },
    { name: 'Form Management', icon: ClipboardDocumentListIcon, path: '/admin/form-management' },
    { name: 'Booking Management', icon: CalendarIcon, path: '/admin/booking-management' },
    { name: 'Booked Dates', icon: CalendarDaysIcon, path: '/admin/booked-dates' },
    { name: 'Contact Management', icon: EnvelopeIcon, path: '/admin/contact-management' },
    { name: 'Live Streams', icon: SignalIcon, path: '/admin/live-streams' },
    { name: 'Reports', icon: ChartBarIcon, path: '/admin/reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-white shadow-lg ${expanded ? 'w-64' : 'w-20'} transition-all duration-300 h-screen`}>
      <div className="p-4 border-b">
        <h2 className={`text-xl font-bold text-purple-600 ${!expanded && 'hidden'}`}>Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors
              ${isActive(item.path) ? 'bg-purple-50 text-purple-600' : ''}`}
          >
            <item.icon className="h-6 w-6" />
            <span className={`ml-3 ${!expanded && 'hidden'}`}>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;