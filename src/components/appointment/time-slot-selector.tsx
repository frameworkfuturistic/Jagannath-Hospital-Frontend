'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Check, Sun, Sunset, Moon } from 'lucide-react';
import { format, parse, isBefore, isAfter, set } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import debounce from 'lodash/debounce';

interface Slot {
  SlotID: number;
  ConsultantID: number;
  SlotDate: string;
  SlotTime: string;
  SlotEndTime: string;
  MaxSlots: number;
  AvailableSlots: number;
  IsBooked: boolean;
  Status: 'Available' | 'Hold' | 'Booked' | 'Cancelled' | 'Completed';
  SlotToken?: string | null;
}

interface TimeSlotSelectorProps {
  slots: Slot[];
  selectedSlot: number | null;
  onSelectSlot: (slotId: number) => void;
  isLoading: boolean;
  date: Date | null;
}

// Time range constants
const TIME_RANGES = {
  morning: { start: 6, end: 11 },
  afternoon: { start: 12, end: 16 },
  evening: { start: 17, end: 21 },
};

export default function TimeSlotSelector({
  slots = [],
  selectedSlot,
  onSelectSlot,
  isLoading,
  date,
}: TimeSlotSelectorProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Memoized time parsing function
  const parseTimeString = useCallback((timeString: string) => {
    try {
      return parse(timeString, 'HH:mm:ss', new Date());
    } catch {
      try {
        return parse(timeString, 'HH:mm', new Date());
      } catch {
        return new Date();
      }
    }
  }, []);

  // Format time for display
  const parseAndFormatTime = useCallback(
    (timeString: string) => {
      const time = parseTimeString(timeString);
      return format(time, 'h:mm a');
    },
    [parseTimeString]
  );

  // Group slots by time of day
  const timeGroups = useMemo(() => {
    const groups = {
      morning: [] as Slot[],
      afternoon: [] as Slot[],
      evening: [] as Slot[],
    };

    slots.forEach((slot) => {
      const timeObj = parseTimeString(slot.SlotTime);
      const hours = timeObj.getHours();

      if (
        hours >= TIME_RANGES.morning.start &&
        hours <= TIME_RANGES.morning.end
      ) {
        groups.morning.push(slot);
      } else if (
        hours >= TIME_RANGES.afternoon.start &&
        hours <= TIME_RANGES.afternoon.end
      ) {
        groups.afternoon.push(slot);
      } else if (
        hours >= TIME_RANGES.evening.start &&
        hours <= TIME_RANGES.evening.end
      ) {
        groups.evening.push(slot);
      }
    });

    return groups;
  }, [slots, parseTimeString]);

  // Filter slots based on active tab
  const filteredSlots = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return timeGroups.morning;
      case 'afternoon':
        return timeGroups.afternoon;
      case 'evening':
        return timeGroups.evening;
      default:
        return slots;
    }
  }, [activeTab, slots, timeGroups]);

  // Debounced slot selection
  const handleSelectSlot = useMemo(
    () => debounce((slotId: number) => onSelectSlot(slotId), 300),
    [onSelectSlot]
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      handleSelectSlot.cancel();
    };
  }, [handleSelectSlot]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Clock className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">
          No available slots for the selected date.
          <br />
          Please select a different date or doctor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger
              value="all"
              className="flex items-center justify-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              All
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2">
                {slots.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="morning"
              className="flex items-center justify-center"
            >
              <Sun className="h-4 w-4 mr-2" />
              Morning
              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 rounded-full px-2">
                {timeGroups.morning.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="afternoon"
              className="flex items-center justify-center"
            >
              <Sunset className="h-4 w-4 mr-2" />
              Afternoon
              <span className="ml-1 text-xs bg-orange-100 text-orange-800 rounded-full px-2">
                {timeGroups.afternoon.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="evening"
              className="flex items-center justify-center"
            >
              <Moon className="h-4 w-4 mr-2" />
              Evening
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 rounded-full px-2">
                {timeGroups.evening.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {date && (
            <div className="text-sm text-blue-600">
              {format(date, 'EEEE, MMMM d')}
            </div>
          )}
        </div>

        <TabsContent value="all" className="m-0">
          <SlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            parseAndFormatTime={parseAndFormatTime}
          />
        </TabsContent>

        <TabsContent value="morning" className="m-0">
          <SlotGrid
            slots={timeGroups.morning}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            parseAndFormatTime={parseAndFormatTime}
            emptyMessage="No morning slots available"
            icon={<Sun className="h-8 w-8 text-yellow-400" />}
          />
        </TabsContent>

        <TabsContent value="afternoon" className="m-0">
          <SlotGrid
            slots={timeGroups.afternoon}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            parseAndFormatTime={parseAndFormatTime}
            emptyMessage="No afternoon slots available"
            icon={<Sunset className="h-8 w-8 text-orange-400" />}
          />
        </TabsContent>

        <TabsContent value="evening" className="m-0">
          <SlotGrid
            slots={timeGroups.evening}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            parseAndFormatTime={parseAndFormatTime}
            emptyMessage="No evening slots available"
            icon={<Moon className="h-8 w-8 text-purple-400" />}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-300 mr-2"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}

interface SlotGridProps {
  slots?: Slot[];
  selectedSlot: number | null;
  onSelectSlot: (slotId: number) => void;
  parseAndFormatTime: (time: string) => string;
  emptyMessage?: string;
  icon?: React.ReactNode;
}

const SlotGrid = React.memo(function SlotGrid({
  slots = [],
  selectedSlot,
  onSelectSlot,
  parseAndFormatTime,
  emptyMessage = 'No slots available',
  icon = <Clock className="h-8 w-8 text-gray-400" />,
}: SlotGridProps) {
  // Handle empty or undefined slots array
  if (!slots || slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        {icon}
        <p className="text-gray-500 text-center mt-3">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {slots.map((slot) => (
          <SlotCard
            key={slot.SlotID}
            slot={slot}
            isSelected={selectedSlot === slot.SlotID}
            onSelect={onSelectSlot}
            parseAndFormatTime={parseAndFormatTime}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
});

interface SlotCardProps {
  slot: Slot;
  isSelected: boolean;
  onSelect: (slotId: number) => void;
  parseAndFormatTime: (time: string) => string;
}

const SlotCard = React.memo(function SlotCard({
  slot,
  isSelected,
  onSelect,
  parseAndFormatTime,
}: SlotCardProps) {
  const status = getSlotStatus(slot);
  const colors = getStatusColor(status);
  const isInteractive = status === 'Available';

  return (
    <motion.div
      whileHover={isInteractive ? { scale: 1.05 } : {}}
      whileTap={isInteractive ? { scale: 0.95 } : {}}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 h-full ${
          isSelected
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : `${colors.bg} ${colors.hover} ${
                !isInteractive ? 'opacity-80 cursor-not-allowed' : ''
              }`
        }`}
        onClick={() => isInteractive && onSelect(slot.SlotID)}
        aria-label={`${status} slot at ${parseAndFormatTime(slot.SlotTime)}`}
        aria-disabled={!isInteractive}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <p className="font-semibold text-center text-lg">
            {parseAndFormatTime(slot.SlotTime)}
          </p>
          <div className="mt-2 flex items-center">
            {isSelected ? (
              <div className="flex items-center text-blue-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-xs">Selected</span>
              </div>
            ) : (
              <span
                className={`text-xs px-2 py-1 rounded-full ${colors.bg.replace(
                  '50',
                  '100'
                )} ${colors.text}`}
              >
                {status}
              </span>
            )}
          </div>
          {slot.SlotToken && (
            <p className="text-xs mt-1 text-gray-500 truncate max-w-full">
              {slot.SlotToken}
            </p>
          )}
          {slot.MaxSlots > 1 && (
            <p className="text-xs mt-1 text-gray-500">
              {slot.MaxSlots - slot.AvailableSlots}/{slot.MaxSlots} booked
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Helper functions outside components
function getSlotStatus(slot: Slot): string {
  if (['Booked', 'Cancelled', 'Completed'].includes(slot.Status)) {
    return slot.Status;
  }
  if (slot.Status === 'Hold') return 'On Hold';
  return slot.AvailableSlots > 0 ? 'Available' : 'Booked';
}

function getStatusColor(status: string) {
  const statusColors = {
    Available: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      hover: 'hover:bg-green-100',
    },
    Booked: { bg: 'bg-red-50', text: 'text-red-800', hover: '' },
    'On Hold': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      hover: 'hover:bg-yellow-100',
    },
    Cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', hover: '' },
    Completed: { bg: 'bg-purple-50', text: 'text-purple-800', hover: '' },
  };

  return (
    statusColors[status as keyof typeof statusColors] || {
      bg: 'bg-gray-50',
      text: 'text-gray-800',
      hover: '',
    }
  );
}
