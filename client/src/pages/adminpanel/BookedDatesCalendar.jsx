import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from 'axios';

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
      const response = await axios.get('/api/bookings');
      const bookingsData = Array.isArray(response.data) ? response.data : [];
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
    const backgroundColor = 
      event.status === 'Booked' ? '#dc2626' : // red
      event.status === 'Approved' ? '#2563eb' : // blue
      event.status === 'Pending' ? '#d97706' : // amber
      '#4f46e5'; // default purple

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer'
      }
    };
  };

  const calendarCustomStyles = {
    className: 'custom-calendar',
    style: {
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.1)',
      padding: '20px'
    }
  };

  const calendarComponents = {
    toolbar: (props) => (
      <div className="flex justify-between items-center mb-6 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
        <button
          onClick={() => props.onNavigate('PREV')}
          className="p-2 hover:bg-white rounded-lg transition-all duration-300 text-violet-700 font-medium hover:shadow-sm"
        >
          ←
        </button>
        <span className="text-xl font-bold text-violet-900">
          {format(props.date, 'yyyy')}
        </span>
        <button
          onClick={() => props.onNavigate('NEXT')}
          className="p-2 hover:bg-white rounded-lg transition-all duration-300 text-violet-700 font-medium hover:shadow-sm"
        >
          →
        </button>
      </div>
    ),
    month: {
      header: ({ date }) => (
        <div className="text-center font-bold text-violet-900 py-3 text-lg">
          {format(date, 'MMMM')}
        </div>
      ),
      dateHeader: ({ date }) => (
        <div className="text-center font-medium text-gray-600 py-2">
          {format(date, 'd')}
        </div>
      ),
      event: ({ event }) => (
        <div
          onMouseEnter={(e) => handleEventMouseEnter(event, e)}
          onMouseLeave={handleEventMouseLeave}
          className="w-full h-full"
        >
          {event.title}
        </div>
      )
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Booked Dates Calendar</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="font-medium text-red-900">Booked</span>
          </div>
          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="font-medium text-blue-900">Approved</span>
          </div>
          <div className="flex items-center bg-amber-50 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className="font-medium text-amber-900">Pending</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Calendar
          localizer={localizer}
          events={bookedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          components={calendarComponents}
        />
        {hoveredEvent && (
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
              pointerEvents: 'none',
              minWidth: 180
            }}
          >
            <div>
              <span className="font-semibold text-gray-800">Booked By:</span> {hoveredEvent.customerName}
            </div>
            <div>
              <span className="font-semibold text-gray-800">Event:</span> {hoveredEvent.eventType}
            </div>
            {hoveredEvent.startTime && hoveredEvent.endTime && (
              <div>
                <span className="font-semibold text-gray-800">Time:</span> {hoveredEvent.startTime} - {hoveredEvent.endTime}
              </div>
            )}
            {hoveredEvent.guestCount && (
              <div>
                <span className="font-semibold text-gray-800">Guests:</span> {hoveredEvent.guestCount}
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-800">Status:</span> {hoveredEvent.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedDatesCalendar; 