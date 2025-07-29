// Google Analytics utility functions (GA4)
// Requer inclusão dos scripts no layout.tsx com next/script

export const GA_TRACKING_ID = 'G-030899MYKY';

// Track page views
export const pageview = (url) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
    console.log('Event tracked:', { action, category, label, value });
  }
};
