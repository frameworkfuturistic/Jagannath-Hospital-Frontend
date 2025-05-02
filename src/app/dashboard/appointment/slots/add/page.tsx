import type { Metadata } from 'next';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const AddSlotForm = dynamic(
  () => import('@/components/admin/slots/add-slot-form'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: 'Add Slots | Hospital Admin',
  description: 'Add doctor appointment slots',
};

export default function AddSlotsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add Slots</h1>
      <AddSlotForm />
    </div>
  );
}
