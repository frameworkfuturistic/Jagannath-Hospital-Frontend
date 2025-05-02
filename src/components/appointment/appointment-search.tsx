'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Loader2,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppointmentDetails from './appointment-details';

// Types
export type Appointment = {
  AppointmentID: number;
  RegistrationNo?: string;
  MRNo: string;
  ConsultantID: number;
  SlotID: number;
  ConsultationDate: string;
  TokenNo?: number;
  PatientName: string;
  MobileNo: string;
  DepartmentID?: number;
  DepartmentName?: string;
  Remarks?: string;
  Status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
  PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  AmountPaid?: number;
  PaymentID?: string;
  OrderID?: string;
  PaymentMode?: string;
  PaymentDate?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Diagnosis?: string;
  Prescription?: string;
  Department?: string;
  ConsultantName?: string;
  SlotTime?: string;
};

type SearchType = 'MobileNo' | 'AppointmentID' | 'MRNo';

export default function AppointmentSearch() {
  // State
  const [searchType, setSearchType] = useState<SearchType>('MobileNo');
  const [searchValue, setSearchValue] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const trimmed = value.trim();

      const isValid =
        (searchType === 'MobileNo' && /^\d{10}$/.test(trimmed)) ||
        (searchType === 'MRNo' && trimmed.length > 0) ||
        (searchType === 'AppointmentID' && /^\d+$/.test(trimmed));

      if (isValid) {
        handleSearch();
      }
    }, 1000),
    [searchType, searchValue] // searchValue not needed in deps
  );

  // Effect for debounced search
  useEffect(() => {
    if (searchValue.length >= 10) {
      setIsSearching(true);
      debouncedSearch(searchValue);
    } else {
      setIsSearching(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchValue, debouncedSearch]);

  // Effect for filtering appointments by status
  useEffect(() => {
    if (appointments.length > 0) {
      if (statusFilter === 'all') {
        setFilteredAppointments(appointments);
      } else {
        setFilteredAppointments(
          appointments.filter(
            (appointment) => appointment.Status.toLowerCase() === statusFilter
          )
        );
      }
    }
  }, [statusFilter, appointments]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/appointments/search`, {
        [searchType]: searchValue.trim(),
      });

      if (response.data.success) {
        const appointmentsData = response.data.data;

        if (Array.isArray(appointmentsData) && appointmentsData.length > 0) {
          setAppointments(appointmentsData);
          setFilteredAppointments(appointmentsData);
          toast.success(`Found ${appointmentsData.length} appointment(s)`);
        } else {
          setAppointments([]);
          setFilteredAppointments([]);
          toast.info(
            'No appointments found. Please check your search criteria.'
          );
        }
      } else {
        setError(response.data.message || 'Failed to fetch appointments');
        toast.error(response.data.message || 'Failed to fetch appointments');
        setAppointments([]);
        setFilteredAppointments([]);
      }
    } catch (error: any) {
      console.error('Error searching appointments:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while searching';
      setError(errorMessage);
      toast.error(errorMessage);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const viewAppointmentDetails = (appointment: Appointment) => {
    try {
      // Simply use the appointment data we already have
      setSelectedAppointment(appointment);
      setIsDetailsOpen(true);
    } catch (error: any) {
      console.error('Error displaying appointment details:', error);
      toast.error('Failed to display appointment details');
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

      // Hospital header
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
      // doc.setFont('helvetica', 'normal');
      doc.text(
        `Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi, Jharkhand 834001`,
        pageWidth / 2,
        25,
        {
          align: 'center',
        }
      );

      y = 40;

      // Appointment receipt title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('APPOINTMENT RECEIPT', pageWidth / 2, 33, {
        align: 'center',
      });
      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 37, pageWidth - margin, 37);
      y += 12;

      // Patient details section
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
      doc.text(`Mobile: ${appointment.MobileNo || 'N/A'}`, pageWidth / 2, y);
      y += lineHeight * 2;

      // Department details section
      doc.setFont('helvetica', 'bold');
      doc.text('DEPARTMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Department: ${appointment.DepartmentName || 'N/A'}`, margin, y);
      doc.text(
        `Token No: ${appointment.TokenNo || '______'}`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Doctor: ${appointment.ConsultantName || 'N/A'}`, margin, y);
      y += lineHeight * 2;

      // Payment details section
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Invoice Number: ${appointment.AppointmentID || 'N/A'}`,
        margin,
        y
      );
      doc.text(
        `Amount: Rs. ${appointment.AmountPaid || 'N/A'}/-`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(`Payment ID: ${appointment.PaymentID || 'N/A'}`, margin, y);
      doc.text(
        `Receipt No: SJHRC${
          Math.floor(100000 + Math.random() * 900000) || 'N/A'
        }`,
        pageWidth / 2,
        y
      );
      y += lineHeight;
      doc.text(
        `Paid On: ${
          appointment.PaymentDate
            ? format(new Date(appointment.PaymentDate), 'dd/MM/yyyy hh:mm a')
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
      doc.text(
        `Mode of Payment: ${appointment.PaymentMode || 'ONLINE'}`,
        margin,
        y
      );
      doc.text(
        `Status: ${appointment.PaymentStatus || 'N/A'}`,
        pageWidth / 2,
        y);
      y += lineHeight * 2;

      doc.setDrawColor(25, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 3, pageWidth - margin, y + 3);

      // Important note and thank you
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

      // General instructions section
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
      doc.setTextColor(0, 128, 0); // Green for verification
      doc.text('VERIFIED', pageWidth - margin - 20, y, { align: 'right' });

      // Save the PDF
      doc.save(`appointment_${appointment.AppointmentID || 'receipt'}.pdf`);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate receipt');
    }
  };

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

  const renderSearchForm = () => (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-800">
          Search Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="searchType" className="text-sm font-medium">
                Search By
              </Label>
              <Select
                value={searchType}
                onValueChange={(value: SearchType) => {
                  setSearchType(value);
                  setSearchValue(''); // Reset search value when type changes
                }}
              >
                <SelectTrigger id="searchType" className="w-full mt-1">
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MobileNo">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Mobile Number
                    </div>
                  </SelectItem>
                  <SelectItem value="AppointmentID">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Appointment ID
                    </div>
                  </SelectItem>
                  <SelectItem value="MRNo">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      MR Number
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="searchValue" className="text-sm font-medium">
                {searchType === 'MobileNo'
                  ? 'Mobile Number'
                  : searchType === 'MRNo'
                  ? 'MR Number'
                  : 'Appointment ID'}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="searchValue"
                  type={searchType === 'AppointmentID' ? 'number' : 'text'}
                  placeholder={`Enter ${
                    searchType === 'MobileNo'
                      ? 'mobile number'
                      : searchType === 'MRNo'
                      ? 'MR number'
                      : 'appointment ID'
                  }`}
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    debouncedSearch(value);
                  }}
                  maxLength={searchType === 'MobileNo' ? 10 : undefined}
                  className="pr-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {searchType === 'MobileNo'
                  ? 'Enter 10 digit mobile number'
                  : searchType === 'MRNo'
                  ? 'Enter MR number (e.g., OL04241747)'
                  : 'Enter numeric appointment ID'}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isLoading || searchValue.length < 0}
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
  );

  const renderSearchResults = () => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-[300px] w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {appointments.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl text-blue-800">
                  Search Results
                </CardTitle>
                <Tabs
                  defaultValue="all"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Payment
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            No appointments match the selected filter
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.AppointmentID}>
                            <TableCell className="font-medium">
                              {appointment.AppointmentID}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {appointment.PatientName}
                                </div>
                                <div className="text-sm text-gray-500 flex flex-col md:hidden">
                                  <span>
                                    {format(
                                      new Date(appointment.ConsultationDate),
                                      'dd/MM/yyyy'
                                    )}
                                  </span>
                                  <Badge
                                    className={`mt-1 ${getStatusBadgeColor(
                                      appointment.Status
                                    )}`}
                                  >
                                    {appointment.Status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.MRNo}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(
                                new Date(appointment.ConsultationDate),
                                'dd/MM/yyyy'
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                className={getStatusBadgeColor(
                                  appointment.Status
                                )}
                              >
                                {appointment.Status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                className={getPaymentStatusBadgeColor(
                                  appointment.PaymentStatus
                                )}
                              >
                                {appointment.PaymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    viewAppointmentDetails(appointment)
                                  }
                                  className="h-8 px-2 text-blue-600"
                                >
                                  <Eye className="h-4 w-4 md:mr-1" />
                                  <span className="hidden md:inline">View</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadReceipt(appointment)}
                                  className="h-8 px-2 text-green-600"
                                >
                                  <Download className="h-4 w-4 md:mr-1" />
                                  <span className="hidden md:inline">
                                    Receipt
                                  </span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-6 py-3">
              <div className="text-sm text-gray-500">
                Showing {filteredAppointments.length} of {appointments.length}{' '}
                appointment(s)
              </div>
              {/* {appointments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csvContent = [
                      [
                        'ID',
                        'Patient Name',
                        'MR Number',
                        'Mobile',
                        'Date',
                        'Status',
                        'Payment Status',
                      ].join(','),
                      ...appointments.map((a) =>
                        [
                          a.AppointmentID,
                          a.PatientName,
                          a.MRNo,
                          a.MobileNo,
                          format(new Date(a.ConsultationDate), 'dd/MM/yyyy'),
                          a.Status,
                          a.PaymentStatus,
                        ].join(',')
                      ),
                    ].join('\n');

                    const blob = new Blob([csvContent], {
                      type: 'text/csv;charset=utf-8;',
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute(
                      'download',
                      `appointments_${format(new Date(), 'yyyy-MM-dd')}.csv`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast.success('Appointments exported to CSV');
                  }}
                  className="text-blue-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              )} */}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="space-y-6">
        {renderSearchForm()}
        {renderSearchResults()}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-800">
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onClose={() => setIsDetailsOpen(false)}
              onDownloadReceipt={() => downloadReceipt(selectedAppointment)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
