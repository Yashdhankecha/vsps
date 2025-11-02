import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import "react-big-calendar/lib/css/react-big-calendar.css";
import axiosInstance from '../../utils/axiosConfig';
import { 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookedDatesCalendar = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/bookings');
      // Ensure bookings is always an array (Array Method Safety Pattern)
      const bookingsData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response.data?.bookings) ? response.data.bookings :
                          Array.isArray(response.data?.data) ? response.data.data : [];
      
      console.log('Fetched bookings data:', bookingsData); // Debugging line
      
      // Filter out rejected bookings and transform remaining bookings into calendar events
      const events = bookingsData
        .filter(booking => booking.status !== 'Rejected')
        .map(booking => ({
          title: format(new Date(booking.date), 'MMM d'),
          start: new Date(booking.date),
          end: new Date(booking.date),
          allDay: true,
          status: booking.status,
          bookingId: booking._id,
          customerName: booking.firstName && booking.surname ? 
            `${booking.firstName} ${booking.surname}` : 
            booking.name || 'N/A',
          eventType: booking.eventType,
          guestCount: booking.guestCount,
          startTime: booking.startTime,
          endTime: booking.endTime
        }));
      
      setBookedEvents(events);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventMouseEnter = (event, e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.top
    });
    setHoveredEvent(event);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  const eventStyleGetter = (event) => {
    const baseStyle = {
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '3px 6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const backgroundColor = 
      event.status === 'Booked' ? '#dc2626' : // red
      event.status === 'Approved' ? '#0ea5e9' : // electric blue
      event.status === 'Pending' ? '#f59e0b' : // amber
      '#6366f1'; // default indigo

    return {
      style: {
        ...baseStyle,
        backgroundColor,
        background: event.status === 'Booked' ? 'linear-gradient(135deg, #dc2626, #ef4444)' :
                   event.status === 'Approved' ? 'linear-gradient(135deg, #0ea5e9, #2dd4bf)' :
                   event.status === 'Pending' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' :
                   'linear-gradient(135deg, #6366f1, #8b5cf6)'
      }
    };
  };

  const calendarCustomStyles = {
    className: 'modern-dark-calendar',
    style: {
      height: 'calc(100vh - 300px)',
      minHeight: '500px',
      backgroundColor: 'transparent',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  };

  const calendarComponents = {
    toolbar: (props) => (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 mb-6 bg-gradient-to-r from-electric-500/10 to-neon-500/10 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between sm:justify-start mb-4 sm:mb-0">
          <button
            onClick={() => props.onNavigate('PREV')}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white font-medium hover:shadow-sm border border-white/20 hover:border-white/30"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-xl sm:text-2xl font-bold text-white mx-4">
            {format(props.date, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => props.onNavigate('NEXT')}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white font-medium hover:shadow-sm border border-white/20 hover:border-white/30"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => props.onNavigate('TODAY')}
            className="btn-secondary text-sm px-3 py-1"
          >
            Today
          </button>
          <select
            value={props.view}
            onChange={(e) => props.onView(e.target.value)}
            className="input-field text-sm py-1 px-2 min-w-0"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>
    ),
    month: {
      dateHeader: ({ date }) => (
        <div className="text-center font-medium text-neutral-300 py-2 text-sm sm:text-base">
          {format(date, 'd')}
        </div>
      ),
      event: ({ event }) => (
        <div
          onMouseEnter={(e) => handleEventMouseEnter(event, e)}
          onMouseLeave={handleEventMouseLeave}
          className="w-full h-full text-xs sm:text-sm"
        >
          {event.title}
        </div>
      )
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Loading Calendar</h3>
            <p className="text-neutral-300">Please wait while we fetch booking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card-glass p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Calendar</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <button
              onClick={fetchBookings}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 animate-fade-in-up">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
            <CalendarIconSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Booking Calendar</h1>
            <p className="text-neutral-300 text-sm sm:text-base">View and manage scheduled bookings</p>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card-glass animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        {/* Status Legend */}
        <div className="border-b border-white/10 pb-4 sm:pb-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Booking Status Legend</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
            <div className="flex items-center bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="font-medium text-red-300">Booked</span>
            </div>
            <div className="flex items-center bg-electric-500/20 px-3 py-2 rounded-lg border border-electric-500/30">
              <div className="w-3 h-3 rounded-full bg-electric-500 mr-2"></div>
              <span className="font-medium text-electric-300">Approved</span>
            </div>
            <div className="flex items-center bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="font-medium text-amber-300">Pending</span>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="calendar-container relative">
          <style jsx global>{`
            .modern-dark-calendar {
              background: transparent !important;
              color: white !important;
            }
            .modern-dark-calendar .rbc-calendar {
              background: transparent !important;
              color: white !important;
            }
            .modern-dark-calendar .rbc-header {
              background: rgba(55, 65, 81, 0.3) !important;
              color: white !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding: 12px 8px !important;
              font-weight: 600 !important;
            }
            .modern-dark-calendar .rbc-month-view {
              background: transparent !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 12px !important;
              overflow: hidden !important;
            }
            .modern-dark-calendar .rbc-day-bg {
              background: rgba(31, 41, 55, 0.2) !important;
              border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            }
            .modern-dark-calendar .rbc-day-bg:hover {
              background: rgba(55, 65, 81, 0.3) !important;
            }
            .modern-dark-calendar .rbc-today {
              background: rgba(14, 165, 233, 0.1) !important;
            }
            .modern-dark-calendar .rbc-off-range-bg {
              background: rgba(17, 24, 39, 0.1) !important;
            }
            .modern-dark-calendar .rbc-date-cell {
              color: #d1d5db !important;
              padding: 8px !important;
            }
            .modern-dark-calendar .rbc-off-range {
              color: #6b7280 !important;
            }
            .modern-dark-calendar .rbc-current {
              color: #0ea5e9 !important;
              font-weight: 600 !important;
            }
            @media (max-width: 640px) {
              .modern-dark-calendar .rbc-header {
                padding: 8px 4px !important;
                font-size: 0.875rem !important;
              }
              .modern-dark-calendar .rbc-date-cell {
                padding: 4px !important;
                font-size: 0.75rem !important;
              }
            }
          `}</style>
          
          <Calendar
            localizer={localizer}
            events={bookedEvents}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            components={calendarComponents}
            {...calendarCustomStyles}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            showMultiDayTimes
            step={60}
            timeslots={1}
          />
        </div>
      </div>

      {/* Event Tooltip */}
      {hoveredEvent && (
        <div 
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="card-glass max-w-xs sm:max-w-sm p-4 shadow-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                hoveredEvent.status === 'Booked' ? 'bg-red-500' :
                hoveredEvent.status === 'Approved' ? 'bg-electric-500' :
                hoveredEvent.status === 'Pending' ? 'bg-amber-500' :
                'bg-indigo-500'
              }`}></div>
              <span className={`text-sm font-semibold ${
                hoveredEvent.status === 'Booked' ? 'text-red-300' :
                hoveredEvent.status === 'Approved' ? 'text-electric-300' :
                hoveredEvent.status === 'Pending' ? 'text-amber-300' :
                'text-indigo-300'
              }`}>
                {hoveredEvent.status}
              </span>
            </div>
            <h4 className="font-bold text-white text-sm mb-2">{hoveredEvent.customerName}</h4>
            <div className="space-y-1 text-xs text-neutral-300">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3 text-electric-400" />
                <span>{hoveredEvent.eventType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3 text-neon-400" />
                <span>{hoveredEvent.startTime} - {hoveredEvent.endTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-3 h-3 text-secondary-400" />
                <span>{hoveredEvent.guestCount} guests</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );

};

export default BookedDatesCalendar;