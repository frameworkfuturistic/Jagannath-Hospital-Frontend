import { Metadata } from 'next';
import AppointmentHeader from '@/components/appointment/appointment-header';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const AppointmentSearch = dynamic(
  () => import('@/components/appointment/appointment-search'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);
export const metadata: Metadata = {
  title: 'Search Appointments | Hospital Management System',
  description:
    'Search and manage patient appointments with advanced filtering options',
};

export default function AppointmentSearchPage() {
  return (
    <>
      <AppointmentHeader />
      <div className="container mx-auto py-6 px-4 md:px-6 mb-6">
        <AppointmentSearch />
      </div>
    </>
  );
}
