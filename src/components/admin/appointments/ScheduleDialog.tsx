'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  CalendarIcon,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  fetchConsultantSlots,
  fetchAvailableSlotsForReschedule,
  scheduleAppointment,
} from '@/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Appointment, Slot } from '@/types/types';

interface ScheduleDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ScheduleDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set());

  // Helper function to normalize dates to UTC
  const normalizeToUTC = (date: Date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  };

  // Initialize selectedDate when appointment is available
  useEffect(() => {
    if (appointment?.ConsultationDate) {
      const appointmentDate = parseISO(appointment.ConsultationDate);
      setSelectedDate(appointmentDate);
    }
  }, [appointment]);

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(Number(hours));
      date.setMinutes(Number(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Fetch all available slots for the current month to highlight dates in calendar
  useEffect(() => {
    if (appointment?.ConsultantID) {
      const fetchAllAvailableSlots = async () => {
        try {
          const response = await fetchConsultantSlots(appointment.ConsultantID);
          const slotsByDate = response as unknown as Record<string, Slot[]>;
          const availableDates = new Set<string>();

          const today = normalizeToUTC(new Date());

          Object.entries(slotsByDate).forEach(([dateStr, slotsForDate]) => {
            const slotDate = normalizeToUTC(new Date(dateStr));

            // Only consider dates today or in the future
            if (slotDate >= today) {
              const hasAvailableSlot = slotsForDate.some(
                (slot) => slot.AvailableSlots > 0
              );

              if (hasAvailableSlot) {
                // Store date in YYYY-MM-DD format
                availableDates.add(format(slotDate, 'yyyy-MM-dd'));
              }
            }
          });

          setDatesWithSlots(availableDates);
        } catch (error) {
          console.error('Error fetching all available slots:', error);
        }
      };

      fetchAllAvailableSlots();
    }
  }, [appointment?.ConsultantID]);

  useEffect(() => {
    if (selectedDate && appointment?.ConsultantID) {
      const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const slots = await fetchAvailableSlotsForReschedule(
            appointment.ConsultantID,
            dateStr
          );
          setAvailableSlots(slots);

          // Preselect current slot if on same date
          if (
            appointment.SlotID &&
            format(parseISO(appointment.ConsultationDate), 'yyyy-MM-dd') ===
              dateStr
          ) {
            const currentSlot = slots.find(
              (s: Slot) => s.SlotID === appointment.SlotID
            );
            setSelectedSlot(currentSlot || null);
          } else {
            setSelectedSlot(null);
          }
        } catch (error) {
          toast.error('Failed to fetch available slots');
          console.error(error);
        } finally {
          setLoadingSlots(false);
        }
      };

      fetchAvailableSlots();
    }
  }, [
    selectedDate,
    appointment?.ConsultantID,
    appointment?.SlotID,
    appointment?.ConsultationDate,
  ]);

  const handleSchedule = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setIsScheduling(true);
    try {
      await scheduleAppointment(appointment.AppointmentID, selectedSlot.SlotID);
      toast.success('Appointment rescheduled successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to reschedule appointment');
      console.error(error);
    } finally {
      setIsScheduling(false);
    }
  };

  const getSlotStatusColor = (slot: Slot) => {
    if (slot.SlotID === appointment.SlotID) {
      return 'bg-blue-100 border-blue-300 text-blue-700';
    }
    if (slot.AvailableSlots > 0 && slot.IsBooked === 0) {
      return 'bg-green-100 border-green-300 text-green-700';
    }
    return 'bg-red-100 border-red-300 text-red-700';
  };

  const getSlotStatusText = (slot: Slot) => {
    if (slot.SlotID === appointment.SlotID) {
      return 'Current';
    }
    if (slot.AvailableSlots > 0 && slot.IsBooked === 0) {
      return 'Available';
    }
    return 'Booked';
  };

  const getSlotStatusIcon = (slot: Slot) => {
    if (slot.SlotID === appointment.SlotID) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    if (slot.AvailableSlots > 0 && slot.IsBooked === 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  // Custom calendar modifiers
  const modifiersStyles = {
    hasSlots: {
      backgroundColor: '#10B98133',
      border: '1px solid #10B981',
      color: '#065F46',
      fontWeight: 'bold' as const,
    },
  };

  // Function to check if a date has available slots
  const hasAvailableSlots = (date: Date) => {
    const dateStr = format(normalizeToUTC(date), 'yyyy-MM-dd');
    return datesWithSlots.has(dateStr);
  };

  // Disabled dates for calendar
  const isDateDisabled = (date: Date) => {
    const utcDate = normalizeToUTC(date);
    const today = normalizeToUTC(new Date());
    const futureLimit = new Date(today);
    futureLimit.setDate(futureLimit.getDate() + 30);

    return utcDate < today || utcDate > futureLimit;
  };

  if (!appointment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for {appointment.PatientName}'s
            appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Current Appointment</h3>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {appointment.ConsultationDate
                    ? format(
                        parseISO(appointment.ConsultationDate),
                        'MMMM d, yyyy'
                      )
                    : 'No date selected'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-gray-600">
                  {appointment.Slot?.SlotTime && appointment.Slot?.SlotEndTime
                    ? formatTimeRange(
                        appointment.Slot.SlotTime,
                        appointment.Slot.SlotEndTime
                      )
                    : 'No time selected'}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Select New Date</h3>
              <div className="p-4 border rounded-md bg-card">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  disabled={isDateDisabled}
                  modifiers={{
                    hasSlots: (date) => hasAvailableSlots(date),
                  }}
                  modifiersStyles={modifiersStyles}
                />
                <div className="flex justify-center space-x-4 text-sm mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Available Slots</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Select Time Slot</h3>
                  <div className="flex items-center space-x-1">
                    <Tabs
                      value={view}
                      onValueChange={(v) => setView(v as 'grid' | 'list')}
                      className="w-[180px]"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="flex items-center justify-center h-32 bg-card rounded-md border">
                    <RefreshCw className="animate-spin text-primary" />
                    <span className="ml-2">Loading available slots...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-card rounded-md border">
                    No available slots for this date
                  </div>
                ) : (
                  <div className="bg-card rounded-md border p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs">Booked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs">Current</span>
                      </div>
                    </div>

                    {view === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                        {availableSlots.map((slot) => (
                          <TooltipProvider key={slot.SlotID}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`justify-between h-auto py-2 ${
                                    selectedSlot?.SlotID === slot.SlotID
                                      ? 'ring-2 ring-primary'
                                      : ''
                                  }`}
                                  onClick={() => setSelectedSlot(slot)}
                                  disabled={
                                    slot.AvailableSlots <= 0 &&
                                    slot.SlotID !== appointment.SlotID
                                  }
                                >
                                  <div className="flex flex-col items-start">
                                    <span>{formatTime(slot.SlotTime)}</span>
                                    <span className="text-xs text-muted-foreground">
                                      to {formatTime(slot.SlotEndTime)}
                                    </span>
                                  </div>
                                  {getSlotStatusIcon(slot)}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getSlotStatusText(slot)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.SlotID}
                            className={`border rounded-md p-3 cursor-pointer transition-all ${
                              selectedSlot?.SlotID === slot.SlotID
                                ? 'ring-2 ring-primary'
                                : ''
                            } ${
                              slot.AvailableSlots <= 0 &&
                              slot.SlotID !== appointment.SlotID
                                ? 'opacity-60'
                                : ''
                            }`}
                            onClick={() => {
                              if (
                                slot.AvailableSlots > 0 ||
                                slot.SlotID === appointment.SlotID
                              ) {
                                setSelectedSlot(slot);
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatTimeRange(
                                    slot.SlotTime,
                                    slot.SlotEndTime
                                  )}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={getSlotStatusColor(slot)}
                              >
                                <span className="flex items-center gap-1">
                                  {getSlotStatusIcon(slot)}
                                  {getSlotStatusText(slot)}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedSlot && selectedDate && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Selected Appointment</h3>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTimeRange(
                        selectedSlot.SlotTime,
                        selectedSlot.SlotEndTime
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getSlotStatusColor(selectedSlot)}
                    >
                      {getSlotStatusText(selectedSlot)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={
              !selectedSlot ||
              isScheduling ||
              selectedSlot?.SlotID === appointment.SlotID
            }
            className="gap-2"
          >
            {isScheduling ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4" />
                Confirm Reschedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
