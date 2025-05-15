'use client';
import { useAppointment } from '@/context/appointment-context';
import { format, parse } from 'date-fns';
import { Check, X, Download, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Appointment } from '@/types/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface ConfirmationStepProps {
  onBack: () => void;
}

export default function ConfirmationStep({ onBack }: ConfirmationStepProps) {
  const { state } = useAppointment();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!state.appointmentDetails?.AppointmentID) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching appointment details...');
        console.log('Appointment ID:', state.appointmentDetails?.AppointmentID);
        // Try with AppointmentID first
        let response = await axios.post(`${API_BASE_URL}/appointments/search`, {
          AppointmentID: state.appointmentDetails.AppointmentID,
        });

        // If no results, try with MRNo if available
        if (
          response.data.success &&
          response.data.data.length === 0 &&
          state.patientData?.MRNo
        ) {
          response = await axios.post(`${API_BASE_URL}/appointments/search`, {
            MRNo: state.patientData.MRNo,
          });
        }

        if (response.data.success) {
          if (response.data.data.length > 0) {
            const foundAppointment =
              response.data.data.find(
                (a: Appointment) =>
                  a.AppointmentID === state.appointmentDetails?.AppointmentID
              ) || response.data.data[0];
            setAppointment(foundAppointment);
          } else {
            setError('Appointment not found');
          }
        } else {
          setError(response.data.message || 'Failed to fetch appointment');
        }
      } catch (err) {
        console.error('Appointment search error:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : 'Failed to fetch appointment details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [state.appointmentDetails?.AppointmentID, state.patientData?.MRNo]);

  // Create merged data source with API data taking precedence
  const displayData = {
    ...state.appointmentDetails,
    ...appointment,
    // Ensure critical payment info comes from API
    PaymentStatus: appointment?.PaymentStatus || state.paymentStatus,
    PaymentID: appointment?.PaymentID,
    // Combine doctor info
    ConsultantName: state.selectedDoctor?.ConsultantName,
    // Combine slot info
    SlotTime: state.selectedSlot
      ? state.availableSlots.find((s) => s.SlotID === state.selectedSlot)
          ?.SlotTime
      : 'N/A',
  };

  const isConfirmed = displayData.PaymentStatus === 'Paid';

  const parseAndFormatTime = (timeString: string) => {
    try {
      const parsedTime = parse(timeString, 'HH:mm:ss', new Date());
      return format(parsedTime, 'h:mm a');
    } catch {
      try {
        const parsedTime = parse(timeString, 'HH:mm', new Date());
        return format(parsedTime, 'h:mm a');
      } catch {
        return timeString;
      }
    }
  };

  const calculateAge = (DOB: string) => {
    if (!DOB) return 'N/A';
    const dobDate = new Date(DOB);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }
    return age < 0 ? 'N/A' : age;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const lineHeight = 4;
      let y = 10;

      // Add background watermark
      doc.setFontSize(80);
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'bold');
      doc.text('SJHRC', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.setTextColor(0, 0, 0);

      // Hospital header
      doc.setFontSize(18);
      doc.text('SHREE JAGANNATH HOSPITAL', pageWidth / 2, 14, {
        align: 'center',
      });
      doc.setFontSize(14);
      doc.text('Research Centre (SJHRC)', pageWidth / 2, 20, {
        align: 'center',
      });
      doc.setFontSize(10);
      doc.text(
        `Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi, Jharkhand 834001`,
        pageWidth / 2,
        25,
        { align: 'center' }
      );

      y = 40;

      // Appointment receipt title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('APPOINTMENT RECEIPT', pageWidth / 2, 33, { align: 'center' });
      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 37, pageWidth - margin, 37);
      y += 12;

      // Patient details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`MR Number: ${state.patientData?.MRNo || 'N/A'}`, margin, y);
      doc.text(
        `Appointment ID: ${displayData.AppointmentID || 'N/A'}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Name: ${state.patientData?.PatientName || 'N/A'}`, margin, y);
      doc.text(
        `Mobile: ${state.patientData?.MobileNo || 'N/A'}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(
        `Age/Gender: ${calculateAge(state.patientData?.DOB || '')} / ${
          state.patientData?.Sex || 'N/A'
        }`,
        margin,
        y
      );
      y += lineHeight * 2;

      // Department details
      doc.setFont('helvetica', 'bold');
      doc.text('DEPARTMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Department: ${
          state.departments.find(
            (d) => d.DepartmentID === state.selectedDepartmentId
          )?.Department || 'N/A'
        }`,
        margin,
        y
      );
      doc.text('Token No: ______', pageWidth / 2, y);
      y += lineHeight;
      doc.text(`Doctor: ${displayData.ConsultantName || 'N/A'}`, margin, y);
      y += lineHeight * 2;

      // Payment details
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Invoice Number: ${displayData.AppointmentID || 'N/A'}`,
        margin,
        y
      );
      doc.text(
        `Amount: Rs. ${state.selectedDoctor?.Fee || 'N/A'}/-`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Payment ID: ${displayData.PaymentID || 'N/A'}`, margin, y);
      doc.text(
        `Receipt No: SJHRC${Math.floor(100000 + Math.random() * 900000)}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(
        `Paid On: ${
          displayData.PaymentDate
            ? format(new Date(displayData.PaymentDate), 'MMMM d, yyyy')
            : 'N/A'
        }`,
        margin,
        y
      );
      doc.text(
        `Printed On: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Mode of Payment: ONLINE`, margin, y);
      doc.text(
        `Status: ${displayData.PaymentStatus || 'N/A'}`,
        pageWidth / 2,
        y
      );
      y += lineHeight * 2;

      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 3, pageWidth - margin, y + 3);

      // Important note
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);
      doc.text(
        'Before reporting to MEDICAL RECORDS OFFICER, Please contact IRO (900B) to complete the formalities.',
        pageWidth / 2,
        y,
        { align: 'center', maxWidth: pageWidth - margin * 2 }
      );
      y += lineHeight * 2;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Thank You.', pageWidth / 2, y, { align: 'center' });
      y += lineHeight * 2;

      // General instructions
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('GENERAL INSTRUCTIONS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      const instructions = [
        '1. Keep this payment slip safely. Present a printed copy or show the digital version at the reception on the day of your visit.',
        '2. Arrive at least 15 minutes before your scheduled appointment time for registration and preliminary checks.',
        '3. Bring a valid photo ID (e.g., Aadhaar Card, Driving Licence, Passport) for verification.',
        '4. Carry relevant medical records, prescriptions, and test reports.',
        '5. Appointment fee non-refundable; rescheduling permitted once, 48 hours prior, subject to availability.',
        '6. Late arrivals (10 minutes or more) may result in rescheduling or longer waiting time, depending on the doctor’s schedule.',
        '7. For cashless/insurance cases, bring the necessary approval letters and insurance cards.',
        '8. Contact our helpdesk at +91-8987999200.',
      ];
      instructions.forEach((instruction) => {
        doc.text(instruction, margin, y, { maxWidth: pageWidth - margin * 2 });
        y += lineHeight;
      });

      // Footer
      y += lineHeight;
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(
        'Generated electronically - No signature required',
        pageWidth / 2,
        y,
        { align: 'center' }
      );
      doc.setFontSize(8);
      doc.setTextColor(0, 128, 0);
      doc.text('VERIFIED', pageWidth - margin - 20, y, { align: 'right' });

      doc.save(`appointment_${displayData.AppointmentID || 'receipt'}.pdf`);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate receipt');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <CardTitle className="text-xl font-bold">Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={onBack} className="mt-4 bg-red-600 hover:bg-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="text-xl font-bold">
          Appointment Confirmation
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isConfirmed ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">
                Appointment Confirmed
              </h2>
              <p className="text-green-700 text-center mt-2">
                Your appointment has been successfully booked and payment has
                been processed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Patient Information
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-blue-600">Name:</span>
                    <span className="font-medium">
                      {state.patientData?.PatientName}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">MR Number:</span>
                    <span className="font-medium">
                      {state.patientData?.MRNo || 'New Patient'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">Mobile:</span>
                    <span className="font-medium">
                      {state.patientData?.MobileNo}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">Gender:</span>
                    <span className="font-medium">
                      {state.patientData?.Sex}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Appointment Details
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-blue-600">Appointment ID:</span>
                    <span className="font-medium">
                      {displayData.AppointmentID}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">Doctor:</span>
                    <span className="font-medium">
                      {displayData.ConsultantName}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">Date:</span>
                    <span className="font-medium">
                      {displayData.ConsultationDate &&
                        format(
                          new Date(displayData.ConsultationDate),
                          'MMMM d, yyyy'
                        )}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-blue-600">Time:</span>
                    <span className="font-medium">
                      {displayData.SlotTime &&
                        parseAndFormatTime(displayData.SlotTime)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Payment Information
                </h3>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Paid
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold">
                    ₹ {displayData.AmountPaid || state.selectedDoctor?.Fee || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">
                    {displayData.PaymentID || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span>
                    {displayData.PaymentDate
                      ? format(
                          new Date(displayData.PaymentDate),
                          'MMMM d, yyyy h:mm a'
                        )
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>
                Please arrive 15 minutes before your scheduled appointment time.
              </p>
              <p>
                For any queries, please contact: +91 8987999200 |
                sjhrc.ranchi@gmail.com
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800">Payment Failed</h2>
            <p className="text-red-700 text-center mt-2 max-w-md">
              There was an issue processing your payment. Please try again or
              contact support if the problem persists.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 p-6 flex justify-between">
        {isConfirmed ? (
          <>
            <Button
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Download Receipt <Download className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">
                Back to Home <Home className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={onBack}>
              Try Again <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
