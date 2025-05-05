import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { Slot, DashboardDataStats, CreateSlotPayload, CreateSlotRangePayload, Consultant, Appointment, PaginatedResponse, AppointmentSearchParams, Department } from '../types/types';

// Request deduplication cache
const activeRequests: Record<string, Promise<any>> = {};

// Create the enhanced axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Enhanced request interceptor with deduplication
api.interceptors.request.use(async (config) => {
  // Create a unique key for each request
  const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
  
  // If there's an identical request in progress, return its promise
  if (activeRequests[requestKey]) {
    return activeRequests[requestKey];
  }

  // Add authorization token if available
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Smart Content-Type handling
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Create a new promise for this request
  const requestPromise = Promise.resolve(config);
  activeRequests[requestKey] = requestPromise;

  // Remove from active requests when completed
  requestPromise.finally(() => {
    delete activeRequests[requestKey];
  });

  return requestPromise;
}, (error) => {
  return Promise.reject(error);
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }

    if (error.response) {
      console.error('API Error:', error.response.data);
      return Promise.reject({
        message: (error.response.data as { message?: string }).message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
        isNetworkError: false,
      });
    } else if (error.request) {
      console.error('Network Error:', error.request);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    } else {
      console.error('Request Error:', error.message);
      return Promise.reject({
        message: 'Request configuration error',
        isNetworkError: false,
      });
    }
  }
);

// Cache for dashboard data
let dashboardDataCache: {
  data: DashboardDataStats | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

//  API functions remain exactly the same
export const fetchAppointments = async (
  params?: AppointmentSearchParams
): Promise<PaginatedResponse<Appointment>> => {
  try {
    // Convert date filters to proper format if needed
    const processedParams = {
      ...params,
      startDate: params?.startDate ? format(new Date(params.startDate), 'yyyy-MM-dd') : undefined,
      endDate: params?.endDate ? format(new Date(params.endDate), 'yyyy-MM-dd') : undefined
    };
    
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments', {
      params: processedParams,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
  }
};

export const completeAppointment = async (
  appointmentId: number, 
  data: {
    diagnosis: string;
    prescription: string;
  }
) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/complete`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to complete appointment:', error);
    throw error;
  }
};

export const processRefund = async (appointmentId: number, refundReason?: string) => {
  try {
    const response = await api.post(`/appointments/${appointmentId}/refund`, { refundReason });
    return response.data;
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw error;
  }
};

export const fetchConsultants = async (): Promise<Consultant[]> => {
  try {
    const response = await api.get<{ data: Consultant[] }>('/consultants');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch consultants:', error);
    throw error;
  }
};

export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const response = await api.get<{ data: Department[] }>('/departments');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw error;
  }
};

export const fetchSlots = async (
  consultantId?: number,
  date?: string
): Promise<Slot[]> => {
  try {
    let url = '/slots';
    const params: any = {};
    
    if (consultantId) {
      params.consultantId = consultantId;
    }
    if (date) {
      params.date = date;
    }

    const response = await api.get<{ data: Slot[] }>(url, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};


export const fetchSlotsWithAppointments = async (filters: {
  date?: string;
  consultantId?: number;
  departmentId?: number;
} = {}): Promise<Slot[]> => {
  try {
    let url = '/slots/appointments';
    const params: Record<string, any> = {};
    
    if (filters.date) params.date = filters.date;
    if (filters.consultantId) params.consultantId = filters.consultantId;
    if (filters.departmentId) params.departmentId = filters.departmentId;

    const response = await api.get<{
      message: string; 
      success: boolean;
      data: Slot[];
    }>(url, { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch slots');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching slots with appointments:', error);
    throw error;
  }
};

export const createSlot = async (payload: CreateSlotPayload): Promise<Slot[]> => {
  try {
    const response = await api.post<{ data: Slot[] }>('/slots', payload);
    console.log("slots create", response);
    return response.data.data;
  } catch (error) {
    console.error('Error creating slot:', error);
    throw error;
  }
};

export const createSlotRange = async (
  payload: CreateSlotRangePayload
): Promise<{ totalSlotsCreated: number }> => {
  try {
    const response = await api.post<{ data: { totalSlotsCreated: number } }>('/slots/range', payload);
    return response.data.data;
  } catch (error) {
    console.error('Error creating slot range:', error);
    throw error;
  }
};

export const releaseSlot = async (slotId: number): Promise<boolean> => {
  try {
    await api.put('/slots/release', { slotId });
    return true;
  } catch (error) {
    console.error('Error releasing slot:', error);
    throw error;
  }
};

export const scheduleAppointment = async (
  appointmentId: number,
  newSlotId: number
) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/schedule`, { 
      newSlotId 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to schedule appointment:', error);
    throw error;
  }
};

export const fetchDashboardData = async (forceRefresh = false): Promise<DashboardDataStats> => {
  // Return cached data if it's fresh and not forced to refresh
  if (!forceRefresh && dashboardDataCache.data && Date.now() - dashboardDataCache.timestamp < CACHE_DURATION) {
    return dashboardDataCache.data;
  }

  try {
    const response = await api.get<DashboardDataStats>('/stats');
    dashboardDataCache = {
      data: response.data,
      timestamp: Date.now()
    };
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};