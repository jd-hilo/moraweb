import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { setCareerProVerified } from '../../hooks/useCareerPro';
import { Mail } from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_BASE_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes('localhost:3001')
    ? import.meta.env.VITE_PROXY_URL
    : '';

export function EmailScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [email, setEmail] = useState(data.email || '');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    trackEvent(Events.CAREER_EMAIL);
  }, []);

  const handleContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    updateData({ email: trimmed });

    // Check if returning premium user - bypass paywall
    setIsChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stripe/check-career-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const result = await res.json();
      if (result.hasAccess) {
        setCareerProVerified();
        navigate('/career/generating', { replace: true });
        return;
      }
    } catch {
      // Fall through to paywall on error
    } finally {
      setIsChecking(false);
    }
    navigate('/career/paywall');
  };

  return (
    <OnboardingScreen
      progress={92}
      title="Where should we send your simulation results?"
      encouragingText="Almost there! Your personalized career projection is ready to generate."
      helperText="We'll email your full results and a link to access them anytime."
    >
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            enterKeyHint="done"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none text-black placeholder:text-gray-400 transition-colors"
            autoComplete="email"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          onClick={handleContinue}
          disabled={isChecking}
          className="w-full px-8 py-4 text-lg text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #25729f, #62edb9)',
          }}
        >
          {isChecking ? 'Checking...' : 'Continue to simulation'}
        </button>
      </div>
    </OnboardingScreen>
  );
}
