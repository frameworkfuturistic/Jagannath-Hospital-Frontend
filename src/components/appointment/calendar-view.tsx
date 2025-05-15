// eslint-disable-next-line
// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppointment } from '@/context/appointment-context';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  doctorId: number;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function CalendarView({
  doctorId,
  onDateSelect,
  selectedDate,
  isLoading,
  setIsLoading,
}: CalendarViewProps) {
  const { state, fetchAvailableDates, fetchAvailableSlots } = useAppointment();
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityStats, setAvailabilityStats] = useState<{
    totalDays: number;
    availableDays: number;
    morningSlots: number;
    afternoonSlots: number;
    eveningSlots: number;
  }>({
    totalDays: 0,
    availableDays: 0,
    morningSlots: 0,
    afternoonSlots: 0,
    eveningSlots: 0,
  });

  useEffect(() => {
    if (doctorId) {
      setIsLoading(true);
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();

      fetchAvailableDates(doctorId, month, year).finally(() =>
        setIsLoading(false)
      );
    }
  }, [doctorId, fetchAvailableDates, setIsLoading, currentMonth]);

  useEffect(() => {
    // Convert available dates to calendar events
    const newEvents = state.availableDates.map((dateStr) => {
      const date = new Date(dateStr);
      return {
        id: date.toISOString(),
        title: 'Available',
        start: date,
        end: date,
        allDay: true,
        resource: 'available',
      };
    });

    setEvents(newEvents);

    // Calculate availability statistics
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    // This is a simplified calculation - in a real app, you'd get actual slot counts from the API
    const morningSlots = Math.floor(state.availableDates.length * 0.4);
    const afternoonSlots = Math.floor(state.availableDates.length * 0.3);
    const eveningSlots = Math.floor(state.availableDates.length * 0.3);

    setAvailabilityStats({
      totalDays: daysInMonth,
      availableDays: state.availableDates.length,
      morningSlots,
      afternoonSlots,
      eveningSlots,
    });
  }, [state.availableDates, currentMonth]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Only allow selection of available dates
    const isAvailable = state.availableDates.some((dateStr) => {
      const availableDate = new Date(dateStr);
      return moment(availableDate).isSame(start, 'day');
    });

    if (isAvailable) {
      onDateSelect(start);

      // Fetch slots for the selected date
      const formattedDate = format(start, 'yyyy-MM-dd');
      fetchAvailableSlots(doctorId, formattedDate);
    }
  };

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: '#10B981', // Green for available
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      textAlign: 'center' as const,
    };

    return {
      style,
    };
  };

  // Add this function to the component
  const checkDateAvailability = (date: Date) => {
    return state.availableDates.some((dateStr) => {
      const availableDate = new Date(dateStr);
      return isSameDay(availableDate, date);
    });
  };

  // Update the dayPropGetter function
  const dayPropGetter = (date: Date) => {
    // Check if the date is available
    const isAvailable = checkDateAvailability(date);

    // Check if the date is selected
    const isSelected = selectedDate && isSameDay(date, selectedDate);

    // Check if date is in the past
    const isPast = isBefore(date, startOfDay(new Date()));

    if (isPast) {
      return {
        className: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        style: {
          borderRadius: '8px',
        },
      };
    }

    if (isSelected) {
      return {
        className: 'bg-blue-100 font-bold',
        style: {
          borderRadius: '8px',
        },
      };
    }

    if (isAvailable) {
      return {
        className: 'bg-green-50 cursor-pointer hover:bg-green-100',
        style: {
          borderRadius: '8px',
        },
      };
    }

    return {};
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (action === 'NEXT') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (action === 'TODAY') {
      setCurrentMonth(new Date());
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 relative">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleNavigate('PREV')}
            className="p-2 rounded-full hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-blue-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleNavigate('NEXT')}
            className="p-2 rounded-full hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-blue-600" />
          </motion.button>
        </div>
        <span className="text-lg font-semibold text-blue-800">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => handleNavigate('TODAY')}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
        >
          Today
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <div className="md:col-span-3">
          <Card className="p-4 h-96 overflow-hidden bg-white  shadow-sm">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={[Views.MONTH]}
              defaultView={Views.MONTH}
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              tooltipAccessor={() => 'Available for booking'}
              date={currentMonth}
              onNavigate={() => {}} // We're handling navigation ourselves
              components={{
                toolbar: () => null, // Hide the default toolbar
              }}
            />
          </Card>
        </div>

        <div className="md:col-span-1 hidden md:flex">
          <Card className="p-4 h-96 bg-white shadow-sm">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Availability
              </h3>

              <div className="space-y-4 flex-1">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">
                    Available Days
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {availabilityStats.availableDays}{' '}
                    <span className="text-sm font-normal text-blue-600">
                      / {availabilityStats.totalDays}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-600">
                    Slot Distribution
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Morning</span>
                      <span className="text-sm font-medium text-blue-800">
                        {availabilityStats.morningSlots} slots
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            (availabilityStats.morningSlots /
                              (availabilityStats.morningSlots +
                                availabilityStats.afternoonSlots +
                                availabilityStats.eveningSlots)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Afternoon</span>
                      <span className="text-sm font-medium text-blue-800">
                        {availabilityStats.afternoonSlots} slots
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-400 h-2 rounded-full"
                        style={{
                          width: `${
                            (availabilityStats.afternoonSlots /
                              (availabilityStats.morningSlots +
                                availabilityStats.afternoonSlots +
                                availabilityStats.eveningSlots)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Evening</span>
                      <span className="text-sm font-medium text-blue-800">
                        {availabilityStats.eveningSlots} slots
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-400 h-2 rounded-full"
                        style={{
                          width: `${
                            (availabilityStats.eveningSlots /
                              (availabilityStats.morningSlots +
                                availabilityStats.afternoonSlots +
                                availabilityStats.eveningSlots)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 mb-1">
                    Selected Date
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
