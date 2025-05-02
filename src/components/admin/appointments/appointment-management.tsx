'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Search,
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments } from '@/context/useAppointments';
import { AppointmentSearchParams } from '@/types/types';
import {
  processRefund,
  completeAppointment,
  fetchConsultants,
  fetchDepartments,
} from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { ScheduleDialog } from '@/components/admin/appointments/ScheduleDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { CompleteAppointmentDialog } from './CompleteAppointmentDialog';
import { RefundPaymentDialog } from './RefundPaymentDialog';

export default function AppointmentManagement() {
  const {
    data: appointmentsData,
    loading,
    error,
    params,
    updateParams,
    changePage,
    fetchData: refreshAppointments,
  } = useAppointments();

  const [selectedDoctor, setSelectedDoctor] = useState<number | '' | 'all'>('');

  const [selectedDepartment, setSelectedDepartment] = useState<
    number | '' | 'all'
  >('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Apply filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: Partial<AppointmentSearchParams> = {};

      if (selectedDoctor && selectedDoctor !== 'all') {
        filters.ConsultantID = Number(selectedDoctor);
      }

      if (selectedDepartment) {
        filters.DepartmentID = Number(selectedDepartment);
      }

      if (selectedStatus && selectedStatus !== 'all') {
        filters.Status = selectedStatus;
      }

      if (selectedDate) {
        filters.startDate = format(selectedDate, 'yyyy-MM-dd');
        filters.endDate = format(selectedDate, 'yyyy-MM-dd');
      }

      if (searchQuery) {
        if (/^\d+$/.test(searchQuery)) {
          filters.MobileNo = searchQuery;
        } else if (
          searchQuery.startsWith('MR') ||
          searchQuery.startsWith('OL')
        ) {
          filters.MRNo = searchQuery;
        } else {
          filters.PatientName = searchQuery;
        }
      }

      updateParams(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedDoctor,
    selectedDepartment,
    selectedStatus,
    selectedDate,
    searchQuery,
  ]);

  // Fetch initial data (doctors and departments)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsProcessing(true);
      try {
        const [consultants, depts] = await Promise.all([
          fetchConsultants(),
          fetchDepartments(),
        ]);

        setDoctors(consultants);
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setIsProcessing(false);
      }
    };

    fetchInitialData();
  }, []);

  // Status and payment status badge colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-violet-200 text-violet-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (appointmentId: number) => {
    setIsProcessing(true);
    try {
      await completeAppointment(appointmentId, {
        diagnosis,
        prescription,
      });
      toast.success(`Appointment completed successfully`);
      setIsPaymentDialogOpen(false);
      refreshAppointments();
    } catch (error) {
      toast.error(`Failed to update appointment status`);
      console.error('Status update error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefundPayment = async () => {
    if (!selectedAppointment) return;

    if (!refundReason.trim() && selectedAppointment.PaymentStatus === 'Paid') {
      toast.error('Refund reason is required for paid appointments');
      return;
    }

    setIsProcessing(true);
    try {
      await processRefund(
        selectedAppointment.AppointmentID,
        refundReason.trim()
      );
      toast.success('Appointment cancelled and refund initiated');
      setIsRefundDialogOpen(false);
      setRefundReason('');
      refreshAppointments();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Refund error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Clear filters handler
  const handleClearFilters = () => {
    setSelectedDoctor('all');
    setSelectedDepartment('');
    setSelectedStatus('all');
    setSelectedDate(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto">
            <Label htmlFor="doctor" className="mb-1 block">
              Doctor
            </Label>
            <Select
              value={selectedDoctor.toString()}
              onValueChange={(value) =>
                setSelectedDoctor(value === 'all' ? 'all' : Number(value))
              }
            >
              <SelectTrigger id="doctor" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem
                    key={doctor.ConsultantID}
                    value={doctor.ConsultantID.toString()}
                  >
                    {doctor.ConsultantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label htmlFor="department" className="mb-1 block">
              Department
            </Label>
            <Select
              value={selectedDepartment.toString()}
              onValueChange={(value) =>
                setSelectedDepartment(value ? Number(value) : '')
              }
            >
              <SelectTrigger id="department" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem
                    key={dept.DepartmentID}
                    value={dept.DepartmentID.toString()}
                  >
                    {dept.Department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label htmlFor="status" className="mb-1 block">
              Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto">
            <Label htmlFor="date" className="mb-1 block">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] justify-start text-left font-normal"
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'All Dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full sm:w-auto">
            <Label htmlFor="search" className="mb-1 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, MR No, or phone"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Clear Filters Button */}
          <div className="w-full sm:w-auto flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={
                !selectedDoctor &&
                !selectedDepartment &&
                !selectedStatus &&
                !selectedDate &&
                !searchQuery
              }
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Appointments</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAppointments}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="text-red-500 p-4 text-center">{error}</div>
          ) : loading ? (
            <div className="h-96 flex items-center justify-center">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointmentsData?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointmentsData?.data.map((appointment) => (
                        <TableRow key={appointment.AppointmentID}>
                          <TableCell>
                            <div className="font-medium">
                              {appointment.PatientName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {appointment.MRNo} • {appointment.MobileNo}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{appointment.Consultant?.ConsultantName}</div>
                            <div className="text-xs text-gray-500">
                              {appointment.Department?.DepartmentName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {format(
                                new Date(appointment.ConsultationDate),
                                'MMM d, yyyy'
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(appointment.Slot?.SlotTime)}
                            </div>
                          </TableCell>
                          <TableCell>{appointment.AppointmentID}</TableCell>
                          <TableCell>₹{appointment.AmountPaid}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(appointment.Status)}
                            >
                              {appointment.Status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPaymentStatusColor(
                                appointment.PaymentStatus
                              )}
                            >
                              {appointment.PaymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(appointment)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(appointment.Status === 'Confirmed' ||
                                  appointment.Status === 'Scheduled') && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setIsPaymentDialogOpen(true);
                                      }}
                                    >
                                      Mark as Completed
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setIsScheduleDialogOpen(true);
                                      }}
                                    >
                                      Reschedule Appointment
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {appointment.PaymentStatus !== 'Paid' ||
                                  (appointment.Status !== 'Completed' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setIsRefundDialogOpen(true);
                                      }}
                                    >
                                      Refund Payment
                                    </DropdownMenuItem>
                                  ))}
                                {/* <DropdownMenuItem>
                                  Download Receipt
                                </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {appointmentsData.data.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing page {appointmentsData.pagination.page} of{' '}
                    {appointmentsData.pagination.totalPages} •{' '}
                    {appointmentsData.pagination.total} total appointments
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        changePage(appointmentsData.pagination.page - 1)
                      }
                      disabled={
                        !appointmentsData.pagination.hasPrevPage || loading
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        changePage(appointmentsData.pagination.page + 1)
                      }
                      disabled={
                        !appointmentsData.pagination.hasNextPage || loading
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <ScheduleDialog
        appointment={selectedAppointment}
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onSuccess={refreshAppointments}
      />

      {/* Appointment Details Dialog */}

      <AppointmentDetailsDialog
        selectedAppointment={selectedAppointment}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onSuccess={refreshAppointments}
      />

      {/* Complete Dialog */}
      <CompleteAppointmentDialog
        selectedAppointment={selectedAppointment}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={refreshAppointments}
      />

      {/* Refund Dialog */}
      <RefundPaymentDialog
        selectedAppointment={selectedAppointment}
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        onSuccess={refreshAppointments}
      />
    </div>
  );
}
