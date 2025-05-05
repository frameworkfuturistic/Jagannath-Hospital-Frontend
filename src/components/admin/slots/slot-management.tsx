// eslint-disable-next-line
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isToday, isSameDay, addDays, subDays } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  CreditCard,
  User,
  Phone,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  LayoutGrid,
  List,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchSlotsWithAppointments,
  fetchConsultants,
  fetchDepartments,
} from '@/lib/api';
import {
  Slot,
  Consultant,
  Appointment,
  Department,
  SlotWithAppointment,
} from '@/types/types';
import Link from 'next/link';

export default function AppointmentDashboard() {
  const { toast } = useToast();

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [slots, setSlots] = useState<SlotWithAppointment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlots, setExpandedSlots] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);

  // Generate 7 days for the calendar view
  useEffect(() => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i));
    }
    setCalendarDates(dates);
  }, [selectedDate]);

  // Fetch data with memoized filters
  const currentFilters = useMemo(
    () => ({
      date: format(selectedDate, 'yyyy-MM-dd'),
      consultantId: selectedConsultant || undefined,
      departmentId: selectedDepartment || undefined,
    }),
    [selectedDate, selectedConsultant, selectedDepartment]
  );

  // Data fetching with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [slotsData, consultantsData, departmentsData] = await Promise.all([
        fetchSlotsWithAppointments(currentFilters),
        fetchConsultants(),
        fetchDepartments(),
      ]);

      setSlots(slotsData);
      setConsultants(consultantsData);
      setDepartments(departmentsData);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentFilters, toast]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const getConsultantName = useCallback(
    (consultantId: number) => {
      return (
        consultants.find((c) => c.ConsultantID === consultantId)
          ?.ConsultantName || 'Unknown'
      );
    },
    [consultants]
  );

  const getDepartmentName = useCallback(
    (departmentId: number) => {
      return (
        departments.find((d) => d.DepartmentID === departmentId)?.Department ||
        'Unknown'
      );
    },
    [departments]
  );

  const toggleSlotExpansion = useCallback((slotId: number) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedConsultant(null);
    setSelectedDepartment(null);
    setSearchQuery('');
  }, []);

  // Filter slots by search query
  const filteredSlots = useMemo(() => {
    if (!searchQuery.trim()) return slots;

    const query = searchQuery.toLowerCase();
    return slots.filter((slot) => {
      // Search in appointment details if available
      if (slot.appointment) {
        return (
          slot.appointment.PatientName.toLowerCase().includes(query) ||
          slot.appointment.MRNo.toLowerCase().includes(query) ||
          slot.appointment.MobileNo.includes(query)
        );
      }
      // Search in slot details
      return (
        slot.SlotToken.toLowerCase().includes(query) ||
        getConsultantName(slot.ConsultantID).toLowerCase().includes(query) ||
        getDepartmentName(slot.consultant.DepartmentID)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [slots, searchQuery, getConsultantName, getDepartmentName]);

  // Memoized slot grouping by time for better performance
  const slotsByTime = useMemo(() => {
    const groups: Record<string, SlotWithAppointment[]> = {};

    filteredSlots.forEach((slot) => {
      const timeKey = `${slot.SlotTime}-${slot.SlotEndTime}`;
      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      groups[timeKey].push(slot);
    });

    // Sort by time
    return Object.entries(groups).sort(([timeA], [timeB]) => {
      return timeA.localeCompare(timeB);
    });
  }, [filteredSlots]);

  // Memoized stats
  const stats = useMemo(() => {
    const total = slots.length;
    const booked = slots.filter((slot) => slot.Status === 'Booked').length;
    const available = slots.filter((slot) => slot.Status !== 'Booked').length;

    const statusCounts: Record<string, number> = {};
    slots.forEach((slot) => {
      if (slot.appointment?.Status) {
        const status = slot.appointment.Status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    const paymentCounts = {
      paid: slots.filter((slot) => slot.appointment?.PaymentStatus === 'Paid')
        .length,
      pending: slots.filter(
        (slot) => slot.appointment?.PaymentStatus === 'Pending'
      ).length,
    };

    return { total, booked, available, statusCounts, paymentCounts };
  }, [slots]);

  // Time slot distribution
  const timeDistribution = useMemo(() => {
    const morning = filteredSlots.filter((slot) => {
      const hour = Number.parseInt(slot.SlotTime.split(':')[0]);
      return hour >= 6 && hour < 12;
    }).length;

    const afternoon = filteredSlots.filter((slot) => {
      const hour = Number.parseInt(slot.SlotTime.split(':')[0]);
      return hour >= 12 && hour < 17;
    }).length;

    const evening = filteredSlots.filter((slot) => {
      const hour = Number.parseInt(slot.SlotTime.split(':')[0]);
      return hour >= 17 && hour < 22;
    }).length;

    return { morning, afternoon, evening };
  }, [filteredSlots]);

  // Helper functions for styling
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getSlotCardClass = (status: string) => {
    return status === 'Booked'
      ? 'bg-red-50 border-red-200'
      : 'bg-green-50 border-green-200';
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour = Number.parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 7));
    }
  };

  // Render appointment details
  const renderAppointmentDetails = useCallback(
    (appointment: Appointment | null) => {
      if (!appointment) return null;

      return (
        <div className="mt-3 p-4 bg-white rounded-md border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Patient:</span>
              <span className="font-medium">{appointment.PatientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Contact:</span>
              <span className="font-medium">{appointment.MobileNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Status:</span>
              <Badge
                variant="outline"
                className={getStatusBadgeClass(appointment.Status)}
              >
                {appointment.Status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">MR No:</span>
              <span className="font-medium">{appointment.MRNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Payment:</span>
              <Badge
                variant="outline"
                className={getPaymentBadgeClass(appointment.PaymentStatus)}
              >
                {appointment.PaymentStatus}
              </Badge>
            </div>
            {appointment.CancelledAt && (
              <div className="col-span-2 text-red-500 text-xs flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Cancelled at: {formatDateTime(appointment.CancelledAt)}
              </div>
            )}
          </div>
        </div>
      );
    },
    []
  );

  // Render time slot card
  const renderTimeSlotCard = useCallback(
    (slot: SlotWithAppointment) => {
      const isExpanded = expandedSlots[slot.SlotID];

      return (
        <div
          key={slot.SlotID}
          className={`rounded-lg border p-0 overflow-hidden transition-all duration-200 ${
            slot.Status === 'Booked' ? 'border-red-200' : 'border-green-200'
          }`}
        >
          <div
            className={`p-4 ${
              slot.Status === 'Booked'
                ? 'bg-gradient-to-r from-red-50 to-red-100'
                : 'bg-gradient-to-r from-green-50 to-green-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <Badge
                variant="outline"
                className={
                  slot.Status === 'Booked'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }
              >
                {slot.Status}
              </Badge>
              <span className="text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm">
                {slot.SlotToken}
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <div className=" flex justify-between">
                <p className="font-medium">
                  {getConsultantName(slot.ConsultantID)}
                </p>
                <p className="text-xs flex text-gray-500 items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className=" text-lg font-semibold">
                    {formatTime(slot.SlotTime)}
                  </span>{' '}
                  - {formatTime(slot.SlotEndTime)}
                </p>
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {getDepartmentName(slot.consultant.DepartmentID)}
              </p>
            </div>

            {slot.Status === 'Booked' && slot.appointment && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {slot.appointment.PatientName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSlotExpansion(slot.SlotID)}
                    className="h-7 px-2 text-xs"
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                  </Button>
                </div>

                {isExpanded && renderAppointmentDetails(slot.appointment)}
              </div>
            )}
          </div>
        </div>
      );
    },
    [
      expandedSlots,
      getConsultantName,
      getDepartmentName,
      renderAppointmentDetails,
      toggleSlotExpansion,
    ]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 ">
        <div>
          <p className="text-muted-foreground">
            Manage and monitor all appointment slots for{' '}
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchData} variant="outline" className="h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/dashboard/appointment/slots/add">
            <Button className="h-9 bg-blue-600 hover:bg-blue-700">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Slot
            </Button>
          </Link>
          <Link href="/dashboard/appointment/slots/range">
            <Button variant="outline" className="h-9">
              <CalendarRange className="mr-2 h-4 w-4" />
              Add Slot Range
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateCalendar('prev')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <h2 className="text-lg font-semibold text-blue-800">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateCalendar('next')}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDates.map((date, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col items-center p-2 h-auto ${
                isSameDay(date, selectedDate)
                  ? 'bg-blue-200 text-blue-800'
                  : isToday(date)
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-blue-100'
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="text-xs font-medium">{format(date, 'EEE')}</span>
              <span className="text-lg font-bold">{format(date, 'd')}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                Booked vs Available
              </span>
              <span className="text-xs font-medium">
                {stats.booked}/{stats.available}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${
                    stats.total > 0 ? (stats.booked / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Appointment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.statusCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(status)}
                    >
                      {status}
                    </Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No appointments</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-500" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Paid
                </Badge>
                <span className="text-sm font-medium">
                  {stats.paymentCounts.paid}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Pending
                </Badge>
                <span className="text-sm font-medium">
                  {stats.paymentCounts.pending}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      stats.paymentCounts.paid + stats.paymentCounts.pending > 0
                        ? (stats.paymentCounts.paid /
                            (stats.paymentCounts.paid +
                              stats.paymentCounts.pending)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-purple-500" />
              Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Morning</span>
                <span className="text-xs font-medium">
                  {timeDistribution.morning} slots
                </span>
              </div>
              <Progress
                value={(timeDistribution.morning / filteredSlots.length) * 100}
                className="h-1.5 bg-yellow-100"
              >
                <div className="h-full bg-yellow-400 rounded-full" />
              </Progress>

              <div className="flex justify-between items-center">
                <span className="text-xs">Afternoon</span>
                <span className="text-xs font-medium">
                  {timeDistribution.afternoon} slots
                </span>
              </div>
              <Progress
                value={
                  (timeDistribution.afternoon / filteredSlots.length) * 100
                }
                className="h-1.5 bg-orange-100"
              >
                <div className="h-full bg-orange-400 rounded-full" />
              </Progress>

              <div className="flex justify-between items-center">
                <span className="text-xs">Evening</span>
                <span className="text-xs font-medium">
                  {timeDistribution.evening} slots
                </span>
              </div>
              <Progress
                value={(timeDistribution.evening / filteredSlots.length) * 100}
                className="h-1.5 bg-purple-100"
              >
                <div className="h-full bg-purple-400 rounded-full" />
              </Progress>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Filters Panel */}
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Patient, MR No, Token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Consultant</label>
                <Select
                  value={selectedConsultant?.toString() || ''}
                  onValueChange={(value) =>
                    setSelectedConsultant(value ? Number.parseInt(value) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Consultants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consultants</SelectItem>
                    {consultants.map((consultant) => (
                      <SelectItem
                        key={consultant.ConsultantID}
                        value={consultant.ConsultantID.toString()}
                      >
                        {consultant.ConsultantName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select
                  value={selectedDepartment?.toString() || ''}
                  onValueChange={(value) =>
                    setSelectedDepartment(value ? Number.parseInt(value) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem
                        key={department.DepartmentID}
                        value={department.DepartmentID.toString()}
                      >
                        {department.Department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">View Mode</label>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Availability Summary */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Availability Summary
              </CardTitle>
              <CardDescription>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Available</span>
                </div>
                <span className="font-medium">{stats.available}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <span className="font-medium">{stats.booked}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Total</span>
                </div>
                <span className="font-medium">{stats.total}</span>
              </div>

              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Consultants</div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {consultants.slice(0, 5).map((consultant) => (
                    <div
                      key={consultant.ConsultantID}
                      className="flex justify-between items-center text-xs"
                    >
                      <span>{consultant.ConsultantName}</span>
                      <Badge variant="outline" className="text-xs">
                        {
                          slots.filter(
                            (s) => s.ConsultantID === consultant.ConsultantID
                          ).length
                        }{' '}
                        slots
                      </Badge>
                    </div>
                  ))}
                  {consultants.length > 5 && (
                    <div className="text-xs text-center text-muted-foreground pt-1">
                      +{consultants.length - 5} more consultants
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slots Panel */}
        <div className="col-span-12 lg:col-span-9">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Appointment Slots
              </CardTitle>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Available
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Slots available for booking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Booked
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Slots already booked</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-32 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-muted-foreground">
                    No slots found for the selected filters
                  </p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {consultants
                    .filter((consultant) =>
                      filteredSlots.some(
                        (slot) => slot.ConsultantID === consultant.ConsultantID
                      )
                    )
                    .map((consultant) => (
                      <div key={consultant.ConsultantID} className="space-y-3">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                          <Users className="h-4 w-4 text-gray-500" />
                          <h3 className="font-medium">
                            {consultant.ConsultantName}
                          </h3>
                          <Badge variant="outline" className="ml-2">
                            {
                              filteredSlots.filter(
                                (slot) =>
                                  slot.ConsultantID === consultant.ConsultantID
                              ).length
                            }{' '}
                            slots
                          </Badge>
                        </div>

                        <div
                          className={
                            viewMode === 'grid'
                              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                              : 'space-y-4'
                          }
                        >
                          {filteredSlots
                            .filter(
                              (slot) =>
                                slot.ConsultantID === consultant.ConsultantID
                            )
                            .map((slot) => renderTimeSlotCard(slot))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSlots.length} of {slots.length} slots
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
