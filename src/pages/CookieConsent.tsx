'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // SSR-safe localStorage check
  useEffect(() => {
    setIsMounted(true);
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShowBanner(true);
  }, []);

  const handleAccept = () => {
    if (isMounted) {
      localStorage.setItem('cookieConsent', 'true');
      setShowBanner(false);
    }
  };

  // Don't render on server
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-x-0 bottom-0 z-[9999] bg-gray-900 text-white shadow-xl"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-center text-sm leading-6 sm:text-left">
                We use cookies to enhance your experience. By continuing, you
                agree to our{' '}
                <a
                  href="/cookie-policy"
                  className="font-semibold text-blue-400 hover:text-blue-300 underline"
                  aria-label="Learn more about cookie policy"
                >
                  Cookie Policy
                </a>
                .
              </p>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-sm text-gray-300 hover:text-white mr-4"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="rounded-md bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200"
                  aria-label="Accept cookies"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
