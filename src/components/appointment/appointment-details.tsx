'use client';

import { format } from 'date-fns';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Appointment } from './appointment-search';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onDownloadReceipt: () => void;
}

export default function AppointmentDetails({
  appointment,
  onClose,
  onDownloadReceipt,
}: AppointmentDetailsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'confirmed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-green-600 hover:bg-green-700';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'no show':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-600 hover:bg-green-700';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600';
      case 'refunded':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  return (
    <div className="space-y-6">
      {/* Header with Appointment ID and Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-lg font-semibold text-gray-800">
          Appointment #{appointment.AppointmentID}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusBadgeColor(appointment.Status)}>
            {appointment.Status}
          </Badge>
          <Badge
            className={getPaymentStatusBadgeColor(appointment.PaymentStatus)}
          >
            {appointment.PaymentStatus}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Patient Information */}
      <div>
        <h3 className="text-md font-semibold mb-3">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-medium">{appointment.PatientName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">MR Number</p>
            <p className="font-medium">{appointment.MRNo}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Mobile Number</p>
            <p className="font-medium">{appointment.MobileNo}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="font-medium">{appointment.RegistrationNo || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Appointment Details */}
      <div>
        <h3 className="text-md font-semibold mb-3">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Consultation Date</p>
            <p className="font-medium">
              {format(new Date(appointment.ConsultationDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Token Number</p>
            <p className="font-medium">
              {appointment.TokenNo || 'Not Assigned'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{appointment.DepartmentName || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Consultant</p>
            <p className="font-medium">{appointment.ConsultantName || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Slot Time</p>
            <p className="font-medium">{appointment.SlotTime || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {appointment.Remarks && (
        <>
          <Separator />
          <div>
            <h3 className="text-md font-semibold mb-2">Remarks</h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-gray-700">{appointment.Remarks}</p>
            </div>
          </div>
        </>
      )}

      {/* Medical Information - Only show if available */}
      {(appointment.Diagnosis || appointment.Prescription) && (
        <>
          <Separator />
          <div>
            <h3 className="text-md font-semibold mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 gap-4">
              {appointment.Diagnosis && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Diagnosis</p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{appointment.Diagnosis}</p>
                  </div>
                </div>
              )}
              {appointment.Prescription && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Prescription</p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {appointment.Prescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Payment Information */}
      <Separator />
      <div>
        <h3 className="text-md font-semibold mb-3">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Amount Paid</p>
            <p className="font-medium">₹{appointment.AmountPaid || '0.00'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Payment Mode</p>
            <p className="font-medium">{appointment.PaymentMode || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Payment ID</p>
            <p className="font-medium">{appointment.PaymentID || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{appointment.OrderID || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="font-medium">
              {appointment.PaymentDate
                ? format(
                    new Date(appointment.PaymentDate),
                    'MMMM d, yyyy h:mm a'
                  )
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <Separator />
      <div>
        <h3 className="text-md font-semibold mb-3">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">
              {format(new Date(appointment.CreatedAt), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          {appointment.UpdatedAt && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">
                {format(new Date(appointment.UpdatedAt), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {/* <Button
          variant="outline"
          onClick={handlePrint}
          className="text-blue-600"
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button> */}
        <Button
          onClick={onDownloadReceipt}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" /> Download Receipt
        </Button>
      </div>
    </div>
  );
}
