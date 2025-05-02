import { useState, useEffect, useCallback } from 'react';
import { Appointment, PaginatedResponse, AppointmentSearchParams } from '@/types/types';
import { fetchAppointments } from '@/lib/api';

export const useAppointments = (initialParams: AppointmentSearchParams = {}) => {
  const [data, setData] = useState<PaginatedResponse<Appointment>>({
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<AppointmentSearchParams>({
    page: 1,
    limit: 10,
    ...initialParams
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAppointments(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce to prevent rapid calls on param changes

    return () => clearTimeout(timer);
  }, [fetchData]);

  const updateParams = useCallback((newParams: Partial<AppointmentSearchParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const changePage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  return {
    data,
    loading,
    error,
    params,
    fetchData,
    updateParams,
    changePage,
  };
};