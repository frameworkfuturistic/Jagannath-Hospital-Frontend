'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, SearchCheck, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

type Appointment = {
  OPDOnlineAppointmentID: number;
  ConsultantID: number;
  MRNo: string;
  PatientName: string;
  MobileNo: string;
  ConsultationDate: string;
  SlotID: number;
  SlotToken: string;
  Status: string;
  ConsultantName?: string;
  SlotTime?: string;
  Department?: string;
  Fee?: number;
  TransactionID?: string;
  PaymentMode?: string;
  Gender?: string;
  Age?: string;
  Pending?: boolean;
  Remarks?: string;
  CreatedOn: string;
  created_at: string;
  modified_at?: string;
};

export default function FindAppointment() {
  const [searchType, setSearchType] = useState<
    'MobileNo' | 'OPDOnlineAppointmentID' | 'MRNo'
  >('MobileNo');
  const [searchValue, setSearchValue] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const API_BASE_URL = 'https://sjhrc.in/backend/api/v1';

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, {
        [searchType]: searchValue.trim(),
      });

      if (
        response.data.appointments &&
        Array.isArray(response.data.appointments)
      ) {
        setAppointments(response.data.appointments);

        if (response.data.appointments.length === 0) {
          toast.info(
            'No appointments found. Please check your search criteria.'
          );
        }
      } else {
        setAppointments([]);
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error searching appointments:', error);
      toast.error('An error occurred while searching for appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (pending: boolean) => {
    return pending ? 'bg-yellow-500' : 'bg-green-600';
  };

  const viewAppointmentDetails = async (appointment: Appointment) => {
    try {
      setIsLoading(true);

      // Send appointment ID or relevant data to fetch more detailed info
      const response = await axios.post(`${API_BASE_URL}/search/`, {
        appointmentId: appointment.OPDOnlineAppointmentID, // or use a different unique field if needed
      });

      // Merge only if response is valid and contains appointment data
      const detailedData = response?.data?.appointment || {};
      setSelectedAppointment({
        ...appointment,
        ...detailedData,
      });

      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');

      // Show fallback basic data
      setSelectedAppointment(appointment);
      setIsDetailsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReceipt = (appointment: Appointment) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const lineHeight = 4;
      let y = 10;

      // Add background watermark "SJHC" for verified receipt
      doc.setFontSize(80);
      doc.setTextColor(200, 200, 200); // Light gray for watermark effect
      doc.setFont('helvetica', 'bold');
      doc.text('SJHC', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.setTextColor(0, 0, 0); // Reset text color

      // Larger hospital header with blue gradient background
      // doc.rect(0, 0, pageWidth, 35, 'F');

      doc.addImage('/icon.png', 'PNG', margin, 5, 25, 25);

      doc.addImage(
        '/hospital/nabhlogo.png',
        'PNG',
        pageWidth - margin - 25,
        5,
        25,
        25
      );

      // Hospital name and details (centered with larger font)

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SHREE JAGANNATH HOSPITAL', pageWidth / 2, 14, {
        align: 'center',
      });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Research Centre (SJHRC)`, pageWidth / 2, 20, {
        align: 'center',
      });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'semibold');
      doc.text(
        `Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi, Jharkhand 834001`,
        pageWidth / 2,
        25,
        {
          align: 'center',
        }
      );

      y = 40;

      // Web Appointment title with decorative underline
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'semibold');
      doc.text('APPOINTMENT RECEIPT', pageWidth / 2, 33, {
        align: 'center',
      });
      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 37, pageWidth - margin, 37);
      y += 12;

      // QR Code placeholder (replace with actual image path)
      // doc.addImage('/icon.png', 'PNG', pageWidth - 30, y - 5, 20, 20);
      // doc.setFontSize(6);
      // doc.setTextColor(100, 100, 100);
      // doc.text('SCAN HERE TO VERIFY', pageWidth - 25, y + 5);
      // y += 15;

      // Patient details section with smaller fonts
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`MR Number: ${appointment.MRNo || 'N/A'}`, margin, y);
      doc.text(
        `Appointment Date: ${format(
          new Date(appointment.ConsultationDate),
          'dd/MM/yyyy'
        )}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Name: ${appointment.PatientName || 'N/A'}`, margin, y);
      doc.text(`Gender: ${appointment?.Gender || 'N/A'}`, pageWidth / 2, y);
      y += lineHeight;
      doc.text(`Age: ${appointment?.Age || 'N/A'}`, margin, y);
      doc.text(
        `Report to MRO at: ${appointment.SlotTime || 'N/A'}`,
        pageWidth / 2,
        y
      );
      y += lineHeight * 2;

      // Clinic details section with smaller fonts
      doc.setFont('helvetica', 'bold');
      doc.text('DEPARTMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Department: ${appointment.Department || 'N/A'}`, margin, y);
      doc.text(`Token No: ______`, pageWidth / 2, y);
      y += lineHeight;
      doc.text(`Room No: ______`, pageWidth / 2, y);
      y += lineHeight;
      doc.text(`Doctor: ${appointment.ConsultantName || 'N/A'}`, margin, y);
      y += lineHeight * 2;

      // Payment details section with smaller fonts
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Invoice Number: ${appointment.OPDOnlineAppointmentID || 'N/A'}`,
        margin,
        y
      );
      doc.text(`Amount: Rs. ${appointment.Fee || 'N/A'}/-`, pageWidth / 2, y);
      y += lineHeight;
      doc.text(`Bill No: ${appointment.TransactionID || 'N/A'}`, margin, y);
      doc.text(
        `Receipt No: SJHRC${
          Math.floor(100000 + Math.random() * 900000) || 'N/A'
        }`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(
        `Paid On: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`,
        margin,
        y
      );
      doc.text(
        `Printed On: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(
        `Mode of Payment: ${appointment.PaymentMode || 'ONLINE'}`,
        margin,
        y
      );
      y += lineHeight * 2;

      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 3, pageWidth - margin, y + 3);

      // Important note and thank you with enhanced styling
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

      // General instructions section with smaller fonts
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('GENERAL INSTRUCTIONS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      const instructions = [
        '1. If the patient requires in-patient admission a female attendant is mandatory.',
        '2. Appointment booked online will Not be refunded.',
        '3. Change Of Department/Unit Not allowed.',
        '4. Change In appointment Date will be allowed only once, upto one day prior To the appointment Date.',
        '5. Please provide atleast Government Related ID proof When you present yourself at the Entrance / MRO counter.',
        '6. Please contact Counter No: 2, 3, 4 (General) OR 402 (Private) in ISSCC Building Ground Floor to collect your Hospital Number Card.',
        '7. Request For appointments via post / phone will Not be accepted.',
        '8. Demand Drafts will only be accepted at cash counters, Not via post.',
      ];
      instructions.forEach((instruction) => {
        doc.text(instruction, margin, y, { maxWidth: pageWidth - margin * 2 });
        y += lineHeight;
      });

      // Footer with verification badge
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
      doc.setTextColor(0, 128, 0); // Green for verification
      doc.text('VERIFIED', pageWidth - margin - 20, y, { align: 'right' });

      // Save the PDF
      doc.save(
        `appointment_${appointment.OPDOnlineAppointmentID || 'receipt'}.pdf`
      );
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate receipt');
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <SearchCheck className="mr-2 h-4 w-4" /> Find Appointment
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800">
              Find Your Appointment
            </DialogTitle>
            <DialogDescription>
              Search for your appointments using Mobile Number, Appointment ID,
              or MR Number
            </DialogDescription>
          </DialogHeader>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="searchType" className="text-sm font-medium">
                      Search By
                    </Label>
                    <Select
                      value={searchType}
                      onValueChange={(
                        value: 'MobileNo' | 'OPDOnlineAppointmentID' | 'MRNo'
                      ) => setSearchType(value)}
                    >
                      <SelectTrigger id="searchType" className="w-full mt-1">
                        <SelectValue placeholder="Select search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MobileNo">Mobile Number</SelectItem>
                        <SelectItem value="OPDOnlineAppointmentID">
                          Appointment ID
                        </SelectItem>
                        <SelectItem value="MRNo">MR Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2]">
                    <Label
                      htmlFor="searchValue"
                      className="text-sm font-medium"
                    >
                      {searchType === 'MobileNo'
                        ? 'Mobile Number'
                        : searchType === 'MRNo'
                        ? 'MR Number'
                        : 'Appointment ID'}
                    </Label>
                    <Input
                      id="searchValue"
                      type={
                        searchType === 'OPDOnlineAppointmentID'
                          ? 'number'
                          : 'text'
                      }
                      placeholder={`Enter ${
                        searchType === 'MobileNo'
                          ? 'mobile number'
                          : searchType === 'MRNo'
                          ? 'MR number'
                          : 'appointment ID'
                      }`}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="mt-1"
                      maxLength={searchType === 'MobileNo' ? 10 : undefined}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Appointments
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <AnimatePresence>
            {appointments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mt-4 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.OPDOnlineAppointmentID}>
                              <TableCell className="font-medium">
                                {appointment.OPDOnlineAppointmentID}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {appointment.PatientName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {appointment.MRNo}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  appointment.ConsultationDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-white text-xs ${getStatusColor(
                                    appointment.Pending
                                  )}`}
                                >
                                  {appointment.Pending
                                    ? 'Pending'
                                    : 'Completed'}
                                </span>
                              </TableCell>

                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      viewAppointmentDetails(appointment)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadReceipt(appointment)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center text-sm text-gray-500 p-4">
                    Showing {appointments.length} appointment(s)
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-800">
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              {/* Header with Appointment ID */}
              <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                <span>
                  AppointmentID: #{selectedAppointment.OPDOnlineAppointmentID}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                    selectedAppointment.Pending
                  )} text-white`}
                >
                  {selectedAppointment.Pending ? 'Pending' : 'Completed'}
                </span>
              </div>

              {/* Patient and Appointment Details */}
              <div className="grid grid-cols-2 gap-6 border-b pb-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">👤 Patient Name</p>
                  <p className="font-medium text-gray-700">
                    {selectedAppointment.PatientName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">🆔 MR Number</p>
                  <p className="font-medium text-gray-700">
                    {selectedAppointment.MRNo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">📅 Consultation Date</p>
                  <p className="font-medium text-gray-700">
                    {format(
                      new Date(selectedAppointment.ConsultationDate),
                      'MMMM d, yyyy'
                    )}
                  </p>
                </div>
                {selectedAppointment.SlotTime && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">⏰ Time Slot</p>
                    <p className="font-medium text-gray-700">
                      {selectedAppointment.SlotTime}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">🔢 Token</p>
                  <p className="font-medium text-gray-700">
                    {selectedAppointment.SlotToken || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {selectedAppointment.Remarks && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">📝 Remarks</h4>
                  <p className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm text-gray-700">
                    {selectedAppointment.Remarks}
                  </p>
                </div>
              )}

              {/* Doctor & Department Details */}
              <div className="grid grid-cols-2 gap-6 border-b pb-4">
                {selectedAppointment.ConsultantName && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-gray-500">🧑‍⚕️ Doctor</p>
                    <p className="font-medium text-gray-700">
                      {selectedAppointment.ConsultantName}
                    </p>
                  </div>
                )}
                {selectedAppointment.Department && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-gray-500">🏥 Department</p>
                    <p className="font-medium text-gray-700">
                      {selectedAppointment.Department}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {(selectedAppointment.Fee ||
                selectedAppointment.TransactionID) && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-700">
                    💳 Payment Info
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAppointment.Fee && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-gray-700">
                          ₹ {selectedAppointment.Fee}
                        </p>
                      </div>
                    )}
                    {selectedAppointment.TransactionID && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-medium text-gray-700">
                          {selectedAppointment.TransactionID}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Time Info */}
              <div className="grid grid-cols-2 gap-6 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">📥 Created On</p>
                  <p className="font-medium text-gray-700">
                    {format(
                      new Date(
                        selectedAppointment.created_at ||
                          selectedAppointment.CreatedOn
                      ),
                      'PPpp'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">✏️ Modified On</p>
                  <p className="font-medium text-gray-700">
                    {selectedAppointment.modified_at
                      ? format(
                          new Date(selectedAppointment.modified_at),
                          'PPpp'
                        )
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => downloadReceipt(selectedAppointment)}>
                  <Download className="mr-2 h-4 w-4" /> Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
