// eslint-disable-next-line
// @ts-nocheck

'use client';

import { useAppointment } from '@/context/appointment-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const { state, bookAppointment, processPayment } = useAppointment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Validate required data
      if (!state.selectedDoctor?.Fee) {
        throw new Error('Doctor fee information is missing');
      }

      // Book appointment or use existing one
      let appointmentId = state.appointmentDetails?.AppointmentID;
      if (!appointmentId) {
        appointmentId = await bookAppointment();
        if (!appointmentId) {
          throw new Error('Failed to get appointment ID');
        }
      }

      // Process payment
      await processPayment(appointmentId);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Payment processing failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment success
  useEffect(() => {
    if (state.paymentStatus === 'success') {
      onNext();
    }
  }, [state.paymentStatus, onNext]);

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const selectedSlot = state.availableSlots.find(
    (slot) => slot.SlotID === state.selectedSlot
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl">Payment Details</CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Appointment Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Patient Name</p>
              <p className="font-medium">{state.patientData?.PatientName}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">MR Number</p>
              <p className="font-medium">
                {state.patientData?.MRNo || 'New Patient'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Appointment Date</p>
              <p className="font-medium">
                {state.selectedDate &&
                  format(new Date(state.selectedDate), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Appointment Time</p>
              <p className="font-medium">
                {selectedSlot?.SlotTime && formatTime(selectedSlot.SlotTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Doctor</p>
              <p className="font-medium">
                {state.selectedDoctor?.ConsultantName}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Department</p>
              <p className="font-medium">
                {
                  state.departments.find(
                    (d) => d.DepartmentID === state.selectedDepartmentId
                  )?.Department
                }
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-800">
                Consultation Fee:
              </span>
              <span className="text-2xl font-bold text-blue-900">
                ₹{state.selectedDoctor?.Fee || '0.00'}
              </span>
            </div>
          </div>
        </div>

        <Alert>
          <AlertTitle>Secure Payment</AlertTitle>
          <AlertDescription>
            You will be redirected to our secure payment gateway to complete
            your transaction. Your appointment will be confirmed immediately
            after successful payment.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button
          onClick={handlePayment}
          disabled={isProcessing || state.isProcessingPayment}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing || state.isProcessingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
