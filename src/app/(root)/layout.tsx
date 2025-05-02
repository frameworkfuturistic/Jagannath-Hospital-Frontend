import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense>
      <Footer />
    </>
  );
}
