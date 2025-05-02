'use client';
import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components with skeleton placeholders
const AppointmentHeader = dynamic(
  () => import('@/components/appointment/appointment-header'),
  {
    loading: () => (
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const AppointmentSystem = dynamic(
  () => import('@/components/appointment/appointment-system'),
  {
    loading: () => (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full md:col-span-2" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Preload function for critical components
const preloadComponents = () => {
  if (typeof window !== 'undefined') {
    import('@/components/appointment/appointment-header');
    import('@/components/appointment/appointment-system');
  }
};

export default function Home() {
  // Start preloading on mouse enter or touch start
  useEffect(() => {
    const handleInteraction = () => {
      preloadComponents();
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="min-h-screen">
            <Skeleton className="h-16 w-full" />
            <div className="container mx-auto px-4 py-8">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        }
      >
        <AppointmentHeader />
        <AppointmentSystem />
      </Suspense>
    </div>
  );
}
