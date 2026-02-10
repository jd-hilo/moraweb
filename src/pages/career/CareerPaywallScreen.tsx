import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  Check,
  Shield,
  ArrowRight,
  ChevronDown,
  Building2,
  MapPin,
  Star,
  Zap,
  Users,
  Heart,
  Gift,
  CreditCard,
} from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';
import { useCareerPro, setCareerProVerified } from '../../hooks/useCareerPro';
import moraLogo from '../../assets/mora.png';

// Same-origin uses Vite proxy in dev (-> localhost:3001) and Vercel serverless in prod
// Only use explicit URL when pointing to a different backend (e.g. deployed API)
const API_BASE_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes('localhost:3001')
    ? import.meta.env.VITE_PROXY_URL
    : '';

const COUNTDOWN_KEY = 'careerPaywallCountdownEnd';
const COUNTDOWN_MINUTES = 15;

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    q: 'How is this different from a generic career quiz?',
    a: "Traditional career quizzes give you a personality type and generic job titles. Mora builds a full simulation — year-by-year timelines, specific salary figures, daily life snapshots, performance reviews, and the exact decision points that will shape your career. Our model is informed by real HR frameworks used by Fortune 500 companies, including talent management, succession planning, and performance management methodology.",
  },
  {
    q: 'How accurate are the projections?',
    a: "Our career modeling draws on real industry compensation data, organizational behavior research, and leadership assessment frameworks used by executive coaches. Users report 85%+ accuracy on salary ranges and career trajectory timing. Results are probabilistic projections, not guarantees — but they're far more nuanced than anything else available.",
  },
  {
    q: 'What does my simulation include?',
    a: 'Your full simulation includes: a year-by-year career timeline with milestones, detailed salary progression, daily life snapshots, team and manager dynamics, performance review predictions, the emails and conversations that change your trajectory, key regret moments, and the ability to explore alternate paths from any decision point.',
  },
  {
    q: 'How soon will I see my results?',
    a: 'Instantly. Your personalized career simulation generates in under 60 seconds after payment. No waiting, no scheduling calls.',
  },
  {
    q: 'What happens after the trial?',
    a: "After your 7-day trial, you'll be billed $29/month for continued Mora+ access. This gives you unlimited re-simulations, alternate path exploration, and access to all saved projections. You can cancel anytime.",
  },
  {
    q: 'How do I cancel my subscription?',
    a: "Cancel anytime with one click through the Stripe billing portal — no phone calls, no retention tricks, no questions asked. You'll find the link in your email receipt or account settings. Your access continues through the end of your billing period.",
  },
];

/* ── Countdown helpers ── */
function getCountdownEnd(): number {
  const stored = sessionStorage.getItem(COUNTDOWN_KEY);
  if (stored) return parseInt(stored, 10);
  const end = Date.now() + COUNTDOWN_MINUTES * 60 * 1000;
  sessionStorage.setItem(COUNTDOWN_KEY, String(end));
  return end;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Component ── */
export function CareerPaywallScreen() {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const { hasAccess } = useCareerPro();
  const [isLoading, setIsLoading] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [error, setError] = useState('');
  const [countdownMs, setCountdownMs] = useState(() =>
    Math.max(0, getCountdownEnd() - Date.now()),
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [compRevealed, setCompRevealed] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const email = data.email?.trim();

  useEffect(() => {
    trackEvent(Events.CAREER_PAYWALL);
    const t = setTimeout(() => setCompRevealed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!email) navigate('/career/email', { replace: true });
  }, [email, navigate]);

  // Bypass paywall for premium users (session storage, profile, or Stripe subscription)
  useEffect(() => {
    if (!email) return;

    // Already premium from session or logged-in profile
    if (hasAccess === true) {
      setCareerProVerified();
      navigate('/career/generating', { replace: true });
      return;
    }

    // If hook says false, check Stripe for returning users (e.g. new session, not logged in)
    if (hasAccess === false && !accessChecked) {
      setAccessChecked(true);
      fetch(`${API_BASE_URL}/api/stripe/check-career-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.hasAccess) {
            setCareerProVerified();
            navigate('/career/generating', { replace: true });
          }
        })
        .catch(() => {});
    }
  }, [email, hasAccess, accessChecked, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getCountdownEnd() - Date.now();
      setCountdownMs(Math.max(0, remaining));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckout = async () => {
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stripe/create-career-checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Checkout failed: ${response.status}`);
      }
      const { url } = await response.json();
      if (url) window.location.href = url;
      else throw new Error('No checkout URL received');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        button.paywall-credit-debit-btn { min-height: 40px; height: 40px; }
      `}</style>
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-black">
            Your <span className="text-blue-600 font-bold">Career Sim</span> offer: $1.00!
          </span>
          <span className="text-xs sm:text-sm font-semibold text-black"> Ends in </span>
          <span className="text-sm sm:text-base font-bold text-black tabular-nums">
            {formatCountdown(countdownMs)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
        >
          Continue
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 pb-0">

        {/* ═══════════════════════════════════════ */}
        {/* HERO — full above-the-fold             */}
        {/* ═══════════════════════════════════════ */}
        <section className="pt-6 sm:pt-10 text-center">
          <h1
            className="text-2xl sm:text-3xl font-bold text-black leading-tight"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Your Career Simulation
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">is Ready</span>
          </h1>
          <p className="text-[11px] text-gray-400 mt-1.5">Results may surprise you</p>

          {/* Blurred simulation preview card */}
          <div className="relative my-5 sm:my-7 mx-auto max-w-[260px] sm:max-w-[300px]">
            <div className="bg-gray-900 rounded-xl p-1.5 shadow-2xl border border-gray-700/50 transform rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="bg-white rounded-lg overflow-hidden relative min-h-[140px]">
                {!compRevealed ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Simulating...</p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 space-y-1.5 select-none">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Your Career Outcome</p>
                    <h4 className="text-sm sm:text-base font-bold text-black leading-tight" style={{ filter: 'blur(6px)' }}>Senior Engineering Manager</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" /> <span style={{ filter: 'blur(6px)' }}>Horizon Labs</span></span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> <span style={{ filter: 'blur(6px)' }}>San Francisco</span></span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-black" style={{ filter: 'blur(6px)' }}>$285K</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200" style={{ filter: 'blur(6px)' }}>+12%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100">
                      {[
                        { label: 'Promotions', val: '3' },
                        { label: 'Team Size', val: '12' },
                        { label: 'Hours/Wk', val: '50' },
                        { label: 'Burnout', val: 'Med' },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[7px] text-gray-400">{s.label}</p>
                          <p className="text-xs font-bold text-black" style={{ filter: 'blur(6px)' }}>{s.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA — smaller text, wider on mobile */}
          <button
            onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="w-full max-w-[300px] sm:max-w-[260px] mx-auto rounded-2xl font-bold text-white flex items-center justify-center gap-2 py-3 text-sm transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
          >
            Let's begin
          </button>

          {/* Stats bullets — left-aligned with icons */}
          <div className="mt-5 space-y-2 max-w-[240px] mx-auto text-left">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-black flex-shrink-0" />
              <span className="text-xs text-gray-600"><strong className="text-black">800+</strong> simulations run today</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-black flex-shrink-0" />
              <span className="text-xs text-gray-600">Trusted by <strong className="text-black">8,200</strong> professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-600"><strong className="text-black">4.9 / 5</strong> stars</span>
            </div>
          </div>

        </section>

        {/* ═══════════════════════════════════════ */}
        {/* LOGO CAROUSEL                          */}
        {/* ═══════════════════════════════════════ */}
        <section className="py-6 -mx-4 sm:mx-0 overflow-hidden">
          <p className="text-center text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-4">As seen on</p>
          <div className="relative w-full">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex w-max animate-scroll">
              {[0, 1].map((set) => (
                <div key={set} className="flex items-center gap-12 mx-6 opacity-40 grayscale">
                  <span className="text-base font-bold font-serif text-black whitespace-nowrap">Forbes</span>
                  <span className="text-base font-bold tracking-tighter text-[#029f73] font-serif whitespace-nowrap">TechCrunch</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-[#DA552F] flex items-center justify-center text-white font-bold text-[9px] shrink-0">P</div>
                    <span className="text-sm font-bold text-[#DA552F] whitespace-nowrap">Product Hunt</span>
                  </div>
                  <span className="text-base font-bold font-mono tracking-tighter border border-black px-1 text-black whitespace-nowrap">WIRED</span>
                  <span className="text-sm font-bold uppercase tracking-wide text-[#e1005b] whitespace-nowrap">The Verge</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* WHY DOES EVERYONE LOVE MORA?           */}
        {/* ═══════════════════════════════════════ */}
        <section className="py-6 sm:py-10">
          <h2
            className="text-lg sm:text-xl font-bold text-black text-center mb-5 sm:mb-6"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Why does everyone love Mora?
          </h2>
          <div className="space-y-3">
            {[
              { icon: Zap, color: 'text-amber-500', title: 'Instant results', desc: 'Your full career simulation in under 60 seconds.' },
              { icon: Star, color: 'text-purple-500', title: 'Eerily accurate', desc: '91% of users say the projections matched their real career.' },
              { icon: Gift, color: 'text-emerald-500', title: 'Alternate paths', desc: 'See what happens if you take the other offer, switch roles, or go freelance.' },
              { icon: Heart, color: 'text-rose-500', title: 'Real daily life', desc: 'Not just salary — see your schedule, team, stress levels, and culture.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* YOUR UNIQUE CAREER SIMULATION REVEAL   */}
        {/* ═══════════════════════════════════════ */}
        <section ref={pricingRef} className="py-8 sm:py-12">
          <h2
            className="text-xl sm:text-2xl font-bold text-black mb-6"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Your Unique Career Simulation Reveal
          </h2>

          <div className="space-y-4 mb-6">
            {[
              'Receive a full year-by-year career timeline with salary projections personalized to you',
              'Discover daily life snapshots, team dynamics, and performance reviews at each stage',
              'Test thousands of variants of your career path',
              'Your 7-day trial will cost only $1.00. Afterwards, it will be $29/month',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-800 leading-snug">{item}</span>
              </div>
            ))}
          </div>

          {/* Total due */}
          <div className="border-t border-gray-200 pt-4 mb-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-black">Total due:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 line-through">$14.99</span>
                <span className="text-xl font-extrabold text-black">$1.00</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium text-right mt-0.5">You save 93%</p>
          </div>

          {/* Credit or Debit button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="paywall-credit-debit-btn w-full rounded-lg font-semibold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:bg-blue-700 active:scale-[0.99] bg-blue-600"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Checkout</span>
              </>
            )}
          </button>
          {error && (
            <p className="mt-3 text-red-500 text-sm text-center">{error}</p>
          )}
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FAQ                                    */}
        {/* ═══════════════════════════════════════ */}
        <section className="py-6 sm:py-10 border-t border-gray-100">
          <h2
            className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-5"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-1.5 sm:space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === i ? null : i)
                  }
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-left font-medium text-gray-900"
                >
                  <span className="pr-4 text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-gray-500 transition-transform ${
                      openFaqIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2 sm:pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* COMPARISON CHART                       */}
        {/* ═══════════════════════════════════════ */}
        <section className="py-6 sm:py-10 border-t border-gray-100">
          <h2
            className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-5"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Mora vs. Career Coach
          </h2>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 text-center text-xs font-semibold bg-gray-50 border-b border-gray-200">
              <div className="py-2.5 px-2" />
              <div className="py-2.5 px-2 text-gray-500">Career Coach</div>
              <div className="py-2.5 px-2 text-emerald-600 bg-emerald-50">Mora+</div>
            </div>
            {[
              ['Cost', '$150–$500/hr', '$1 to start'],
              ['Speed', 'Weeks', 'Under 60 seconds'],
              ['Salary data', 'General ranges', 'Personalized'],
              ['Alternate paths', 'Hypothetical', 'Full timelines'],
              ['Availability', 'Appointment', 'Instant, 24/7'],
            ].map(([feature, coach, mora]) => (
              <div
                key={feature}
                className="grid grid-cols-3 text-center text-xs border-b border-gray-100 last:border-b-0"
              >
                <div className="py-2.5 px-2 font-medium text-gray-700 text-left pl-3 sm:pl-4">
                  {feature}
                </div>
                <div className="py-2.5 px-2 text-gray-400">{coach}</div>
                <div className="py-2.5 px-2 text-emerald-700 font-semibold bg-emerald-50/50">
                  {mora}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">
            Mora uses proprietary simulation technology to generate career projections. Results are probabilistic and not guaranteed. Our simulations are for entertainment and informational purposes only and should not replace professional career or financial advice. Past accuracy does not guarantee future outcomes.
          </p>
        </section>

      </div>

      {/* ═══════════════════════════════════════ */}
      {/* PROFESSIONAL FOOTER                    */}
      {/* ═══════════════════════════════════════ */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center justify-center mb-4">
            <img src={moraLogo} alt="Mora" className="h-6 w-auto opacity-60" />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
            <button onClick={() => navigate('/terms')} className="hover:text-gray-600 transition-colors">Terms</button>
            <span className="text-gray-300">·</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-gray-600 transition-colors">Privacy</button>
            <span className="text-gray-300">·</span>
            <a href="mailto:support@mora.app" className="hover:text-gray-600 transition-colors">Support</a>
          </div>
          <p className="text-center text-[11px] text-gray-300">
            © {new Date().getFullYear()} Mora. All rights reserved. For entertainment and informational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
