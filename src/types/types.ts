// types.ts
export interface Consultant {
  ConsultantID: number;
  ConsultantName: string;
  ProfessionalDegree: string;
  OPDConsultationFee: number;
  DepartmentID: number;
}

export interface Department {
  DepartmentID: number;
  Department: string;
}



export interface Appointment {
  AppointmentID: number;
  MRNo: string;
  ConsultantID: number;
  SlotID: number;
  ConsultationDate: string;
  PatientName: string;
  MobileNo: string;
  DepartmentID: number;
  CancelledAt: string;
  Remarks?: string;
  PaymentID?: number;
  PaymentMode?: 'Online';
  Status: 'Pending' | 'Confirmed' | 'Completed' | 'Scheduled' | 'Cancelled' | 'No Show';
  PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  AmountPaid: number;
  RefundAmount?: number;
  PaymentDate?: string;
  RefundDate?: string;
  CreatedAt: string;
  UpdatedAt: string;
  Consultant: {
    ConsultantID: number;
    ConsultantName: string;
    ProfessionalDegree: string;
    ConsultationFee: number;
  };
  Department: {
    DepartmentID: number;
    DepartmentName: string;
  };
  Slot: Slot;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AppointmentSearchParams {
  page?: number;
  limit?: number;
  Status?: string;
  ConsultantID?: number;
  AppointmentID?: number;
  DepartmentID?: number;
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
  PatientName?: string;
  MobileNo?: string;
  MRNo?: string;
}



export type SlotStatus = 'Available' | 'Hold' | 'Booked' | 'Cancelled' | 'Completed';

export interface Slot {
  SlotID: number;
  ConsultantID: number;
  SlotDate: string;
  SlotTime: string;
  SlotEndTime: string;
  PatientID: number | null;
  MaxSlots: number;
  AvailableSlots: number;
  IsBooked: number | boolean;
  IsActive: boolean;
  AppointmentID: number | null;
  Status: SlotStatus;
  SlotToken: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateSlotPayload {
  consultant_id: number;
  date: string;
  start_time: string;
  end_time: string;
  interval_minutes?: number;
  max_slots?: number;
}

export interface CreateSlotRangePayload {
  consultant_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  interval_minutes?: number;
  max_slots?: number;
  days_of_week?: number[];
}

export  interface DashboardDataStats {
  announcements: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    latest: {
      _id: string;
      title: string;
      createdAt: string;
    };
  };
  slots: {
    total: number;
    availability: {
      booked: string;
      available: string;
      full: string;
      utilizationRate: string;
    };
    byStatus: Record<string, number>;
    byConsultant: Array<{
      ConsultantID: number;
      ConsultantName: string;
      totalSlots: number;
      bookedSlots: string;
      utilizationRate: string;
    }>;
    latestSlots: Array<any>;
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    latestApplications: Array<{
      _id: string;
      applicantName: string;
      status: string;
      appliedAt: string;
    }>;
  };
  appointments: {
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    byConsultant: Array<{
      ConsultantID: number;
      ConsultantName: string;
      totalAppointments: number;
      completed: string;
      totalRevenue: string;
      avgRevenue: string;
      completionRate: string;
    }>;
    byDepartment: Array<{
      DepartmentID: number;
      Department: string;
      totalAppointments: number;
      totalRevenue: string;
    }>;
    latestAppointments: Array<{
      AppointmentID: number;
      PatientName: string;
      Status: string;
      AmountPaid: string;
      ConsultationDate: string;
      Consultant: {
        ConsultantName: string;
      };
    }>;
    dailyTrends: {
      date: string;
      totalAppointments: number;
      completed: string;
      dailyRevenue: string;
    }[];
  };
  timestamp: string;
}

// types/types.ts
export interface DashboardStatstypes {
  totalAppointments: number;
  availableSlots: number;
  activeDoctors: number;
  totalDoctors: number;
  totalRevenue: number;
  appointmentsChange: number;
  slotsChange: number;
  revenueChange: number;
  recentAppointments: Array<{
    AppointmentID: number;
    PatientName: string;
    Status: string;
    AmountPaid: string;
    ConsultationDate: string;
    Consultant: {
      ConsultantName: string;
    };
  }>;
  upcomingAppointments: Array<{
    AppointmentID: number;
    PatientName: string;
    Status: string;
    AmountPaid: string;
    ConsultationDate: string;
    Consultant: {
      ConsultantName: string;
    };
  }>;
}

export interface PatientData {
  PatientName?: string;
  MobileNo?: string;
  Sex?: string;
  DOB?: string;
  MRNo?: string;
  reason?: string;
  Email?: string;
}

export interface SlotWithAppointment {
  SlotID: number
  ConsultantID: number
  SlotDate: string
  SlotTime: string
  SlotEndTime: string
  PatientID: number | null
  MaxSlots: number
  AvailableSlots: number
  IsBooked: number
  IsActive: number
  AppointmentID: number | null
  Status: string
  SlotToken: string
  CreatedAt: string
  UpdatedAt: string
  appointment: Appointment | null
  consultant: {
    DepartmentID: number
  }
  department: {
    Department: string
  }
}
