'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, isBefore, parse } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
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
import { createSlot, fetchConsultants } from '@/lib/api';
import type { Consultant, CreateSlotPayload } from '@/types/types';

interface FormData {
  doctorId: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  intervalMinutes: string;
}

export default function AddSlotForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState<Consultant[]>([]);
  const [formData, setFormData] = useState<FormData>({
    doctorId: '',
    date: undefined,
    startTime: '09:00:00',
    endTime: '17:00:00',
    intervalMinutes: '15',
  });

  const fetchDoctors = useCallback(async () => {
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
    fetchDoctors();
  }, [fetchDoctors]);

  const resetForm = () => {
    setFormData({
      doctorId: '',
      date: undefined,
      startTime: '09:00:00',
      endTime: '17:00:00',
      intervalMinutes: '15',
    });
    setSuccess(false);
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

  const validateForm = (): boolean => {
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return false;
    }

    if (!formData.date) {
      toast.error('Please select a date');
      return false;
    }

    if (formData.date < new Date()) {
      toast.error('Date cannot be in the past');
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

    if (isBefore(endTimeObj, startTimeObj)) {
      toast.error('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: CreateSlotPayload = {
        consultant_id: Number(formData.doctorId),
        date: format(formData.date!, 'yyyy-MM-dd'),
        start_time: formData.startTime,
        end_time: formData.endTime,
        interval_minutes: Number(formData.intervalMinutes),
      };

      await createSlot(payload);
      setSuccess(true);
      toast.success('Slot added successfully!', {
        action: {
          label: 'View Slots',
          onClick: () => router.push('/admin/slots'),
        },
        duration: 10000,
      });
    } catch (error: any) {
      console.error('Error adding slot:', error);
      toast.error(error?.response?.data?.message || 'Failed to add slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Slot</CardTitle>
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
                Slot Created Successfully!
              </h3>
              <div className="flex space-x-4 pt-4">
                <Button type="button" onClick={resetForm} variant="outline">
                  Add Another Slot
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/appointment/slots')}
                >
                  View All Slots
                </Button>
              </div>
            </div>
          ) : (
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

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="date"
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, 'PPP')
                        : 'Select a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange('date', date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
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
                    value={formData.startTime.split(':').slice(0, 2).join(':')}
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

              {/* Interval Selection */}
              <div className="space-y-2">
                <Label htmlFor="intervalMinutes">Interval (minutes)</Label>
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
            </div>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/slots')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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
                  Adding...
                </span>
              ) : (
                'Add Slot'
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
