'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  availableDates?: string[];
  bookedDates?: string[]; // New prop for booked dates
}

export default function DateSelector({
  onSelectDate,
  selectedDate,
  availableDates = [],
  bookedDates = [],
}: DateSelectorProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfDay(new Date())
  );
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);

  // Convert date strings to Date objects
  const availableDateObjects = availableDates.map(
    (dateStr) => new Date(dateStr)
  );
  const bookedDateObjects = bookedDates.map((dateStr) => new Date(dateStr));

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(currentWeekStart, i));
    }
    setVisibleDates(dates);
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart((current) =>
      addDays(current, direction === 'prev' ? -7 : 7)
    );
  };

  const getDateStatus = (date: Date) => {
    if (bookedDateObjects.some((bookedDate) => isSameDay(bookedDate, date))) {
      return 'booked';
    }
    if (
      availableDateObjects.some((availableDate) =>
        isSameDay(availableDate, date)
      )
    ) {
      return 'available';
    }
    return 'unavailable';
  };

  const isDateInPast = (date: Date) => isBefore(date, startOfDay(new Date()));
  const isDateSelected = (date: Date) =>
    selectedDate && isSameDay(date, selectedDate);

  const getButtonStyles = (
    status: string,
    isSelected: boolean,
    isPast: boolean
  ) => {
    const baseStyles = 'w-full h-full min-h-[80px] flex flex-col p-2';

    if (isSelected) {
      return `${baseStyles} bg-blue-100 border-blue-400 text-blue-800`;
    }

    if (isPast) {
      return `${baseStyles} bg-gray-50 text-gray-400 cursor-not-allowed`;
    }

    switch (status) {
      case 'available':
        return `${baseStyles} bg-white hover:bg-green-50 border-l-4 border-l-green-400`;
      case 'booked':
        return `${baseStyles} bg-red-50 text-red-800 cursor-not-allowed`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-400 cursor-not-allowed`;
    }
  };

  const getStatusBadge = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return (
        <div className="mt-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
          Selected
        </div>
      );
    }

    switch (status) {
      case 'available':
        return (
          <div className="mt-1 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
            Available
          </div>
        );
      case 'booked':
        return (
          <div className="mt-1 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
            Booked
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-full hover:bg-gray-100"
          disabled={isBefore(currentWeekStart, startOfDay(new Date()))}
        >
          <ChevronLeft className="h-5 w-5 text-blue-600" />
        </motion.button>

        <div className="text-sm font-medium text-gray-600">
          {format(currentWeekStart, 'MMMM d')} -{' '}
          {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-blue-600" />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {visibleDates.map((date) => {
          const status = getDateStatus(date);
          const isPast = isDateInPast(date);
          const isSelected = isDateSelected(date);
          const isClickable = status === 'available' && !isPast && !isSelected;

          return (
            <motion.div
              key={date.toISOString()}
              whileHover={isClickable ? { scale: 1.05 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              <Button
                variant="outline"
                className={getButtonStyles(status, isSelected, isPast)}
                onClick={() => isClickable && onSelectDate(date)}
                disabled={!isClickable}
              >
                <span className="text-xs font-medium mb-1">
                  {format(date, 'EEE')}
                </span>
                <span
                  className={`text-xl font-bold ${
                    isSelected
                      ? 'text-blue-800'
                      : status === 'booked'
                      ? 'text-red-800'
                      : ''
                  }`}
                >
                  {format(date, 'd')}
                </span>
                <span className="text-xs mt-1">{format(date, 'MMM')}</span>
                {getStatusBadge(status, isSelected)}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-4 text-xs text-gray-500 mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
