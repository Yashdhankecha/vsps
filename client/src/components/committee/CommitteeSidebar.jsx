import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CommitteeSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/committee/dashboard' },
    { icon: ClipboardDocumentCheckIcon, label: 'Booking Approvals', path: '/committee/booking-approvals' },
    { icon: AcademicCapIcon, label: 'Student Awards', path: '/committee/student-awards' },
    { icon: UserGroupIcon, label: 'Samuh Marriage Data', path: '/committee/samuh-data' },
    { icon: ChartBarIcon, label: 'Reports', path: '/committee/reports' },
    { icon: CalendarIcon, label: 'Calendar View', path: '/committee/calendar' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-800 to-indigo-800 border-b border-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-blue-900" />
              </div>
              <div className="text-white">
                <h1 className="text-lg font-bold">Committee Panel</h1>
                <p className="text-xs text-blue-200">Samaj Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }
                `}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive(item.path) 
                    ? 'text-blue-900' 
                    : 'text-blue-300 group-hover:text-white'
                  }
                `} />
                {item.label}
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-blue-900 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-700">
            <div className="text-center text-blue-200 text-xs">
              <p>Committee Access Level</p>
              <p className="text-yellow-400 font-medium">Samaj Portal v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommitteeSidebar;