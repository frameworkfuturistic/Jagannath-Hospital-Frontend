import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchDashboardData } from '@/lib/api';
import { format, subDays, isWithinInterval } from 'date-fns';
import { DashboardDataStats } from '@/types/types';

type TimeRange = 'today' | 'week' | 'month' | 'year';

interface DashboardStats {
  totalAppointments: number;
  paidAppointments: number;
  completedAppointments: number;
  refundAppointments: number;
  availableSlots: number;
  activeDoctors: number;
  totalDoctors: number;
  totalRevenue: number;
  appointmentsChange: number;
  slotsChange: number;
  revenueChange: number;
  bookedSlots: number;
  fullSlots: number;
  recentAppointments: any[];
  upcomingAppointments: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardDataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await fetchDashboardData(forceRefresh);
      setData(response);
      setError(null);
      setLastRefresh(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch or refresh when needed
  useEffect(() => {
    const shouldRefresh = !data || Date.now() - lastRefresh > 300000; // 5 minutes
    if (shouldRefresh) {
      fetchData();
    }
  }, [data, fetchData, lastRefresh]);

  const formattedDate = useMemo(() => {
    return data?.timestamp 
      ? format(new Date(data.timestamp), 'MMMM d, yyyy h:mm a') 
      : '';
  }, [data?.timestamp]);

  const calculateTimeBasedMetrics = useCallback(() => {
    if (!data) return null;

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'today':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'year':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 1);
    }

    const filteredAppointments = data.appointments.latestAppointments.filter(appt => {
      const apptDate = new Date(appt.ConsultationDate);
      return isWithinInterval(apptDate, { start: startDate, end: now });
    });

    const prevPeriodRevenue = calculateTotalRevenue(filteredAppointments) * 0.8;
    const currentRevenue = calculateTotalRevenue(filteredAppointments);
    const revenueChange = prevPeriodRevenue > 0 
      ? ((currentRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100 
      : 0;

    return {
      filteredAppointments,
      revenueChange: parseFloat(revenueChange.toFixed(2)),
    };
  }, [data, timeRange]);

  const timeBasedMetrics = useMemo(() => calculateTimeBasedMetrics(), [calculateTimeBasedMetrics]);

  const stats: DashboardStats = useMemo(() => ({
    totalAppointments: data?.appointments.total || 0,
    paidAppointments: data?.appointments.byPaymentStatus.Paid || 0,
    completedAppointments: data?.appointments.byStatus.Completed || 0,
    refundAppointments: data?.appointments.byPaymentStatus.Refunded || 0,
    availableSlots: parseInt(data?.slots.availability.available || '0'),
    bookedSlots: parseInt(data?.slots.availability.booked || '0'),
    fullSlots: parseInt(data?.slots.availability.full || '0'),
    activeDoctors: data?.slots.byConsultant.length || 0,
    totalDoctors: data?.slots.byConsultant.length || 0,
    totalRevenue: calculateTotalRevenue(data?.appointments.latestAppointments || []),
    appointmentsChange: 0,
    slotsChange: parseFloat(data?.slots.availability.utilizationRate || '0'),
    revenueChange: timeBasedMetrics?.revenueChange || 0,
    recentAppointments: data?.appointments.latestAppointments.slice(0, 5) || [],
    upcomingAppointments: getUpcomingAppointments(data?.appointments.latestAppointments || []),
  }), [data, timeBasedMetrics]);

  return {
    data,
    loading,
    error,
    formattedDate,
    stats,
    timeRange,
    setTimeRange,
    refetch: () => fetchData(true),
    lastRefresh,
  };
}

function calculateTotalRevenue(appointments: any[]): number {
  return appointments.reduce((sum, appt) => {
    return sum + (parseFloat(appt.AmountPaid) || 0);
  }, 0);
}

function getUpcomingAppointments(appointments: any[]): any[] {
  const now = new Date();
  return appointments
    .filter(appt => new Date(appt.ConsultationDate) > now)
    .sort((a, b) => new Date(a.ConsultationDate).getTime() - new Date(b.ConsultationDate).getTime())
    .slice(0, 5);
}