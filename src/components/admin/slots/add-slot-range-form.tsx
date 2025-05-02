'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  addMinutes,
  parse,
  isBefore,
  isAfter,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Consultant, CreateSlotRangePayload } from '@/types/types';
import { createSlotRange, fetchConsultants } from '@/lib/api';

interface DayOfWeek {
  id: number;
  name: string;
  shortName: string;
}

interface GeneratedSlot {
  startTime: string;
  endTime: string;
  date: string;
  day: string;
  token: string;
}

interface FormData {
  doctorId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  intervalMinutes: string;
}

const daysOfWeek: DayOfWeek[] = [
  { id: 0, name: 'Sunday', shortName: 'Sun' },
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' },
];

export default function AddSlotRangeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState<Consultant[]>([]);
  const [formData, setFormData] = useState<FormData>({
    doctorId: '',
    startDate: undefined,
    endDate: undefined,
    startTime: '09:00:00',
    endTime: '17:00:00',
    intervalMinutes: '15',
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [generatedSlots, setGeneratedSlots] = useState<GeneratedSlot[]>([]);

  // Reset form after successful submission
  const resetForm = () => {
    setFormData({
      doctorId: '',
      startDate: undefined,
      endDate: undefined,
      startTime: '09:00:00',
      endTime: '17:00:00',
      intervalMinutes: '15',
    });
    setSelectedDays([1, 2, 3, 4, 5]);
    setGeneratedSlots([]);
    setSuccess(false);
  };

  // Fetch doctors list
  const fetchDoctorsList = useCallback(async () => {
    setLoading(true);
    try {
      const consultants = await fetchConsultants();
      setDoctors(consultants);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorsList();
  }, [fetchDoctorsList]);

  const toggleDaySelection = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return false;
    }

    if (isAfter(formData.startDate, formData.endDate)) {
      toast.error('End date must be after start date');
      return false;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please enter both start and end times');
      return false;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (
      !timeRegex.test(formData.startTime) ||
      !timeRegex.test(formData.endTime)
    ) {
      toast.error('Time must be in HH:MM:SS format');
      return false;
    }

    const startTimeObj = parse(formData.startTime, 'HH:mm:ss', new Date());
    const endTimeObj = parse(formData.endTime, 'HH:mm:ss', new Date());

    if (isAfter(startTimeObj, endTimeObj)) {
      toast.error('End time must be after start time');
      return false;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day of the week');
      return false;
    }

    return true;
  };

  const generateSlots = () => {
    if (!validateForm()) return;

    try {
      const { startDate, endDate, startTime, endTime, intervalMinutes } =
        formData;
      const interval = parseInt(intervalMinutes);
      const slots: GeneratedSlot[] = [];

      const dateRange = eachDayOfInterval({
        start: startDate!,
        end: endDate!,
      });

      dateRange.forEach((date) => {
        const dayOfWeek = getDay(date);

        if (selectedDays.includes(dayOfWeek)) {
          const startTimeObj = parse(startTime, 'HH:mm:ss', date);
          const endTimeObj = parse(endTime, 'HH:mm:ss', date);
          let currentTime = startTimeObj;
          let slotIndex = 1;

          while (isBefore(currentTime, endTimeObj)) {
            const nextTime = addMinutes(currentTime, interval);

            if (isAfter(nextTime, endTimeObj)) break;

            const prefix = currentTime.getHours() < 12 ? 'M' : 'A';
            const token = `${prefix}${slotIndex.toString().padStart(3, '0')}`;

            slots.push({
              startTime: format(currentTime, 'HH:mm:ss'),
              endTime: format(nextTime, 'HH:mm:ss'),
              date: format(date, 'yyyy-MM-dd'),
              day: daysOfWeek[dayOfWeek].shortName,
              token,
            });

            currentTime = nextTime;
            slotIndex++;
          }
        }
      });

      setGeneratedSlots(slots);

      if (slots.length === 0) {
        toast.error('No slots could be generated with the current parameters');
      } else {
        toast.success(`Generated ${slots.length} slots for preview`);
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      toast.error('Failed to generate slots');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || generatedSlots.length === 0) {
      toast.error('Please generate valid slots first');
      return;
    }

    setLoading(true);

    try {
      const payload: CreateSlotRangePayload = {
        consultant_id: Number(formData.doctorId),
        start_date: format(formData.startDate!, 'yyyy-MM-dd'),
        end_date: format(formData.endDate!, 'yyyy-MM-dd'),
        start_time: formData.startTime,
        end_time: formData.endTime,
        interval_minutes: parseInt(formData.intervalMinutes),
        days_of_week: selectedDays,
      };

      await createSlotRange(payload);

      // Show success message with options
      setSuccess(true);
      toast.success('Slots created successfully!', {
        action: {
          label: 'View Slots',
          onClick: () => router.push('/dashboard/appointment/slots'),
        },
        actionButtonStyle: {
          backgroundColor: '#3b82f6',
          color: 'white',
        },
        duration: 10000, // Show for 10 seconds
      });
    } catch (error: any) {
      console.error('Error creating slots:', error);
      toast.error(error?.response?.data?.message || 'Failed to create slots');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const timeWithSeconds = value.includes(':')
      ? value.split(':').length === 2
        ? `${value}:00`
        : value
      : `${value}:00:00`;

    handleInputChange(field, timeWithSeconds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Slots for Date Range</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-100 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                Slots Created Successfully!
              </h3>
              <p className="text-gray-500 text-center">
                {generatedSlots.length} slots have been successfully created.
              </p>
              <div className="flex space-x-4 pt-4">
                <Button type="button" onClick={resetForm} variant="outline">
                  Create More Slots
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/admin/slots')}
                >
                  View All Slots
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doctor Selection */}
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor *</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) =>
                      handleInputChange('doctorId', value)
                    }
                    disabled={loading || doctors.length === 0}
                  >
                    <SelectTrigger id="doctor">
                      <SelectValue
                        placeholder={
                          loading ? 'Loading doctors...' : 'Select a doctor'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem
                          key={doctor.ConsultantID}
                          value={doctor.ConsultantID.toString()}
                        >
                          {doctor.ConsultantName} - {doctor.ProfessionalDegree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Days of Week Selection */}
                <div className="space-y-2">
                  <Label>Days of Week *</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={selectedDays.includes(day.id)}
                          onCheckedChange={() => toggleDaySelection(day.id)}
                          disabled={loading}
                        />
                        <Label htmlFor={`day-${day.id}`} className="text-sm">
                          {day.shortName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="startDate"
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate
                          ? format(formData.startDate, 'PPP')
                          : 'Select start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          handleInputChange('startDate', date)
                        }
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="endDate"
                        disabled={loading || !formData.startDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate
                          ? format(formData.endDate, 'PPP')
                          : 'Select end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange('endDate', date)}
                        initialFocus
                        disabled={(date) =>
                          formData.startDate
                            ? date < formData.startDate
                            : date < new Date()
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime
                        .split(':')
                        .slice(0, 2)
                        .join(':')}
                      onChange={(e) =>
                        handleTimeChange('startTime', e.target.value)
                      }
                      className="pl-10"
                      disabled={loading}
                      step="300"
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime.split(':').slice(0, 2).join(':')}
                      onChange={(e) =>
                        handleTimeChange('endTime', e.target.value)
                      }
                      className="pl-10"
                      disabled={loading}
                      step="300"
                      min={formData.startTime.split(':').slice(0, 2).join(':')}
                    />
                  </div>
                </div>

                {/* Interval */}
                <div className="space-y-2">
                  <Label htmlFor="intervalMinutes">Interval (minutes) *</Label>
                  <Select
                    value={formData.intervalMinutes}
                    onValueChange={(value) =>
                      handleInputChange('intervalMinutes', value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="intervalMinutes">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 30, 60].map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {minutes} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Button */}
                <div className="space-y-2">
                  <div className="pt-7">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSlots}
                      disabled={loading}
                    >
                      Preview Generated Slots
                    </Button>
                  </div>
                </div>
              </div>

              {/* Generated Slots Preview */}
              {generatedSlots.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">
                    Preview: {generatedSlots.length} slots will be generated
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                    {generatedSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="text-sm border rounded p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium">{slot.token}</div>
                        <div className="text-gray-500">
                          {slot.day}, {slot.date}
                        </div>
                        <div className="text-gray-500">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/appointment/slots')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || generatedSlots.length === 0}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Slots...
                </span>
              ) : (
                'Create Slots'
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
