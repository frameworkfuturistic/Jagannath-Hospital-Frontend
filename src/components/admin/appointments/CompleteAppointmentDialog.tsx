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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { completeAppointment } from '@/lib/api';
import { toast } from 'sonner';

interface CompleteAppointmentDialogProps {
  selectedAppointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CompleteAppointmentDialog({
  selectedAppointment,
  open,
  onOpenChange,
  onSuccess,
}: CompleteAppointmentDialogProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    try {
      await completeAppointment(selectedAppointment.AppointmentID, {
        diagnosis,
        prescription,
      });
      toast.success('Appointment completed successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to update appointment status');
      console.error('Status update error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Appointment</DialogTitle>
          <DialogDescription>
            Mark this appointment as completed and provide treatment details
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
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter prescription details"
                rows={5}
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
                className="text-primary-foreground bg-green-600 shadow hover:bg-green-600/90"
                onClick={handleStatusUpdate}
                disabled={isProcessing || !diagnosis.trim()}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Completed
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
