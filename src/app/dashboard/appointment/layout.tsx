import { LoadingSpinner } from '@/components/loading-spinner';
import { Suspense, type ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <Suspense fallback={<LoadingSpinner fullPage />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
