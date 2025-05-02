import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AppointmentDetailsDialogProps {
  selectedAppointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AppointmentDetailsDialog({
  selectedAppointment,
  open,
  onOpenChange,
  onSuccess,
}: AppointmentDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Appointment Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            #{selectedAppointment?.AppointmentID} • {selectedAppointment?.MRNo}
          </DialogDescription>
        </DialogHeader>

        {selectedAppointment && (
          <div className="space-y-3 text-sm">
            {/* Patient Header */}
            <div className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-base sm:text-lg">
                  {selectedAppointment.PatientName}
                </h3>
                <p className="text-gray-500">{selectedAppointment.MobileNo}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={
                    getStatusColor(selectedAppointment.Status) + ' text-xs'
                  }
                >
                  {selectedAppointment.Status}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    getPaymentStatusColor(selectedAppointment.PaymentStatus) +
                    ' text-xs'
                  }
                >
                  {selectedAppointment.PaymentStatus}
                </Badge>
              </div>
            </div>

            {/* Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Doctor Info */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Doctor</h4>
                <p className="font-medium">
                  {selectedAppointment.ConsultantName}
                </p>
                <p className="text-gray-600 text-xs">
                  {selectedAppointment.ProfessionalDegree}
                </p>
              </div>

              {/* Department */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Department</h4>
                <p>{selectedAppointment.DepartmentName}</p>
              </div>

              {/* Date */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Date</h4>
                <p>
                  {format(
                    new Date(selectedAppointment.ConsultationDate),
                    'MMM d, yyyy'
                  )}
                </p>
              </div>

              {/* Time */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Time</h4>
                <p>
                  {selectedAppointment.SlotTime
                    ? formatTime(selectedAppointment.SlotTime)
                    : 'N/A'}
                </p>
              </div>

              {/* Payment */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Amount</h4>
                <p>₹{selectedAppointment.AmountPaid}</p>
              </div>

              {/* Payment Mode */}
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="text-gray-500 font-medium">Payment Mode</h4>
                <p>{selectedAppointment.PaymentMode || 'Online'}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-2 bg-gray-50 rounded-lg space-y-1">
              <h4 className="text-gray-500 font-medium">Payment Details</h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-1">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-xs font-mono truncate">
                    {selectedAppointment.OrderID}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-xs font-mono truncate">
                    {selectedAppointment.PaymentID}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-xs">
                    {format(
                      new Date(selectedAppointment.PaymentDate),
                      'MMM d, h:mm a'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Refund</p>
                  <p className="text-xs">
                    {selectedAppointment.RefundAmount
                      ? `₹${selectedAppointment.RefundAmount}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="p-2 bg-gray-50 rounded-lg">
              <h4 className="text-gray-500 font-medium">Remarks</h4>
              <p className="whitespace-pre-wrap text-sm">
                {selectedAppointment.Remarks || 'No remarks provided'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
