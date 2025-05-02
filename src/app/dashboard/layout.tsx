import { AuthHandler } from '@/components/sidebar/AuthHandler';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LoadingSpinner } from '@/components/loading-spinner';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LazyAppSidebar = dynamic(
  () =>
    import('@/components/sidebar/app-sidebar').then((mod) => mod.AppSidebar),
  {
    loading: () => <div className="w-64 bg-background h-screen" />,
    ssr: false,
  }
);

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthHandler>
      <SidebarProvider>
        <Suspense fallback={<div className="w-64 bg-background h-screen" />}>
          <LazyAppSidebar variant="inset" />
        </Suspense>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Suspense fallback={<LoadingSpinner fullPage />}>
                {children}
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthHandler>
  );
}
