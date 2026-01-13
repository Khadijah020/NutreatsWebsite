import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  // Get GA4 Measurement ID from environment variable
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Initialize GA on component mount
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      initGA(GA_MEASUREMENT_ID);
    } else {
      console.warn('⚠️ Google Analytics Measurement ID not found. Add VITE_GA_MEASUREMENT_ID to your .env file');
    }
  }, [GA_MEASUREMENT_ID]);

  // Track page views on route change
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const pageTitle = document.title;
      trackPageView(location.pathname + location.search, pageTitle);
    }
  }, [location, GA_MEASUREMENT_ID]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
