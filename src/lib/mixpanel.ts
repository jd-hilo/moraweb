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
  
  // Onboarding step events - web
  ONBOARDING_STEP_NAME: 'Onboarding Step Completed - Name - web',
  ONBOARDING_STEP_BIRTH_YEAR: 'Onboarding Step Completed - Birth Year - web',
  ONBOARDING_STEP_VALUES: 'Onboarding Step Completed - Values - web',
  ONBOARDING_STEP_WORK_STATUS: 'Onboarding Step Completed - Work Status - web',
  ONBOARDING_STEP_LIVING_SITUATION: 'Onboarding Step Completed - Living Situation - web',
  ONBOARDING_STEP_RELATIONSHIP_STATUS: 'Onboarding Step Completed - Relationship Status - web',
  ONBOARDING_STEP_FINANCIAL_SITUATION: 'Onboarding Step Completed - Financial Situation - web',
  ONBOARDING_STEP_LIFE_STAGE: 'Onboarding Step Completed - Life Stage - web',
  ONBOARDING_STEP_GOALS: 'Onboarding Step Completed - Goals - web',
  ONBOARDING_STEP_INTERESTS: 'Onboarding Step Completed - Interests - web',
  ONBOARDING_STEP_HOMETOWN: 'Onboarding Step Completed - Hometown - web',
  ONBOARDING_STEP_COLLEGE: 'Onboarding Step Completed - College - web',
  ONBOARDING_STEP_CAREER_START: 'Onboarding Step Completed - Career Start - web',
  ONBOARDING_STEP_TURNING_POINT: 'Onboarding Step Completed - Turning Point - web',
  ONBOARDING_STEP_SHAPED_MOST: 'Onboarding Step Completed - Shaped Most - web',
  ONBOARDING_STEP_CHALLENGES: 'Onboarding Step Completed - Challenges - web',
  ONBOARDING_STEP_DECISION_STYLE: 'Onboarding Step Completed - Decision Style - web',
  ONBOARDING_STEP_STRESS_HANDLING: 'Onboarding Step Completed - Stress Handling - web',
  ONBOARDING_STEP_POLITICS: 'Onboarding Step Completed - Politics - web',
  ONBOARDING_STEP_CLARIFIER: 'Onboarding Step Completed - Clarifier - web',
  
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



