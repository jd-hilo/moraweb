import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { generateCareerSimulation } from '../../lib/careerSimulation';
import { supabase } from '../../lib/supabase';
import { trackEvent, Events } from '../../lib/mixpanel';
import { setCareerProVerified } from '../../hooks/useCareerPro';

const API_BASE_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes('localhost:3001')
    ? import.meta.env.VITE_PROXY_URL
    : '';

const loadingMessages = [
  'Analyzing your profile...',
  'Building career trajectory model...',
  'Simulating industry trends...',
  'Calculating compensation progression...',
  'Generating timeline milestones...',
  'Analyzing global comparisons...',
  'Finalizing simulation...',
];

export function CareerGeneratingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: onboardingData } = useOnboarding();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    trackEvent(Events.CAREER_GENERATING);
  }, []);

  // Check premium access before generating
  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/stripe/verify-career-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (data.success && !cancelled) {
            setCareerProVerified();
            setHasAccess(true);
            setAccessChecked(true);
            // Persist premium status + Stripe customer ID for logged-in users (for billing portal)
            const { data: { user } } = await supabase.auth.getUser();
            const customerId = typeof data.session?.customer === 'string'
              ? data.session.customer
              : data.session?.customer?.id;
            if (user && customerId) {
              await supabase.from('profiles').upsert(
                {
                  user_id: user.id,
                  is_premium: true,
                  stripe_customer_id: customerId,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
              );
            } else if (user) {
              await supabase.from('profiles').upsert(
                { user_id: user.id, is_premium: true, updated_at: new Date().toISOString() },
                { onConflict: 'user_id' }
              );
            }
            // Clean URL (remove session_id)
            window.history.replaceState({}, '', '/career/generating');
            return;
          }
        } catch (e) {
          console.error('Session verify failed:', e);
        }
        if (!cancelled) {
          navigate('/career/paywall', { replace: true });
          return;
        }
      }

      // No session_id - check stored verification or logged-in premium
      const stored = sessionStorage.getItem('careerProVerified');
      if (stored === 'true') {
        if (!cancelled) {
          setHasAccess(true);
          setAccessChecked(true);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profile?.is_premium && !cancelled) {
          setHasAccess(true);
          setAccessChecked(true);
          return;
        }
      }

      if (!cancelled) {
        setAccessChecked(true);
        setHasAccess(false);
        navigate('/career/paywall', { replace: true });
      }
    }

    checkAccess();
    return () => { cancelled = true; };
  }, [location.search, navigate]);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Animated progress bar (cosmetic ~30s fill)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + (0.3 + Math.random() * 0.5);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Generate simulation once access is confirmed
  useEffect(() => {
    if (!accessChecked || !hasAccess) return;

    let cancelled = false;

    async function generate() {
      try {
        const simulation = await generateCareerSimulation(onboardingData);

        if (cancelled) return;

        // Try to save to database (use current user if logged in)
        let simulationId: string | null = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const { data: saved, error: saveError } = await supabase
            .from('websims')
            .insert({
              user_id: user?.id ?? null,
              scenarios: simulation,
              summary: `Career simulation: ${simulation.outcome?.title || 'Career Projection'}`,
              simulation_type: 'career',
            })
            .select()
            .single();

          if (!saveError && saved) {
            simulationId = saved.id;
          }
        } catch (dbErr) {
          console.warn('Could not save career simulation to DB:', dbErr);
        }

        if (cancelled) return;

        setProgress(100);

        // Navigate to results
        setTimeout(() => {
          navigate('/career/results', {
            state: {
              simulationId,
              careerSimulation: simulation,
              timestamp: Date.now(),
            },
            replace: true,
          });
        }, 500);
      } catch (err) {
        if (cancelled) return;
        console.error('Career simulation generation failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate simulation');
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [accessChecked, hasAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show minimal loading while checking access
  if (!accessChecked || !hasAccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Verifying...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Title */}
        <h1
          className="text-2xl md:text-3xl font-bold text-black"
          style={{
            fontFamily: 'Recoleta, Georgia, serif',
            fontVariantLigatures: 'none',
            WebkitFontFeatureSettings: '"liga" off',
            fontFeatureSettings: '"liga" off',
          }}
        >
          Generating Your Career Simulation
        </h1>

        {/* Rotating subtitle */}
        <div className="min-h-[32px] flex items-center justify-center">
          <p
            key={currentMessage}
            className="text-gray-500 text-base animate-fade-in"
          >
            {loadingMessages[currentMessage]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(135deg, #25729f, #62edb9)',
            }}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-6 space-y-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setProgress(0);
                window.location.reload();
              }}
              className="px-6 py-3 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
