import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'careerProVerified';

/**
 * Check if user has Career Simulation Pro access:
 * - sessionStorage (verified checkout in this session)
 * - Logged-in user with is_premium
 */
export function useCareerPro() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // 1. Session storage - verified checkout this session
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        if (!cancelled) setHasAccess(true);
        return;
      }

      // 2. Logged-in user with premium
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profile?.is_premium && !cancelled) {
          setHasAccess(true);
          return;
        }
      }

      if (!cancelled) setHasAccess(false);
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return { hasAccess, loading: hasAccess === null };
}

export function setCareerProVerified() {
  sessionStorage.setItem(STORAGE_KEY, 'true');
}
