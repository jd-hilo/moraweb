/**
 * Reddit Pixel - Conversion tracking & advanced matching
 * Declare global rdt function added by Reddit pixel script in index.html
 */
declare global {
  interface Window {
    rdt?: (...args: unknown[]) => void;
  }
}

const REDDIT_PIXEL_ID = 'a2_i3nht0d9qivu';

type RedditMatchKeys = {
  email?: string;
  phoneNumber?: string;
  externalId?: string;
  idfa?: string;
  aaid?: string;
};

/**
 * Update Reddit pixel with advanced match keys (email, etc.) for better conversion attribution.
 * Call when user logs in or we have identifiable user data.
 */
export const identifyReddit = (matchKeys: RedditMatchKeys) => {
  if (typeof window === 'undefined' || !window.rdt) return;

  const keys = Object.fromEntries(
    Object.entries(matchKeys).filter(([, v]) => v != null && v !== '')
  );
  if (Object.keys(keys).length === 0) return;

  window.rdt('init', REDDIT_PIXEL_ID, keys);
};

/**
 * Track a conversion event. Use standard Reddit event names:
 * - PageVisit (auto-tracked on init)
 * - SignUp, Purchase, ViewContent, etc.
 * See Reddit Events Manager for custom conversion events.
 */
export const trackReddit = (eventName: string, payload?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.rdt) return;

  if (payload && Object.keys(payload).length > 0) {
    window.rdt('track', eventName, payload);
  } else {
    window.rdt('track', eventName);
  }
};
