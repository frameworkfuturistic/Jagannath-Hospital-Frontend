'use client';

import { cn } from '@/lib/utils';

export function LoadingSpinner({
  className,
  fullPage = false,
}: {
  className?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullPage ? 'h-screen w-full' : 'h-full w-full',
        className
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    </div>
  );
}
