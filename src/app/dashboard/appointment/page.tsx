import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const DashboardStats = dynamic(
  () => import('@/components/admin/dashboard/stats/DashboardStats'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const RevenueChart = dynamic(
  () => import('@/components/admin/dashboard/revenue-chart'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const AppointmentsByDepartment = dynamic(
  () => import('@/components/admin/dashboard/appointments-by-department'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const AppointmentsByDoctor = dynamic(
  () => import('@/components/admin/dashboard/appointments-by-doctor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const TodayAppointments = dynamic(
  () => import('@/components/admin/dashboard/today-appointments'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const UpcomingAppointments = dynamic(
  () => import('@/components/admin/dashboard/upcoming-appointments'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hospital Management',
  description: 'Admin dashboard for hospital appointment management',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <AppointmentsByDepartment />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentsByDoctor />
        <TodayAppointments />
      </div>

      <UpcomingAppointments />
    </div>
  );
}
