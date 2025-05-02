import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const AppointmentManagement = dynamic(
  () => import('@/components/admin/appointments/appointment-management'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);
export const metadata: Metadata = {
  title: 'Appointment Management | Hospital Admin',
  description: 'Manage hospital appointments',
};

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Appointment Management
      </h1>
      <AppointmentManagement />
    </div>
  );
}
