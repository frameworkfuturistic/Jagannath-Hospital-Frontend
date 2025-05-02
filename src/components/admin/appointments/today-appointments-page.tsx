'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import {
  Search,
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments } from '@/context/useAppointments';
import { completeAppointment, processRefund } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { ScheduleDialog } from '@/components/admin/appointments/ScheduleDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { CompleteAppointmentDialog } from './CompleteAppointmentDialog';
import { RefundPaymentDialog } from './RefundPaymentDialog';


export default function TodayAppointmentsPage() {
  const {
    data: appointmentsData,
    loading,
    error,
    params,
    updateParams,
    changePage,
    fetchData: refreshAppointments,
  } = useAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Set default filter to today's date
  useEffect(() => {
    const today = new Date();
    updateParams({
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    });
  }, []);

  // Apply filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: any = {};

      if (selectedStatus && selectedStatus !== 'all') {
        filters.Status = selectedStatus;
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

      // Always filter by today's date
      const today = new Date();
      filters.startDate = format(today, 'yyyy-MM-dd');
      filters.endDate = format(today, 'yyyy-MM-dd');

      updateParams(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus]);

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

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label htmlFor="search" className="mb-1 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search appointments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Today's Appointments - {format(new Date(), 'MMMM d, yyyy')}
          </CardTitle>
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
