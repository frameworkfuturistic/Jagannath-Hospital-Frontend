'use client';

import { useState, useEffect } from 'react';

export function useMobileScreen(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (browser environment)
    if (typeof window !== 'undefined') {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      // Initial check
      checkScreenSize();

      // Add event listener for window resize
      window.addEventListener('resize', checkScreenSize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', checkScreenSize);
      };
    }
  }, [breakpoint]);

  return isMobile;
}
