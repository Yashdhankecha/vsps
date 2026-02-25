import React, { useState, useEffect, useMemo } from 'react';
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
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { CalendarIcon as CalendarIconSolid } from '@heroicons/react/24/solid';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Professional, muted status colors
const STATUS_CONFIG = {
  Booked: {
    label: 'Booked',
    desc: 'Confirmed reservations',
    bg: '#dc2626',
    bgLight: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    dot: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  },
  Approved: {
    label: 'Approved',
    desc: 'Pending confirmation',
    bg: '#2563eb',
    bgLight: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    dot: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },
  Pending: {
    label: 'Pending',
    desc: 'Awaiting approval',
    bg: '#d97706',
    bgLight: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    dot: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
  }
};

const BookedDatesCalendar = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['Booked', 'Approved', 'Pending']);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/bookings');
      const bookingsData = Array.isArray(response.data) ? response.data :
        Array.isArray(response.data?.bookings) ? response.data.bookings :
          Array.isArray(response.data?.data) ? response.data.data : [];

      const events = bookingsData
        .filter(booking => booking.status !== 'Rejected' && booking.date)
        .map(booking => {
          const eventDate = new Date(booking.date);
          return {
            title: `${booking.firstName || ''} ${booking.surname || ''}`.trim() || 'N/A',
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
        });

      setBookedEvents(events);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered events based on active filters and search
  const filteredEvents = useMemo(() => {
    return bookedEvents.filter(event => {
      const matchesFilter = activeFilters.includes(event.status);
      const matchesSearch = searchQuery === '' ||
        event.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [bookedEvents, activeFilters, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    booked: bookedEvents.filter(e => e.status === 'Booked').length,
    approved: bookedEvents.filter(e => e.status === 'Approved').length,
    pending: bookedEvents.filter(e => e.status === 'Pending').length,
    total: bookedEvents.length,
  }), [bookedEvents]);

  const toggleFilter = (status) => {
    setActiveFilters(prev =>
      prev.includes(status)
        ? prev.filter(f => f !== status)
        : [...prev, status]
    );
  };

  const eventStyleGetter = (event) => {
    const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.Pending;
    return {
      style: {
        background: config.gradient,
        borderRadius: '6px',
        color: '#ffffff',
        border: 'none',
        padding: '2px 6px',
        fontSize: '0.7rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        lineHeight: '1.3',
        transition: 'all 0.15s ease',
      }
    };
  };

  const calendarComponents = {
    toolbar: (props) => (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 mb-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <button
            onClick={() => props.onNavigate('PREV')}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 border border-gray-200"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-lg font-bold text-gray-900 min-w-[180px] text-center">
            {format(props.date, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => props.onNavigate('NEXT')}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 border border-gray-200"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => props.onNavigate('TODAY')}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    ),
    month: {
      dateHeader: ({ date }) => (
        <div className="text-right font-medium text-gray-600 py-1 px-2 text-xs">
          {format(date, 'd')}
        </div>
      ),
      event: ({ event }) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.Pending;
        return (
          <div
            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
            className="w-full text-xs p-1 cursor-pointer overflow-hidden leading-tight"
          >
            <div className="font-semibold truncate">{event.customerName}</div>
            <div className="truncate opacity-90 text-[0.6rem]">{event.eventType}</div>
          </div>
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8f9fa' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-600 mb-4"></div>
            <span className="text-sm text-gray-500 font-medium">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8f9fa' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center border border-red-200">
            <XCircleIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Calendar</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
            <CalendarIconSolid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Booking Calendar</h1>
            <p className="text-gray-500 text-xs">View and manage all scheduled bookings</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 font-medium">Total Bookings</div>
        </div>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm" style={{ borderLeft: `3px solid ${config.bg}` }}>
            <div className="text-2xl font-bold" style={{ color: config.bg }}>{stats[key.toLowerCase()]}</div>
            <div className="text-xs text-gray-500 font-medium">{config.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Filter:</span>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const isActive = activeFilters.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: isActive ? config.bgLight : '#ffffff',
                    borderColor: isActive ? config.border : '#e5e7eb',
                    color: isActive ? config.text : '#9ca3af',
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: config.dot, opacity: isActive ? 1 : 0.4 }}></div>
                  {config.label}
                </button>
              );
            })}
          </div>
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
            />
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded" style={{ background: config.gradient }}></div>
              <span><strong className="text-gray-800">{config.label}</strong> — {config.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="calendar-container relative" style={{ height: '560px', minHeight: '560px' }}>
          <style>{`
            .light-calendar {
              background: #ffffff !important;
              color: #1f2937 !important;
              height: 100% !important;
              font-family: Inter, system-ui, -apple-system, sans-serif;
            }
            .light-calendar .rbc-calendar {
              background: #ffffff !important;
              height: 100% !important;
            }
            .light-calendar .rbc-header {
              background: #f9fafb !important;
              color: #374151 !important;
              border-bottom: 1px solid #e5e7eb !important;
              padding: 10px 4px !important;
              font-weight: 600 !important;
              font-size: 0.8rem !important;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            .light-calendar .rbc-month-view {
              background: #ffffff !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              height: calc(100% - 60px) !important;
            }
            .light-calendar .rbc-day-bg {
              background: #ffffff !important;
              border-right: 1px solid #f3f4f6 !important;
              border-bottom: 1px solid #f3f4f6 !important;
              min-height: 80px !important;
              transition: background 0.15s ease;
            }
            .light-calendar .rbc-day-bg:hover {
              background: #f9fafb !important;
            }
            .light-calendar .rbc-today {
              background: #f0f9ff !important;
            }
            .light-calendar .rbc-off-range-bg {
              background: #fafafa !important;
            }
            .light-calendar .rbc-date-cell {
              color: #374151 !important;
              padding: 4px 8px !important;
              font-size: 0.8rem !important;
            }
            .light-calendar .rbc-off-range {
              color: #d1d5db !important;
            }
            .light-calendar .rbc-current {
              color: #2563eb !important;
              font-weight: 700 !important;
            }
            .light-calendar .rbc-month-row {
              min-height: 80px !important;
            }
            .light-calendar .rbc-row-bg .rbc-day-bg {
              min-height: 80px !important;
            }
            .light-calendar .rbc-event {
              border: none !important;
              transition: all 0.15s ease !important;
              margin-bottom: 1px !important;
              overflow: hidden !important;
            }
            .light-calendar .rbc-event:hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
              z-index: 10 !important;
            }
            .light-calendar .rbc-event-content {
              font-size: 0.7rem !important;
              line-height: 1.3 !important;
            }
            .light-calendar .rbc-row-content {
              min-height: 80px !important;
            }
            .light-calendar .rbc-show-more {
              color: #2563eb !important;
              font-weight: 600 !important;
              font-size: 0.7rem !important;
              background: transparent !important;
            }
            .light-calendar .rbc-month-row + .rbc-month-row {
              border-top: 1px solid #e5e7eb !important;
            }
            /* Week and Day view */
            .light-calendar .rbc-time-view {
              border: 1px solid #e5e7eb !important;
              border-radius: 12px !important;
              overflow: hidden !important;
            }
            .light-calendar .rbc-time-header {
              background: #f9fafb !important;
            }
            .light-calendar .rbc-time-content {
              border-top: 1px solid #e5e7eb !important;
            }
            .light-calendar .rbc-timeslot-group {
              border-bottom: 1px solid #f3f4f6 !important;
            }
            .light-calendar .rbc-time-slot {
              color: #9ca3af !important;
              font-size: 0.7rem !important;
            }
            .light-calendar .rbc-day-slot .rbc-time-slot {
              border-top: 1px solid #f3f4f6 !important;
            }
            .light-calendar .rbc-allday-cell {
              background: #f9fafb !important;
            }
            @media (max-width: 640px) {
              .light-calendar .rbc-header {
                padding: 6px 2px !important;
                font-size: 0.65rem !important;
              }
              .light-calendar .rbc-date-cell {
                padding: 2px 4px !important;
                font-size: 0.65rem !important;
              }
              .light-calendar .rbc-month-row,
              .light-calendar .rbc-row-bg .rbc-day-bg,
              .light-calendar .rbc-row-content {
                min-height: 50px !important;
              }
            }
          `}</style>

          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            components={calendarComponents}
            className="light-calendar"
            style={{ height: '100%', backgroundColor: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}
            views={['month']}
            defaultView="month"
            popup={false}
            showMultiDayTimes
            step={60}
            timeslots={1}
            onSelectEvent={(event) => setSelectedEvent(event)}
            tooltipAccessor={false}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header with status color bar */}
            <div className="p-5 pb-4" style={{ borderBottom: `3px solid ${(STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending).bg}` }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: (STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending).bgLight,
                    color: (STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending).text,
                    border: `1px solid ${(STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending).border}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: (STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending).dot }}></div>
                  {selectedEvent.status}
                </span>
              </div>

              {/* Customer Name */}
              <div>
                <h4 className="text-base font-bold text-gray-900">{selectedEvent.customerName}</h4>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <DetailRow icon={<CalendarIcon className="w-4 h-4 text-gray-400" />} label="Event Type" value={selectedEvent.eventType} />
                <DetailRow icon={<ClockIcon className="w-4 h-4 text-gray-400" />} label="Time" value={`${selectedEvent.startTime} - ${selectedEvent.endTime}`} />
                <DetailRow icon={<UsersIcon className="w-4 h-4 text-gray-400" />} label="Guests" value={`${selectedEvent.guestCount} guests`} />
                {selectedEvent.email && (
                  <DetailRow icon={<EnvelopeIcon className="w-4 h-4 text-gray-400" />} label="Email" value={selectedEvent.email} />
                )}
                {selectedEvent.phone && (
                  <DetailRow icon={<PhoneIcon className="w-4 h-4 text-gray-400" />} label="Phone" value={selectedEvent.phone} />
                )}
              </div>

              {/* Notes */}
              {selectedEvent.additionalNotes && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedEvent.additionalNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for modal detail rows
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value}</p>
    </div>
  </div>
);


export default BookedDatesCalendar;