// eslint-disable-next-line
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAppointment } from '@/context/appointment-context';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  CalendarPlus2Icon as CalendarIcon2,
  SearchCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const CalendarView = dynamic(() => import('../calendar-view'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const FindAppointment = dynamic(() => import('../find-appointment'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const DoctorSelection = dynamic(() => import('../doctor-selection'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const TimeSlotSelector = dynamic(() => import('../time-slot-selector'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const DateSelector = dynamic(() => import('../date-selector'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

import { useRouter } from 'next/navigation';

interface SlotSelectionProps {
  onNext: () => void;
}

export default function SlotSelection({ onNext }: SlotSelectionProps) {
  const {
    state,
    fetchDepartments,
    fetchDoctors,
    fetchAvailableDates,
    fetchAvailableSlots,
    setSelectedDepartment,
    setSelectedDoctor,
    setSelectedSlot,
    setSelectedDate,
  } = useAppointment();

  const [calendarView, setCalendarView] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'quick'>(
    'quick'
  );
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm();

  const selectedDate = watch('appointmentDate');
  const selectedDoctorId = watch('doctorId');
  const selectedDepartmentId = watch('departmentId');

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Update the useEffect to fetch slots when a date is selected
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchAvailableSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate, fetchAvailableSlots]);

  useEffect(() => {
    if (selectedDoctorId) {
      const currentDate = new Date();
      fetchAvailableDates(
        selectedDoctorId,
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
    }
  }, [selectedDoctorId, fetchAvailableDates]);

  const onSubmit = (data: any) => {
    if (!state.selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setSelectedDate(data.appointmentDate);
    onNext();
  };

  // Update the handleDateSelect function to fetch slots
  const handleDateSelect = (date: Date) => {
    setSelectedDateObj(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setValue('appointmentDate', formattedDate);

    // Fetch slots for the selected date
    if (selectedDoctorId) {
      fetchAvailableSlots(selectedDoctorId, formattedDate);
    }
  };

  // Get next 7 available dates for quick selection
  const nextAvailableDates = state.availableDates
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 7);

  return (
    <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Select Department</CardTitle>
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => router.push('/appointment/search')}
          >
            <SearchCheck className="mr-2 h-4 w-4" /> Find Appointment
          </Button>
          {/* <FindAppointment /> */}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Department Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="department"
              className="text-lg font-semibold flex items-center"
            >
              <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2">
                1
              </span>
              Select Department
            </Label>
            <Controller
              name="departmentId"
              control={control}
              rules={{ required: 'Department is required' }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    setSelectedDepartment(Number(value));
                    fetchDoctors(Number(value));
                    field.onChange(value);
                    // Reset doctor selection when department changes
                    setValue('doctorId', '');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.departments.map((dept) => (
                      <SelectItem
                        key={dept.DepartmentID}
                        value={dept.DepartmentID.toString()}
                      >
                        {dept.Department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departmentId && (
              <p className="text-red-500 text-sm">
                {errors.departmentId.message as string}
              </p>
            )}
          </div>

          {/* Doctor Selection */}
          <AnimatePresence>
            {selectedDepartmentId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Label
                  htmlFor="doctor"
                  className="text-lg font-semibold flex items-center"
                >
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2">
                    2
                  </span>
                  Select Doctor
                </Label>
                <Controller
                  name="doctorId"
                  control={control}
                  rules={{ required: 'Doctor is required' }}
                  render={({ field }) => (
                    <DoctorSelection
                      doctors={state.doctors}
                      selectedDoctorId={field.value}
                      onSelectDoctor={(doctorId) => {
                        setSelectedDoctor(Number.parseInt(doctorId));
                        field.onChange(doctorId);
                        // Reset date and slot when doctor changes
                        setValue('appointmentDate', '');
                        setSelectedDateObj(null);
                        setSelectedSlot(null);
                      }}
                      disabled={!selectedDepartmentId}
                    />
                  )}
                />
                {errors.doctorId && (
                  <p className="text-red-500 text-sm">
                    {errors.doctorId.message as string}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Selection */}
          <AnimatePresence>
            {selectedDoctorId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="appointmentDate"
                    className="text-lg font-semibold flex items-center"
                  >
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2">
                      3
                    </span>
                    Select Date
                  </Label>
                  <Tabs
                    defaultValue="quick"
                    value={viewMode}
                    className="w-[200px]"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="calendar"
                        onClick={() => setViewMode('calendar')}
                      >
                        <CalendarIcon2 className="h-4 w-4 mr-2" />
                        Calendar
                      </TabsTrigger>
                      <TabsTrigger
                        value="quick"
                        onClick={() => setViewMode('quick')}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Quick Pick
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  {viewMode === 'calendar' ? (
                    <CalendarView
                      doctorId={selectedDoctorId}
                      onDateSelect={handleDateSelect}
                      selectedDate={selectedDateObj}
                      isLoading={isCalendarLoading}
                      setIsLoading={setIsCalendarLoading}
                    />
                  ) : (
                    <DateSelector
                      onSelectDate={handleDateSelect}
                      selectedDate={selectedDateObj}
                      availableDates={state.availableDates}
                    />
                  )}
                </div>

                <input
                  type="hidden"
                  {...register('appointmentDate', {
                    required: 'Appointment date is required',
                  })}
                />
                {errors.appointmentDate && (
                  <p className="text-red-500 text-sm">
                    {errors.appointmentDate.message as string}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time Slot Selection */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Label className="text-lg font-semibold flex items-center">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2">
                    4
                  </span>
                  Select Time Slot
                </Label>
                <TimeSlotSelector
                  slots={state.availableSlots}
                  selectedSlot={state.selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  isLoading={state.loading}
                  date={selectedDate ? new Date(selectedDate) : null}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 p-6 flex justify-end">
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={!state.selectedSlot}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Continue to Patient Details <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
