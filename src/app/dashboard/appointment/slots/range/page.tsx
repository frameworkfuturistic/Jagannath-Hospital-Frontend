import type { Metadata } from 'next';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const AddSlotRangeForm = dynamic(
  () => import('@/components/admin/slots/add-slot-range-form'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: 'Add Slot Range | Hospital Admin',
  description: 'Add doctor appointment slots for a date range',
};

export default function AddSlotRangePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Add Slots for Date Range
      </h1>
      <AddSlotRangeForm />
    </div>
  );
}
