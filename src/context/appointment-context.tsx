// eslint-disable-next-line
// @ts-nocheck
'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types
interface Department {
  DepartmentID: number;
  Department: string;
}

interface Doctor {
  ConsultantID: number;
  ConsultantName: string;
  ProfessionalDegree?: string;
  Fee?: number;
  Specialization?: string;
}

interface Slot {
  SlotID: number;
  SlotTime: string;
  SlotEndTime: string;
  AvailableSlots: number;
  Status: string;
  SlotToken?: string;
}

interface PatientData {
  PatientName?: string;
  MobileNo?: string;
  Sex?: string;
  DOB?: string;
  MRNo?: string;
  reason?: string;
  Email?: string;
}

interface AppointmentDetails {
  AppointmentID?: number;
  MRNo?: string;
  SlotToken?: string;
  PaymentID?: string;
  Status?: string;
  PaymentStatus?: string;
}

interface AppointmentState {
  departments: Department[];
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  availableSlots: Slot[];
  selectedSlot: number | null;
  error: string | null;
  loading: boolean;
  patientData: PatientData | null;
  appointmentDetails: AppointmentDetails | null;
  selectedDepartmentId: number | null;
  paymentStatus: 'success' | 'failed' | 'pending' | null;
  temporaryAppointmentId: string | null;
  isProcessingPayment: boolean;
  existingPatient: boolean;
  multiplePatients: PatientData[];
  availableDates: string[];
  selectedDate: string | null;
}

type AppointmentAction =
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_DOCTORS'; payload: Doctor[] }
  | { type: 'SET_SELECTED_DOCTOR'; payload: number | null }
  | { type: 'SET_AVAILABLE_SLOTS'; payload: Slot[] }
  | { type: 'SET_SELECTED_SLOT'; payload: number | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PATIENT_DATA'; payload: PatientData | null }
  | { type: 'SET_APPOINTMENT_DETAILS'; payload: AppointmentDetails | null }
  | { type: 'SET_SELECTED_DEPARTMENT_ID'; payload: number | null }
  | {
      type: 'SET_PAYMENT_STATUS';
      payload: 'success' | 'failed' | 'pending' | null;
    }
  | { type: 'SET_TEMPORARY_APPOINTMENT_ID'; payload: string | null }
  | { type: 'SET_IS_PROCESSING_PAYMENT'; payload: boolean }
  | { type: 'SET_EXISTING_PATIENT'; payload: boolean }
  | { type: 'SET_MULTIPLE_PATIENTS'; payload: PatientData[] }
  | { type: 'SET_AVAILABLE_DATES'; payload: string[] }
  | { type: 'SET_SELECTED_DATE'; payload: string | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppointmentState = {
  departments: [],
  doctors: [],
  selectedDoctor: null,
  availableSlots: [],
  selectedSlot: null,
  error: null,
  loading: false,
  patientData: null,
  appointmentDetails: null,
  selectedDepartmentId: null,
  paymentStatus: null,
  temporaryAppointmentId: null,
  isProcessingPayment: false,
  existingPatient: false,
  multiplePatients: [],
  availableDates: [],
  selectedDate: null,
};

// Reducer
function appointmentReducer(
  state: AppointmentState,
  action: AppointmentAction
): AppointmentState {
  switch (action.type) {
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_DOCTORS':
      return { ...state, doctors: action.payload };
    case 'SET_SELECTED_DOCTOR':
      return {
        ...state,
        selectedDoctor: action.payload
          ? state.doctors.find(
              (doctor) => doctor.ConsultantID === action.payload
            ) || null
          : null,
      };
    case 'SET_AVAILABLE_SLOTS':
      return { ...state, availableSlots: action.payload };
    case 'SET_SELECTED_SLOT':
      return { ...state, selectedSlot: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PATIENT_DATA':
      return { ...state, patientData: action.payload };
    case 'SET_APPOINTMENT_DETAILS':
      return { ...state, appointmentDetails: action.payload };
    case 'SET_SELECTED_DEPARTMENT_ID':
      return { ...state, selectedDepartmentId: action.payload };
    case 'SET_PAYMENT_STATUS':
      return { ...state, paymentStatus: action.payload };
    case 'SET_TEMPORARY_APPOINTMENT_ID':
      return { ...state, temporaryAppointmentId: action.payload };
    case 'SET_IS_PROCESSING_PAYMENT':
      return { ...state, isProcessingPayment: action.payload };
    case 'SET_EXISTING_PATIENT':
      return { ...state, existingPatient: action.payload };
    case 'SET_MULTIPLE_PATIENTS':
      return { ...state, multiplePatients: action.payload };
    case 'SET_AVAILABLE_DATES':
      return { ...state, availableDates: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface AppointmentContextType {
  state: AppointmentState;
  fetchDepartments: () => Promise<void>;
  fetchDoctors: (departmentId: number) => Promise<void>;

  fetchAvailableSlots: (doctorId: number, date: string) => Promise<void>;
  fetchAvailableDates: (doctorId: number) => Promise<void>;
  setSelectedDepartment: (departmentId: number | null) => void;
  setSelectedDoctor: (doctorId: number | null) => void;
  setSelectedSlot: (slotId: number | null) => void;
  setSelectedDate: (date: string | null) => void;
  searchExistingPatient: (mrdOrMobile: string) => Promise<PatientData[]>;
  setPatientData: (data: PatientData | null) => void;
  createPatient: (data: PatientData) => Promise<PatientData>;
  bookAppointment: () => Promise<number>;
  processPayment: () => Promise<void>;
  setExistingPatient: (isExisting: boolean) => void;
  resetAppointmentState: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(
  undefined
);

// Provider
export function AppointmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      const parsedTime = parse(timeString, 'HH:mm:ss', new Date());
      return format(parsedTime, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_BASE_URL}/departments`);
      dispatch({ type: 'SET_DEPARTMENTS', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch departments' });
      toast.error('Failed to load departments. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch doctors by department
  const fetchDoctors = useCallback(async (departmentId: number) => {
    if (!departmentId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(
        `${API_BASE_URL}/consultants/doctors/${departmentId}`
      );
      dispatch({ type: 'SET_DOCTORS', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch doctors' });
      toast.error('Failed to load doctors. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAvailableDates = useCallback(
    async (doctorId: number, month: number, year: number) => {
      if (!doctorId) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // First, fetch all slots for the doctor
        const response = await axios.get(`${API_BASE_URL}/slots/${doctorId}`);
        const slotsData = response.data?.data;
        console.log('Available slots response:', slotsData);

        // Extract dates that have at least one available slot
        const availableDates: string[] = [];
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only

        // Iterate through each date in the response
        for (const dateStr in slotsData) {
          const date = new Date(dateStr);

          // Check if the date is in the requested month and year
          if (date.getMonth() === month && date.getFullYear() === year) {
            // Check if the date is not in the past
            if (date >= currentDate) {
              // Check if there's at least one available slot
              const hasAvailableSlot = slotsData[dateStr].some(
                (slot: any) => (slot.IsActive = 1)
              );

              if (hasAvailableSlot) {
                availableDates.push(dateStr);
              }
            }
          }
        }
        console.log('available ', availableDates);
        dispatch({ type: 'SET_AVAILABLE_DATES', payload: availableDates });
        return availableDates;
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Error fetching available dates',
        });
        toast.error('Failed to fetch available dates. Please try again.');
        return [];
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  // Fetch available slots for a doctor on a specific date
  const fetchAvailableSlots = useCallback(
    async (doctorId: number, date: string) => {
      if (!doctorId || !date) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const response = await axios.get(
          `${API_BASE_URL}/slots/${doctorId}/${date}`
        );
        // console.log('Available slots response:', response.data.data);
        dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: response.data.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to fetch available slots',
        });
        toast.error('Failed to load available slots. Please try again.');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  // Search for existing patient
  const searchExistingPatient = useCallback(async (mrdOrMobile: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/search`, {
        params: { mrdOrMobile },
      });

      if (response.data.data && response.data.data.length > 0) {
        dispatch({
          type: 'SET_MULTIPLE_PATIENTS',
          payload: response.data.data,
        });
        return response.data.data;
      }
      return [];
    } catch (error) {
      toast.error('Error searching for patient');
      return [];
    }
  }, []);

  // Create new patient
  const createPatient = useCallback(async (data: PatientData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients`, data);
      dispatch({ type: 'SET_PATIENT_DATA', payload: response.data.data });
      toast.success('Patient created successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create patient');
      throw error;
    }
  }, []);

  // Book appointment
  const bookAppointment = useCallback(async () => {
    if (
      !state.selectedDoctor ||
      !state.selectedDate ||
      !state.selectedSlot ||
      !state.patientData
    ) {
      throw new Error('Missing required information for booking');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const selectedSlot = state.availableSlots.find(
        (slot) => slot.SlotID === state.selectedSlot
      );

      const appointmentData = {
        ConsultantID: state.selectedDoctor.ConsultantID,
        SlotID: state.selectedSlot,
        MRNo: state.patientData.MRNo,
        ConsultationDate: state.selectedDate,
        PatientName: state.patientData.PatientName,
        MobileNo: state.patientData.MobileNo,
        Email: state.patientData.Email,
        Remarks: state.patientData.reason,
      };
      console.log('Appointment data:', appointmentData);
      console.log('Selected slot:', selectedSlot);

      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        appointmentData
      );
      const formattedData = response.data?.data;
      console.log('Appointment response:', response);

      dispatch({
        type: 'SET_APPOINTMENT_DETAILS',
        payload: formattedData,
      });

      setTimeout(() => {
        console.log('State after timeout:', state);
      }, 1000);

      console.log('Appointment details:', formattedData?.AppointmentID);

      console.log('state ', state);
      // Store temporary ID in case payment fails
      const tempId = `temp-appt-${Date.now()}`;
      sessionStorage.setItem(tempId, JSON.stringify(response.data.data));
      dispatch({ type: 'SET_TEMPORARY_APPOINTMENT_ID', payload: tempId });

      toast.success('Appointment booked successfully');
      return formattedData?.AppointmentID;
    } catch (error) {
      toast.error('Failed to book appointment');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    state.selectedDoctor,
    state.selectedDate,
    state.selectedSlot,
    state.patientData,
    state.availableSlots,
    state.appointmentDetails,
  ]);

  // Process payment
  const processPayment = useCallback(
    async (appointmentNo: number) => {
      console.log('Check payment');
      if (!appointmentNo || !state.selectedDoctor?.Fee) {
        throw new Error('Missing appointment or payment details');
      }

      try {
        dispatch({ type: 'SET_IS_PROCESSING_PAYMENT', payload: true });
        dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'pending' });

        // Wait for Razorpay to load
        while (!(window as any).Razorpay) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Create payment order
        // const paymentResponse = await axios.post(
        //   `${API_BASE_URL}/payments/initiate`,
        //   {
        //     appointmentId: state.appointmentDetails.AppointmentID,
        //     amount: state.selectedDoctor.Fee,
        //   }
        // );

        const paymentResponse = await axios.post(
          `${API_BASE_URL}/payments/${appointmentNo}/initiate`,
          {
            appointmentId: appointmentNo,
            amount: Number(state.selectedDoctor.Fee),
          }
        );

        console.log('Payment state:', state);

        const { orderId, key } = paymentResponse.data.data;

        const options = {
          key,
          amount: state.selectedDoctor.Fee * 100, // Razorpay expects amount in paise
          currency: 'INR',
          name: 'Shree Jagannath Hospital & Research Centre',
          description: 'Appointment Booking',
          order_id: orderId,
          handler: async (response: any) => {
            console.log('Razorpay response:', response);
            try {
              // Verify payment
              await axios.post(
                `${API_BASE_URL}/payments/${appointmentNo}/verify`,
                {
                  // appointmentId: state.appointmentDetails?.AppointmentID,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                }
              );

              dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'success' });
              toast.success('Payment successful! Appointment confirmed.');

              // Clean up temporary storage
              if (state.temporaryAppointmentId) {
                sessionStorage.removeItem(state.temporaryAppointmentId);
                dispatch({
                  type: 'SET_TEMPORARY_APPOINTMENT_ID',
                  payload: null,
                });
              }
            } catch (error) {
              dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'failed' });
              toast.error('Payment verification failed f2');
            } finally {
              dispatch({ type: 'SET_IS_PROCESSING_PAYMENT', payload: false });
            }
          },
          prefill: {
            name: state.patientData?.PatientName,
            email: state.patientData?.Email,
            contact: state.patientData?.MobileNo,
          },
          theme: {
            color: '#3399cc',
          },
          modal: {
            ondismiss: () => {
              dispatch({ type: 'SET_PAYMENT_STATUS', payload: null });
              toast.warning('Payment cancelled');
            },
            // escape: true,
            // backdropclose: true,
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error) {
        dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'failed' });
        toast.error('Payment processing failed');
        throw error;
      } finally {
        console.log('Payment processing finished', state);
        dispatch({ type: 'SET_IS_PROCESSING_PAYMENT', payload: false });
      }
    },
    [
      state.appointmentDetails,
      state.selectedDoctor,
      state.patientData,
      state.temporaryAppointmentId,
    ]
  );

  // Reset state
  const resetAppointmentState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value = {
    state,
    fetchDepartments,
    fetchDoctors,
    fetchAvailableSlots,
    fetchAvailableDates,
    setSelectedDepartment: (departmentId: number | null) => {
      dispatch({ type: 'SET_SELECTED_DEPARTMENT_ID', payload: departmentId });
    },
    setSelectedDoctor: (doctorId: number | null) => {
      dispatch({ type: 'SET_SELECTED_DOCTOR', payload: doctorId });
    },
    setSelectedSlot: (slotId: number | null) => {
      dispatch({ type: 'SET_SELECTED_SLOT', payload: slotId });
    },
    setSelectedDate: (date: string | null) => {
      dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    },
    searchExistingPatient,
    setPatientData: (data: PatientData | null) => {
      dispatch({ type: 'SET_PATIENT_DATA', payload: data });
    },
    createPatient,
    bookAppointment,
    processPayment,
    setExistingPatient: (isExisting: boolean) => {
      dispatch({ type: 'SET_EXISTING_PATIENT', payload: isExisting });
    },
    resetAppointmentState,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}

// Custom hook
export function useAppointment() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      'useAppointment must be used within an AppointmentProvider'
    );
  }
  return context;
}
