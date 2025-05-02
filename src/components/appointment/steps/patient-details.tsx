'use client';

import { useState } from 'react';
import { useAppointment } from '@/context/appointment-context';
import { useForm, Controller } from 'react-hook-form';
import { format, subYears } from 'date-fns';
import {
  ChevronRight,
  ChevronLeft,
  CalendarIcon,
  Search,
  Edit,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { PatientData } from '@/types/types';

interface PatientDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PatientDetails({
  onNext,
  onBack,
}: PatientDetailsProps) {
  const {
    state,
    searchExistingPatient,
    setPatientData,
    createPatient,
    setExistingPatient,
  } = useAppointment();

  const [isEditMode, setIsEditMode] = useState(false);
  const [searchResults, setSearchResults] = useState<PatientData[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{
    searchMrdOrMobile: string;
    patientName: string;
    mobileNo: string;
    gender: string;
    DOB: string;
    reason: string;
  }>();

  const years = Array.from(
    { length: 121 },
    (_, i) => new Date().getFullYear() - i
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleSearch = async () => {
    const searchValue = watch('searchMrdOrMobile');
    if (!searchValue) {
      toast.error('Please enter MRD or mobile number to search');
      return;
    }

    try {
      const results = await searchExistingPatient(searchValue);
      setSearchResults(results);

      if (results.length === 0) {
        toast.info('No existing patient found with the provided details');
      }
    } catch (error) {
      toast.error('Error searching for patient');
    }
  };

  const autoFillPatientData = (patient: PatientData) => {
    if (patient) {
      setValue('patientName', patient.PatientName || '');
      setValue('mobileNo', patient.MobileNo || '');
      setValue('gender', patient.Sex || '');
      setValue('DOB', patient.DOB || '');

      setPatientData(patient);
      setExistingPatient(true);

      toast.success('Patient details have been auto-filled');
    }
  };

  const onSubmit = async (data: {
    patientName: string;
    mobileNo: string;
    gender: string;
    DOB: string;
    reason: string;
  }) => {
    try {
      if (!state.existingPatient) {
        // Create new patient
        const patient = await createPatient({
          PatientName: data.patientName,
          Sex: data.gender,
          MobileNo: data.mobileNo,
          DOB: data.DOB,
        });

        setPatientData({
          ...patient,
          reason: data.reason,
        });
      } else {
        // Update existing patient data
        setPatientData({
          ...state.patientData,
          PatientName: data.patientName,
          Sex: data.gender,
          MobileNo: data.mobileNo,
          DOB: data.DOB,
          reason: data.reason,
        });
      }

      onNext();
    } catch (error) {
      toast.error('Error saving patient details');
    }
  };

  return (
    <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="text-xl font-bold">Patient Details</CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label
                htmlFor="searchMrdOrMobile"
                className="text-sm font-medium mb-1 block"
              >
                Search Existing Patient
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="searchMrdOrMobile"
                  placeholder="Enter MRD or Mobile Number"
                  {...register('searchMrdOrMobile')}
                  className="flex-1"
                />
                <Button onClick={handleSearch} type="button">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Found {searchResults.length} patient(s):
              </h3>
              <div className="grid gap-2">
                {searchResults.map((patient) => (
                  <Button
                    key={patient.MRNo || patient.MobileNo}
                    variant="outline"
                    className="justify-start h-auto py-2 text-left"
                    onClick={() => autoFillPatientData(patient)}
                  >
                    <div>
                      <div className="font-medium">{patient.PatientName}</div>
                      <div className="text-sm text-gray-500">
                        {patient.MRNo && `MR No: ${patient.MRNo}`}
                        {patient.MRNo && patient.MobileNo && ' | '}
                        {patient.MobileNo && `Mobile: ${patient.MobileNo}`}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {state.existingPatient && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                Existing Patient
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Patient details have been auto-filled. Please review and update
                if necessary.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="patientName" className="text-lg font-semibold">
              Patient Name
            </Label>
            <Input
              id="patientName"
              {...register('patientName', {
                required: 'Patient name is required',
              })}
              className="text-lg"
              defaultValue={state.patientData?.PatientName || ''}
              disabled={state.existingPatient && !isEditMode}
            />
            {errors.patientName && (
              <p className="text-red-500 text-sm">
                {errors.patientName.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNo" className="text-lg font-semibold">
              Mobile Number
            </Label>
            <Input
              id="mobileNo"
              {...register('mobileNo', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid mobile number',
                },
              })}
              className="text-lg"
              defaultValue={state.patientData?.MobileNo || ''}
              disabled={state.existingPatient && !isEditMode}
            />
            {errors.mobileNo && (
              <p className="text-red-500 text-sm">
                {errors.mobileNo.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="DOB">Date of Birth</Label>
            <Controller
              name="DOB"
              control={control}
              rules={{ required: 'Date of Birth is required' }}
              defaultValue={state.patientData?.DOB || ''}
              render={({ field }) => (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !field.value && 'text-muted-foreground'
                      }`}
                      onClick={() => setIsCalendarOpen(true)}
                      disabled={state.existingPatient && !isEditMode}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'MMMM d, yyyy')
                      ) : (
                        <span>Select date of birth</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="space-y-4 p-3">
                      <div className="flex justify-between space-x-2">
                        <Select
                          value={month.toString()}
                          onValueChange={(value) =>
                            setMonth(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m, index) => (
                              <SelectItem key={m} value={index.toString()}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={year.toString()}
                          onValueChange={(value) =>
                            setYear(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y.toString()}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, 'yyyy-MM-dd');
                            field.onChange(formattedDate);
                          } else {
                            field.onChange(null);
                          }
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < subYears(new Date(), 120)
                        }
                        initialFocus
                        month={new Date(year, month)}
                        onMonthChange={(newMonth) => {
                          setMonth(newMonth.getMonth());
                          setYear(newMonth.getFullYear());
                        }}
                        className="rounded-md border shadow"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.DOB && (
              <p className="text-red-500 text-sm">
                {errors.DOB.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-lg font-semibold">
              Gender
            </Label>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              defaultValue={state.patientData?.Sex || ''}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                  disabled={state.existingPatient && !isEditMode}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm">
                {errors.gender.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="reason" className="text-lg font-semibold">
              Reason for Visit
            </Label>
            <Textarea
              id="reason"
              {...register('reason', {
                required: 'Reason for visit is required',
              })}
              className="text-lg min-h-[100px]"
              defaultValue={state.patientData?.reason || ''}
            />
            {errors.reason && (
              <p className="text-red-500 text-sm">
                {errors.reason.message as string}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 p-6 flex justify-between">
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {state.existingPatient && (
            <Button
              variant="outline"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Save Changes
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Edit Details
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
