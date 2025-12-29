import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV, // Enable debug mode in development
    track_pageview: true, // Automatically track page views
    persistence: 'localStorage', // Persist user identity across sessions
  });
} else {
  console.warn('Mixpanel token not found. Analytics will not be tracked.');
}

// Helper function to identify users
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (!MIXPANEL_TOKEN) return;
  
  mixpanel.identify(userId);
  if (userProperties) {
    mixpanel.people.set(userProperties);
  }
};

// Helper function to reset user identity (on sign out)
export const resetUser = () => {
  if (!MIXPANEL_TOKEN) return;
  mixpanel.reset();
};

// Helper function to track events with platform property
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!MIXPANEL_TOKEN) return;
  
  mixpanel.track(eventName, {
    platform: 'web',
    ...properties,
  });
};

// Helper function to set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!MIXPANEL_TOKEN) return;
  mixpanel.people.set(properties);
};

// Common event names (keep consistent with iOS)
export const Events = {
  // Auth events
  SIGN_UP_STARTED: 'Sign Up Started',
  SIGN_UP_COMPLETED: 'Sign Up Completed',
  SIGN_IN_STARTED: 'Sign In Started',
  SIGN_IN_COMPLETED: 'Sign In Completed',
  SIGN_OUT: 'Sign Out',
  
  // Onboarding events
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_STEP_COMPLETED: 'Onboarding Step Completed',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  TWIN_CREATED: 'Twin Created',
  
  // Simulation events
  SIMULATION_STARTED: 'Simulation Started',
  SIMULATION_GENERATED: 'Simulation Generated',
  SIMULATION_VIEWED: 'Simulation Viewed',
  SIMULATION_SHARED: 'Simulation Shared',
  SIMULATION_DELETED: 'Simulation Deleted',
  
  // Dashboard events
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  
  // Landing page events
  LANDING_PAGE_VIEWED: 'Landing Page Viewed',
  GET_STARTED_CLICKED: 'Get Started Clicked',
  
  // Share events
  SHARE_MODAL_SHOWN: 'Share Modal Shown',
  SHARE_LINK_COPIED: 'Share Link Copied',
  
  // Payment events
  PURCHASE_COMPLETED: 'Purchase Completed',
} as const;

export default mixpanel;



