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
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    console.log('Booked events updated:', bookedEvents);
  }, [bookedEvents]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/bookings');
      console.log('API Response:', response);
      
      // Ensure bookings is always an array (Array Method Safety Pattern)
      const bookingsData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response.data?.bookings) ? response.data.bookings :
                          Array.isArray(response.data?.data) ? response.data.data : [];
      
      console.log('Bookings Data:', bookingsData);
      
      // Filter out rejected bookings and transform remaining bookings into calendar events
      const events = bookingsData
        .filter(booking => {
          const isValid = booking.status !== 'Rejected' && booking.date;
          console.log('Processing booking:', booking, 'Valid:', isValid);
          return isValid;
        })
        .map(booking => {
          const eventDate = new Date(booking.date);
          console.log('Event date:', eventDate, 'Booking date:', booking.date);
          
          const event = {
            title: format(eventDate, 'MMM d'),
            start: eventDate,
            end: eventDate,
            allDay: true,
            status: booking.status || 'Pending',
            bookingId: booking._id,
            customerName: booking.firstName && booking.surname ? 
              `${booking.firstName} ${booking.surname}` : 
              booking.name || 'N/A',
            eventType: booking.eventType || 'Unknown',
            guestCount: booking.guestCount || 0,
            startTime: booking.startTime || 'N/A',
            endTime: booking.endTime || 'N/A',
            email: booking.email || '',
            phone: booking.phone || '',
            additionalNotes: booking.additionalNotes || ''
          };
          
          console.log('Created event:', event);
          return event;
        });
      
      console.log('Final events array:', events);
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
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '2px 4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      textShadow: '0 1px 1px rgba(0,0,0,0.3)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      lineHeight: '1.2',
      height: '100%'
    };

    // The colored parts represent different booking statuses:
    // Booked: Red color indicating confirmed bookings
    // Approved: Blue color indicating approved but not yet booked
    // Pending: Amber color indicating pending approval
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
                   'linear-gradient(135deg, #6366f1, #8b5cf6)',
        minHeight: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    };
  };

  const calendarCustomStyles = {
    className: 'modern-dark-calendar',
    style: {
      height: '100%',
      backgroundColor: 'transparent',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  };

  const calendarComponents = {
    toolbar: (props) => (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 mb-3 bg-gradient-to-r from-electric-500/10 to-neon-500/10 rounded-md border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between sm:justify-start mb-2 sm:mb-0">
          <button
            onClick={() => props.onNavigate('PREV')}
            className="p-1 hover:bg-white/10 rounded-sm transition-all duration-300 text-white font-medium hover:shadow-sm border border-white/20 hover:border-white/30"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-base sm:text-lg font-bold text-white mx-2">
            {format(props.date, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => props.onNavigate('NEXT')}
            className="p-1 hover:bg-white/10 rounded-sm transition-all duration-300 text-white font-medium hover:shadow-sm border border-white/20 hover:border-white/30"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => props.onNavigate('TODAY')}
            className="btn-secondary text-xs px-3 py-1"
          >
            Today
          </button>
          <select
            value={props.view}
            onChange={(e) => props.onView(e.target.value)}
            className="input-field text-xs py-1 px-2"
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
        <div className="text-center font-medium text-neutral-300 py-2 text-sm">
          {format(date, 'd')}
        </div>
      ),
      event: ({ event }) => (
        <div
          onClick={(e) => handleEventClick(event, e)}
          className="w-full h-full text-xs p-1 cursor-pointer overflow-hidden"
        >
          <div className="font-bold truncate text-sm">{event.title}</div>
          <div className="truncate text-xs font-medium">{event.customerName}</div>
          <div className="truncate text-xs">{event.eventType}</div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="flex items-center">
              <UsersIcon className="w-3 h-3 mr-1" />
              {event.guestCount}
            </span>
            <span className={`px-1 py-0.5 rounded text-xs font-semibold ${
              event.status === 'Booked' ? 'bg-red-500/30' : 
              event.status === 'Approved' ? 'bg-electric-500/30' : 
              'bg-amber-500/30'
            }`}>
              {event.status}
            </span>
          </div>
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

  const handleEventClick = (event, e) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
      {/* Header Section */}
      <div className="mb-2 sm:mb-3 animate-fade-in-up">
        <div className="flex items-center space-x-1.5 mb-0.5">
          <div className="w-6 h-6 bg-gradient-electric rounded-md flex items-center justify-center shadow-sm neon-glow">
            <CalendarIconSolid className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Booking Calendar</h1>
            <p className="text-neutral-300 text-[0.65rem]">View and manage scheduled bookings</p>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card-glass animate-fade-in-up p-3 sm:p-4" style={{animationDelay: '0.1s'}}>
        {/* Status Legend - Explains the colored parts */}
        <div className="border-b border-white/10 pb-2 sm:pb-3 mb-3">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3">Booking Status Legend</h3>
          <div className="flex flex-wrap gap-2 text-[0.65rem] justify-center">
            <div className="flex items-center bg-red-500/20 px-2 py-1 rounded-md border border-red-500/30 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div>
              <span className="font-medium text-red-100">Booked - Confirmed reservations</span>
            </div>
            <div className="flex items-center bg-electric-500/20 px-2 py-1 rounded-md border border-electric-500/30 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-electric-500 mr-1.5"></div>
              <span className="font-medium text-electric-100">Approved - Pending confirmation</span>
            </div>
            <div className="flex items-center bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/30 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></div>
              <span className="font-medium text-amber-100">Pending - Awaiting approval</span>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="calendar-container relative" style={{height: '500px', minHeight: '500px'}}>
          <style jsx global>{`
            .modern-dark-calendar {
              background: transparent !important;
              color: white !important;
              height: 100% !important;
            }
            .modern-dark-calendar .rbc-calendar {
              background: transparent !important;
              color: white !important;
              height: 100% !important;
            }
            .modern-dark-calendar .rbc-header {
              background: rgba(55, 65, 81, 0.3) !important;
              color: white !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding: 8px 4px !important;
              font-weight: 600 !important;
              font-size: 0.8rem !important;
            }
            .modern-dark-calendar .rbc-month-view {
              background: rgba(31, 41, 55, 0.3) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 8px !important;
              overflow: hidden !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
              height: calc(100% - 40px) !important;
            }
            .modern-dark-calendar .rbc-day-bg {
              background: rgba(31, 41, 55, 0.2) !important;
              border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
              min-height: 60px !important;
            }
            .modern-dark-calendar .rbc-day-bg:hover {
              background: rgba(55, 65, 81, 0.4) !important;
            }
            .modern-dark-calendar .rbc-today {
              background: rgba(14, 165, 233, 0.15) !important;
            }
            .modern-dark-calendar .rbc-off-range-bg {
              background: rgba(17, 24, 39, 0.1) !important;
            }
            .modern-dark-calendar .rbc-date-cell {
              color: #d1d5db !important;
              padding: 4px !important;
              font-size: 0.8rem !important;
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
                padding: 4px 2px !important;
                font-size: 0.7rem !important;
              }
              .modern-dark-calendar .rbc-date-cell {
                padding: 2px !important;
                font-size: 0.6rem !important;
              }
              .modern-dark-calendar .rbc-month-row {
                min-height: 40px !important;
              }
              .modern-dark-calendar .rbc-row-bg .rbc-day-bg {
                min-height: 40px !important;
              }
              .modern-dark-calendar .rbc-event {
                margin-bottom: 2px !important;
              }
            }
            .modern-dark-calendar .rbc-row-content {
              min-height: 60px !important;
            }
            .modern-dark-calendar .rbc-day-slot {
              min-height: 60px !important;
            }
            /* Improve event visibility */
            .modern-dark-calendar .rbc-event {
              border: none !important;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
              transition: all 0.2s ease !important;
              margin-bottom: 2px !important;
              overflow: hidden !important;
            }
            .modern-dark-calendar .rbc-event:hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
              z-index: 10 !important;
            }
            /* Improve day cell contrast and height */
            .modern-dark-calendar .rbc-month-row {
              min-height: 70px !important;
            }
            .modern-dark-calendar .rbc-row-bg .rbc-day-bg {
              min-height: 70px !important;
            }
            /* Ensure event text is visible */
            .modern-dark-calendar .rbc-event-content {
              font-size: 0.75rem !important;
              line-height: 1.2 !important;
              padding: 2px 4px !important;
            }
            /* Improve date cell padding */
            .modern-dark-calendar .rbc-date-cell {
              padding: 4px 6px !important;
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
            popup={false}
            showMultiDayTimes
            step={60}
            timeslots={1}
            onSelectEvent={handleEventClick}
            tooltipAccessor={false}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-glass max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-white/20 backdrop-blur-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Booking Details</h3>
              <button 
                onClick={closeEventDetails}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircleIcon className="w-5 h-5 text-neutral-400 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedEvent.status === 'Booked' ? 'bg-red-500' :
                    selectedEvent.status === 'Approved' ? 'bg-electric-500' :
                    selectedEvent.status === 'Pending' ? 'bg-amber-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <span className={`text-sm font-semibold ${
                    selectedEvent.status === 'Booked' ? 'text-red-300' :
                    selectedEvent.status === 'Approved' ? 'text-electric-300' :
                    selectedEvent.status === 'Pending' ? 'text-amber-300' :
                    'text-indigo-300'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {format(new Date(selectedEvent.start), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <h4 className="font-bold text-white text-base mb-3">{selectedEvent.customerName}</h4>
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-electric-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Event Type</p>
                      <p>{selectedEvent.eventType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-neon-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Time</p>
                      <p>{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-5 h-5 text-secondary-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Guests</p>
                      <p>{selectedEvent.guestCount} guests</p>
                    </div>
                  </div>
                  {selectedEvent.email && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h-3l-4 4z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-white">Email</p>
                        <p>{selectedEvent.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.phone && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-white">Phone</p>
                        <p>{selectedEvent.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.additionalNotes && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        <div>
                          <p className="font-medium text-purple-300 mb-1">Additional Notes</p>
                          <p className="whitespace-pre-wrap">{selectedEvent.additionalNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Tooltip */}
      {hoveredEvent && !selectedEvent && (
        <div 
          className="fixed z-40 pointer-events-none animate-fade-in"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 5}px`,
            transform: 'translateY(-100%)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div className="card-glass max-w-xs sm:max-w-sm p-3 shadow-xl border border-white/20 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
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
              <span className="text-xs text-neutral-400">
                {format(new Date(hoveredEvent.start), 'MMM d, yyyy')}
              </span>
            </div>
            <h4 className="font-bold text-white text-xs mb-1">{hoveredEvent.customerName}</h4>
            <div className="space-y-1 text-xs text-neutral-300">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-electric-400 flex-shrink-0" />
                <span className="font-medium">{hoveredEvent.eventType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-neon-400 flex-shrink-0" />
                <span>{hoveredEvent.startTime} - {hoveredEvent.endTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <span>{hoveredEvent.guestCount} guests</span>
              </div>
              {hoveredEvent.email && (
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h-3l-4 4z"></path>
                  </svg>
                  <span>{hoveredEvent.email}</span>
                </div>
              )}
              {hoveredEvent.phone && (
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{hoveredEvent.phone}</span>
                </div>
              )}
              {hoveredEvent.additionalNotes && (
                <div className="pt-1.5 border-t border-white/10">
                  <div className="flex items-start space-x-1.5">
                    <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                    <div>
                      <p className="font-medium text-purple-300 text-xs mb-0.5">Notes:</p>
                      <p className="whitespace-pre-wrap text-xs">{hoveredEvent.additionalNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)
};

export default BookedDatesCalendar;