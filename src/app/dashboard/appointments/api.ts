import axios from 'axios';
import { Consultant, TodaySlotData, SlotRangeData, AppointmentsByDate } from './types';

const API_BASE_URL = 'https://appointment.sjhrc.in/backend/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchConsultants = async (): Promise<Consultant[]> => {
  const response = await api.get<Consultant[]>('/consultants');
  return response.data;
};

export const createTodaySlot = async (data: TodaySlotData): Promise<void> => {
  await api.post('/slots', data);
};

export const createSlotRange = async (data: SlotRangeData): Promise<void> => {
  await api.post('/slots-range', data);
};

export const fetchAppointments = async (consultantId: number): Promise<AppointmentsByDate> => {
  const response = await api.get<AppointmentsByDate>(`/slots/${consultantId}`);
  return response.data;
};
