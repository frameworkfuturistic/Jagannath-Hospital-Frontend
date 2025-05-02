'use client';

import { useEffect, useState } from 'react';

export default function RazorpayLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).Razorpay) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.id = 'razorpay-script';

    script.onload = () => {
      setLoaded(true);
      console.log('Razorpay SDK loaded successfully');
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('razorpay-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
