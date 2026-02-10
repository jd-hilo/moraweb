import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { CareerSimulation } from '../../types/career';
import {
  Lock,
  Building2,
  MapPin,
  CreditCard,
  ChevronDown,
  Shield,
  Check,
  Smartphone,
  Mail,
  MessageSquare,
  GitBranch,
  Clock,
  Globe,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';
import { trackReddit } from '../../lib/reddit';
import { useCareerPro, setCareerProVerified } from '../../hooks/useCareerPro';
import moraLogo from '../../assets/mora.png';

const API_BASE_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes('localhost:3001')
    ? import.meta.env.VITE_PROXY_URL
    : '';

/* ── Minimal FAQ ── */
const FAQ_ITEMS = [
  {
    q: 'What do I get?',
    a: 'Your full career simulation including a year-by-year timeline with salary progression, daily life snapshots, team feedback, the email that changes your career, regret moments, global comparisons, and alternate career paths you can explore.',
  },
  {
    q: 'How does billing work?',
    a: "You pay $1 today for a 7-day trial. After the trial, it's $29/month for continued access to Mora+ features including unlimited re-simulations and alternate path exploration. You can cancel anytime.",
  },
  {
    q: 'How do I cancel?',
    a: "Cancel anytime with one click through the Stripe billing portal — no phone calls, no retention tricks, no questions asked. You'll find the link in your email receipt.",
  },
];

/* ── Expiry helpers ── */
const EXPIRY_KEY = 'careerPaywallExpiryEnd';
const EXPIRY_HOURS = 24;

function getExpiryEnd(): number {
  const stored = localStorage.getItem(EXPIRY_KEY);
  if (stored) return parseInt(stored, 10);
  const end = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000;
  localStorage.setItem(EXPIRY_KEY, String(end));
  return end;
}

function formatExpiry(ms: number): string {
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Component ── */
export function CareerPaywallScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useOnboarding();
  const { hasAccess } = useCareerPro();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState<CareerSimulation | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [expiryMs, setExpiryMs] = useState(() => Math.max(0, getExpiryEnd() - Date.now()));
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const email = data.email?.trim();

  // Load simulation from navigation state or localStorage
  useEffect(() => {
    const stateData = location.state as {
      simulation?: CareerSimulation;
      simulationId?: string;
    } | null;

    if (stateData?.simulation) {
      setSimulation(stateData.simulation);
      if (stateData.simulationId) setSimulationId(stateData.simulationId);
      return;
    }

    // Fallback: localStorage (e.g., user returned from Stripe cancel)
    const stored = localStorage.getItem('pendingCareerSimulation');
    const storedId = localStorage.getItem('pendingCareerSimulationId');
    if (stored) {
      try {
        setSimulation(JSON.parse(stored));
        if (storedId) setSimulationId(storedId);
      } catch {
        // corrupt data
      }
      return;
    }

    // No simulation data — can't show paywall
    navigate('/career/email', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track page view
  useEffect(() => {
    trackEvent(Events.CAREER_PAYWALL);
  }, []);

  // Redirect if already premium
  useEffect(() => {
    if (!email) return;
    if (hasAccess === true) {
      setCareerProVerified();
      navigate('/career/generating', { replace: true });
    }
  }, [hasAccess, email, navigate]);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/career/email', { replace: true });
  }, [email, navigate]);

  // Expiry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryMs(Math.max(0, getExpiryEnd() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckout = async () => {
    if (!email) return;
    setIsLoading(true);
    setError('');
    trackReddit('InitiateCheckout', { value: 29, currency: 'USD', conversion_id: 'career_pro' });
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

  if (!simulation || !email) return null;

  // ─── Computed stats ───
  const income = simulation.globalComparison?.income;
  const compAboveIndustry =
    income?.yourComp && income?.usAverage
      ? Math.round(((income.yourComp - income.usAverage) / income.usAverage) * 100)
      : null;
  const incomePercentile = income?.globalPercentile;
  const hasPositiveComp = compAboveIndustry !== null && compAboveIndustry > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Sticky expiry bar ── */}
      <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">⏳</span>
          <span className="text-xs sm:text-sm font-semibold text-amber-900">
            Results expire in <span className="tabular-nums">{formatExpiry(expiryMs)}</span>
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="px-3 py-1 rounded-lg text-[10px] font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
        >
          Reveal
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 pb-12 pt-4 scroll-mt-16">

        {/* ═══════════════════════════════════════ */}
        {/* HERO                                   */}
        {/* ═══════════════════════════════════════ */}
        <section className="pt-6 sm:pt-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            {simulation.timeHorizon}-Year Career Projection
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-black leading-tight"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Your Career Results
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Are Ready
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Here's a quick snapshot of your projection</p>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* BIG STAT — compensation vs industry     */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-7">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden text-center">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(0, 255, 136, 0.08), transparent, rgba(57, 255, 20, 0.05))' }} />
            <div className="relative z-10">
            {hasPositiveComp ? (
              <>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none" style={{ color: '#00FF88' }}>
                  +{compAboveIndustry}%
                </p>
                <p className="text-[11px] font-medium text-gray-600 mt-1.5">
                  above industry average compensation
                </p>
              </>
            ) : incomePercentile ? (
              <>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none" style={{ color: '#00FF88' }}>
                  Top {incomePercentile}%
                </p>
                <p className="text-[11px] font-medium text-gray-600 mt-1.5">
                  of earners in your field
                </p>
              </>
            ) : (
              <>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none" style={{ color: '#00FF88' }}>
                  ${Math.round(simulation.outcome.totalComp / 1000)}K
                </p>
                <p className="text-[11px] font-medium text-gray-600 mt-1.5">
                  projected total compensation
                </p>
              </>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Based on your projected {simulation.timeHorizon}-year trajectory
            </p>
            <button
              onClick={() => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-4 px-5 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
            >
              Reveal Career Simulation
            </button>

            {/* Credibility stats */}
            <div className="mt-6 pt-6 space-y-2 text-left" style={{ borderTop: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00FF88' }} />
                <span className="text-[11px] text-gray-600"><strong className="text-gray-800">600+</strong> simulations run today</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00FF88' }} />
                <span className="text-[11px] text-gray-600"><strong className="text-gray-800">8,200</strong> professionals helped</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00FF88' }} />
                <span className="text-[11px] text-gray-600"><strong className="text-gray-800">$1 billion</strong> in projected earnings</span>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* BLURRED OUTCOME CARD                   */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Your Career Outcome
          </p>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
            {/* Lock overlay */}
            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <h3
              className="text-lg font-bold text-black pr-10"
              style={{ filter: 'blur(7px)', userSelect: 'none' }}
            >
              {simulation.outcome.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
              <span className="flex items-center gap-1" style={{ filter: 'blur(6px)', userSelect: 'none' }}>
                <Building2 className="w-3 h-3" />
                {simulation.outcome.company}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1" style={{ filter: 'blur(6px)', userSelect: 'none' }}>
                <MapPin className="w-3 h-3" />
                {simulation.outcome.location}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span
                className="text-3xl font-bold text-black"
                style={{ filter: 'blur(8px)', userSelect: 'none' }}
              >
                ${simulation.outcome.totalComp.toLocaleString()}
              </span>
              {hasPositiveComp && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"
                  style={{ filter: 'blur(5px)', userSelect: 'none' }}
                >
                  +{compAboveIndustry}%
                </span>
              )}
            </div>

            {/* Mini stats grid */}
            <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-gray-100">
              {[
                { label: 'Promotions', val: String(simulation.stats.growth.promotions) },
                { label: 'Team Size', val: String(simulation.stats.growth.teamSize) },
                { label: 'Hours/Wk', val: String(simulation.stats.workLife.hoursPerWeek) },
                { label: 'Burnout', val: simulation.stats.workLife.burnoutRisk },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[8px] text-gray-400">{s.label}</p>
                  <p
                    className="text-sm font-bold text-black"
                    style={{ filter: 'blur(6px)', userSelect: 'none' }}
                  >
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* BLURRED TIMELINE                       */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Career Timeline
          </p>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="relative pl-5 space-y-4">
              <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-teal-400 to-emerald-400 opacity-30" />
              {simulation.timeline.milestones.slice(0, 4).map((m, i) => (
                <div key={m.year} className="relative flex items-start gap-3">
                  <div className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-[2.5px] border-teal-500 z-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">
                        Yr {m.year}
                      </span>
                      <span
                        className="text-sm font-bold text-black truncate"
                        style={{ filter: 'blur(6px)', userSelect: 'none' }}
                      >
                        {m.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <span style={{ filter: 'blur(5px)', userSelect: 'none' }}>{m.company}</span>
                      <span
                        className="font-bold text-gray-600"
                        style={{ filter: 'blur(5px)', userSelect: 'none' }}
                      >
                        ${m.salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {simulation.timeline.milestones.length > 4 && (
              <p className="text-[10px] text-gray-400 mt-3 text-center">
                +{simulation.timeline.milestones.length - 4} more milestones in full report
              </p>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* ALSO IN YOUR REPORT                    */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Also In Your Full Report
          </p>
          <div className="space-y-3">
            {/* Daily Life Snapshot */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-800">A Random Tuesday</span>
                <Lock className="w-3 h-3 text-gray-300 ml-auto" />
              </div>
              <div className="space-y-1.5">
                {[
                  { app: 'Slack', body: 'Design review, 3 mockups shared', time: '9:30 AM' },
                  { app: 'Gmail', body: 'Board update due Friday', time: '10:15 AM' },
                ].map((n) => (
                  <div key={n.app} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                    <span className="text-[9px] font-bold text-gray-500 w-8">{n.app}</span>
                    <span className="text-[9px] text-gray-400 flex-1 truncate">{n.body}</span>
                    <span className="text-[8px] text-gray-300">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Email */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-800">The Email That Changes Everything</span>
                <Lock className="w-3 h-3 text-gray-300 ml-auto" />
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                <p className="text-[9px] text-gray-500"><span className="font-semibold">From:</span> david.chen@company.io</p>
                <p className="text-[9px] font-semibold text-gray-700 mt-1">We'd like you to lead the platform team</p>
                <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-2">After seeing how you handled Q1, on time, zero incidents…</p>
              </div>
            </div>

            {/* Remaining items - compact list */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm space-y-2.5">
              {[
                { Icon: MessageSquare, text: 'What your team really says about you' },
                { Icon: GitBranch, text: 'Alternate career paths to explore' },
                { Icon: Clock, text: 'Regret moments, the roads not taken' },
                { Icon: Globe, text: 'Global comparison, how you stack up' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5">
                  <item.Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{item.text}</span>
                  <Lock className="w-3 h-3 text-gray-300 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* CHECKOUT                               */}
        {/* ═══════════════════════════════════════ */}
        <section id="checkout" className="mt-10 bg-white rounded-2xl p-6 border border-gray-200 shadow-md scroll-mt-20">
          <h2
            className="text-xl font-bold text-black mb-1"
            style={{ fontFamily: 'Recoleta, Georgia, serif' }}
          >
            Unlock Your Full Report
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Complete payment to save and access your full career simulation.
          </p>

          {/* Total due */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-semibold text-black">Total due today:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-400 line-through">$14.99</span>
              <span className="text-2xl font-extrabold text-black">$1.00</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mb-5">
            7-day trial, then $29/month. Cancel anytime.
          </p>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full rounded-lg font-bold text-white flex items-center justify-center gap-2 py-2.5 text-sm transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Checkout
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secure
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" /> Instant access
            </span>
            <span className="text-gray-300">·</span>
            <span>Cancel anytime</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FAQ                                    */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-8">
          <div className="space-y-1.5">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left font-medium text-gray-900"
                >
                  <span className="pr-4 text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${
                      openFaqIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* Mora vs. Career Coach                  */}
        {/* ═══════════════════════════════════════ */}
        <section className="mt-8 sm:mt-10 py-6 sm:py-10 border-t border-gray-100">
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
            Mora uses proprietary simulation technology to generate career projections. Results are probabilistic and not guaranteed. Our simulations are for entertainment and informational purposes only and should not replace professional career or financial advice.
          </p>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* Footer                                 */}
        {/* ═══════════════════════════════════════ */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-8 sm:mt-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-8 sm:py-10">
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
        </footer>
      </div>
    </div>
  );
}
