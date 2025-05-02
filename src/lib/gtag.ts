// Define the interface for trackEvent parameters
interface TrackEventParams {
    action: string;
    category: string;
    label: string;
    value?: number; // Optional, as it may not always be provided
    timing?: number; // Optional, for time in milliseconds
  }
  
  // Function to track custom events in GA4
  export const trackEvent = ({ action, category, label, value, timing }: TrackEventParams): void => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        event_timing: timing,
      });
    }
  };