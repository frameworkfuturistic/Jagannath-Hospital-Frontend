import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Metadata } from 'next';
const SlotManagement = dynamic(
  () => import('@/components/admin/slots/slot-management'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: 'Slot Management | Hospital Admin',
  description: 'Manage doctor appointment slots',
};

export default function SlotsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Slot Management</h1>
      <SlotManagement />
    </div>
  );
}
