import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { processRefund } from '@/lib/api';
import { toast } from 'sonner';

interface RefundPaymentDialogProps {
  selectedAppointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RefundPaymentDialog({
  selectedAppointment,
  open,
  onOpenChange,
  onSuccess,
}: RefundPaymentDialogProps) {
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      onOpenChange(false);
      setRefundReason('');
      onSuccess();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Refund error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
          <DialogDescription>
            Are you sure you want to refund this payment?
          </DialogDescription>
        </DialogHeader>

        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient</h4>
                  <p>{selectedAppointment.PatientName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p>₹{selectedAppointment.AmountPaid}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Payment ID
                  </h4>
                  <p>{selectedAppointment.PaymentID || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{selectedAppointment.PaymentStatus}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Input
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRefundPayment}
                disabled={isProcessing || !refundReason}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Confirm Refund
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
