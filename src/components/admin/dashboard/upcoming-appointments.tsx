// eslint-disable-next-line
// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useAppointments } from '@/context/useAppointments';

export default function UpcomingPaidAppointmentsPage() {
  const {
    data: appointmentsData,
    loading,
    error,
    params,
    updateParams,
    changePage,
  } = useAppointments();

  // Set default filter to today and beyond, paid and confirmed statuses
  useEffect(() => {
    const today = new Date();
    updateParams({
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: '',
      Status: ['Confirmed', 'Scheduled'],
      PaymentStatus: 'Paid',
      sort: 'ConsultationDate:desc,Slot.SlotTime:desc', // Changed to descending order (latest first)
      page: 1,
      pageSize: 10,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-violet-200 text-violet-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Calculate starting number for the current page
  const getStartingNumber = () => {
    if (!appointmentsData?.pagination) return 1;
    return (
      (appointmentsData.pagination.page - 1) *
        appointmentsData.pagination.pageSize +
      1
    );
  };

  const sortAppointmentsByDate = (appointments) => {
    if (!appointments || !Array.isArray(appointments)) return [];

    // Use memoization to avoid recalculating dates
    const dateCache = new Map();

    const getDateValue = (dateString) => {
      if (dateCache.has(dateString)) return dateCache.get(dateString);
      const value = new Date(dateString).getTime();
      dateCache.set(dateString, value);
      return value;
    };

    return [...appointments].sort((a, b) => {
      const dateA = getDateValue(a.ConsultationDate);
      const dateB = getDateValue(b.ConsultationDate);

      // First sort by date in descending order (latest first)
      if (dateA !== dateB) {
        return dateB - dateA; // Reversed order
      }

      // If same date, sort by time in descending order
      const timeA = a.Slot?.SlotTime || '';
      const timeB = b.Slot?.SlotTime || '';
      return timeB.localeCompare(timeA); // Reversed order
    });
  };

  const groupAppointmentsByDate = (appointments) => {
    if (!appointments || !Array.isArray(appointments)) return {};

    const groups = {};
    const sortedAppointments = sortAppointmentsByDate(appointments);

    // Group appointments by date
    sortedAppointments.forEach((appointment) => {
      const dateKey = format(
        new Date(appointment.ConsultationDate),
        'yyyy-MM-dd'
      );
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    });

    return groups;
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
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
                {appointmentsData?.data.length === 0 ? (
                  <div className="text-center py-8">
                    No upcoming paid and confirmed appointments found
                  </div>
                ) : (
                  Object.entries(
                    groupAppointmentsByDate(appointmentsData?.data)
                  )
                    .sort(
                      ([dateKeyA], [dateKeyB]) =>
                        new Date(dateKeyB).getTime() -
                        new Date(dateKeyA).getTime()
                    ) // Sort dates in descending order
                    .map(([dateKey, appointments]) => (
                      <div key={dateKey} className="mb-6">
                        <div className="bg-muted px-4 py-2 font-medium sticky top-0">
                          {isToday(dateKey) ? 'Today - ' : ''}
                          {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              <TableHead>Patient</TableHead>
                              <TableHead>Doctor</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointments.map((appointment, index) => (
                              <TableRow key={appointment.AppointmentID}>
                                <TableCell className="font-medium">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {appointment.PatientName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {appointment.MRNo} • {appointment.MobileNo}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    {appointment.Consultant?.ConsultantName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {appointment.Department?.DepartmentName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {formatTime(appointment.Slot?.SlotTime)}
                                  </div>
                                </TableCell>
                                <TableCell>₹{appointment.AmountPaid}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(
                                      appointment.Status
                                    )}
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))
                )}
              </div>

              {/* Pagination */}
              {appointmentsData?.data.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {getStartingNumber()} to{' '}
                    {getStartingNumber() + appointmentsData.data.length - 1} of{' '}
                    {appointmentsData.pagination.total} appointments
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        changePage(appointmentsData.pagination.page - 1)
                      }
                      disabled={!appointmentsData.pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        changePage(appointmentsData.pagination.page + 1)
                      }
                      disabled={!appointmentsData.pagination.hasNextPage}
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
    </div>
  );
}
