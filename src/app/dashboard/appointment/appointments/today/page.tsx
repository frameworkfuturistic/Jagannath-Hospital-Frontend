import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const TodayAppointmentsPage = dynamic(
  () => import('@/components/admin/appointments/today-appointments-page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: "Today's Appointments | Hospital Admin",
  description: "Manage today's hospital appointments",
};

export default function TodayAppointments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Today's Appointments
      </h1>
      <TodayAppointmentsPage />
    </div>
  );
}
