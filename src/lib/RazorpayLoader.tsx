// app/components/RazorpayLoader.js
'use client'; // Marking this as a client component

import { useEffect } from 'react';

const RazorpayLoader = () => {
  useEffect(() => {
    // Check if the script is already loaded
    const scriptId = 'razorpay-script';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
      };
      script.onerror = (error) => {
        console.error('Error loading Razorpay script:', error);
      };
      document.body.appendChild(script);

      // Cleanup function
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
          console.log('Razorpay script removed');
        }
      };
    } else {
      console.log('Razorpay script is already loaded');
    }
  }, []);

  return null; // This component doesn't render anything
};

export default RazorpayLoader;
