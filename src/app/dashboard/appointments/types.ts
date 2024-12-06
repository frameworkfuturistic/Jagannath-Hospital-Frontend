export interface Consultant {
    ConsultantID: number;
    ConsultantName: string;
    ProfessionalDegree: string;
    Fee: string;
    Department: string;
  }
  
  export interface TodaySlotData {
    consultant_id: number;
    shift_id: number;
    date: string;
    num_slots: number;
  }
  
  export interface SlotRangeData {
    consultant_id: number;
    start_date: string;
    end_date: string;
    interval_minutes: number;
    daily_slots: Array<{ date: string; num_slots: number }>;
  }
  
  export interface Slot {
    SlotID: number;
    ConsultationDate: string;
    SlotTime: string;
    AvailableSlots: number;
    MaxSlots: number;
    SlotToken: string;
    isBooked: number;
    AppointmentID: number | null;
  }
  
  export interface AppointmentsByDate {
    [date: string]: Slot[];
  }
  