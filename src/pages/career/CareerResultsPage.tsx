import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CareerSimulation, AlternatePath } from '../../types/career';
import { CareerOutcomeCard } from '../../components/career/CareerOutcomeCard';
import { ZoomInCards } from '../../components/career/ZoomInCards';
import { CareerTimeline } from '../../components/career/CareerTimeline';
import { GlobalComparisonSection } from '../../components/career/GlobalComparisonSection';
import { RegretMomentsSection } from '../../components/career/RegretMoments';
import { SocietalImpactSection } from '../../components/career/SocietalImpactSection';
import { AlternatePathsSection } from '../../components/career/AlternatePathsSection';
import { useOnboarding } from '../../context/OnboardingContext';
import { useCareerPro } from '../../hooks/useCareerPro';
import { supabase } from '../../lib/supabase';
import { trackEvent, Events } from '../../lib/mixpanel';
import { ArrowLeft, Bookmark, Check, X, ChevronRight, Mail, Lock, Loader2 } from 'lucide-react';

export function CareerResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: onboardingData } = useOnboarding();
  const { hasAccess: isPro } = useCareerPro();
  const [simulation, setSimulation] = useState<CareerSimulation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [savedSimulationId, setSavedSimulationId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    trackEvent(Events.CAREER_RESULTS);
  }, []);

  useEffect(() => {
    const { careerSimulation, simulationId: stateId } = location.state || {};
    const queryId = searchParams.get('simulationId');
    const simulationId = stateId || queryId;

    if (simulationId) setSavedSimulationId(simulationId);

    if (careerSimulation) {
      setSimulation(careerSimulation);
      setTimeout(() => setIsLoaded(true), 100);
      return;
    }

    // Try localStorage fallback
    const saved = localStorage.getItem('careerSimulation');
    if (saved) {
      setSimulation(JSON.parse(saved));
      setTimeout(() => setIsLoaded(true), 100);
      return;
    }

    // Fetch from DB when coming via share link (e.g. ?simulationId=xxx)
    if (simulationId) {
      supabase
        .from('websims')
        .select('scenarios')
        .eq('id', simulationId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate('/dashboard');
            return;
          }
          const scenarios = data.scenarios;
          if (scenarios?.outcome != null || scenarios?.timeHorizon != null) {
            setSimulation(scenarios as CareerSimulation);
            setTimeout(() => setIsLoaded(true), 100);
          } else {
            navigate('/dashboard');
          }
        });
      return;
    }

    navigate('/dashboard');
  }, [location.state, navigate, searchParams]);

  // Scroll to Branches section when arriving from dashboard "Branches" button
  useEffect(() => {
    const scrollToBranches = (location.state as { scrollToBranches?: boolean })?.scrollToBranches;
    if (!scrollToBranches || !simulation?.alternatePaths?.length) return;
    const el = document.getElementById('alternate-paths');
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [location.state, simulation]);

  // Check if saved, and auto-save if user is logged in with an unclaimed sim
  useEffect(() => {
    async function checkAndSave() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (!savedSimulationId) return;
      if (!simulation) return;

      // Check if already claimed by this user
      const { data } = await supabase
        .from('websims')
        .select('user_id')
        .eq('id', savedSimulationId)
        .maybeSingle();

      if (data?.user_id === user.id) {
        setIsSaved(true);
        return;
      }

      // Row exists but not claimed by this user – auto-save to link it
      if (data && data.user_id === null) {
        try {
          const { error } = await supabase
            .from('websims')
            .update({ user_id: user.id })
            .eq('id', savedSimulationId);
          if (!error) setIsSaved(true);
        } catch (e) {
          console.warn('Auto-save failed:', e);
        }
      }
    }
    checkAndSave();
  }, [savedSimulationId, simulation]);

  // Save to localStorage for persistence
  useEffect(() => {
    if (simulation) {
      localStorage.setItem('careerSimulation', JSON.stringify(simulation));
    }
  }, [simulation]);

  // Scroll animation observer
  useEffect(() => {
    if (!isLoaded) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [isLoaded]);

  const handleSave = async () => {
    if (isSaved || isSaving) return;

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // User is logged in — save directly
      await saveSimulationToUser(user.id);
    } else {
      // Not logged in — show auth modal
      setShowAuthModal(true);
    }
  };

  const saveSimulationToUser = async (userId: string): Promise<boolean> => {
    if (!simulation) return false;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (savedSimulationId) {
        // Update the existing anonymous row to claim it
        const { error } = await supabase
          .from('websims')
          .update({ user_id: userId })
          .eq('id', savedSimulationId);

        if (!error) {
          setIsSaved(true);
          return true;
        }

        // Fallback: insert a new row when update fails
        console.warn('Error claiming simulation, inserting new:', error);
      }

      // Insert new simulation (either no existing row or update fallback)
      const inserted = await insertNewSimulation(userId);
      if (inserted) {
        setIsSaved(true);
        return true;
      }

      setSaveError('Could not save simulation. Please try again.');
      return false;
    } catch (err) {
      console.error('Error saving simulation:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save simulation');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const insertNewSimulation = async (userId: string): Promise<boolean> => {
    if (!simulation) return false;

    const { data: saved, error } = await supabase
      .from('websims')
      .insert({
        user_id: userId,
        scenarios: simulation,
        summary: `Career simulation: ${simulation.outcome?.title || 'Career Projection'}`,
        simulation_type: 'career',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting simulation:', error);
      return false;
    }

    if (saved) {
      setSavedSimulationId(saved.id);
      return true;
    }

    return false;
  };

  const handleAuthSuccess = async (userId: string) => {
    setShowAuthModal(false);
    await saveSimulationToUser(userId);
  };

  const handleAlternatePath = (path: AlternatePath) => {
    if (!isPro) {
      setShowPaywallModal(true);
      return;
    }
    localStorage.setItem('baseCareerSimulation', JSON.stringify(simulation));
    navigate('/career/generating', {
      state: {
        alternateFrom: {
          decisionLabel: path.label,
          decisionYear: path.year,
          decisionKey: path.decision,
          baseSimulation: simulation,
        },
      },
    });
  };

  if (!simulation) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading simulation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Career Projection
            </p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-teal-500/10 to-green-500/10 text-teal-700 border border-teal-200 mt-0.5">
              {simulation.timeHorizon} YEAR HORIZON
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`p-2 rounded-full transition-colors ${
              isSaved ? 'bg-teal-50' : 'hover:bg-gray-100'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isSaved ? (
              <Bookmark className="w-5 h-5 text-teal-600 fill-teal-600" />
            ) : isSaving ? (
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-2xl mx-auto px-6 py-8 space-y-12 transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        {/* Section 1: Career Outcome */}
        <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
          <CareerOutcomeCard
            outcome={simulation.outcome}
            stats={simulation.stats}
            timeHorizon={simulation.timeHorizon}
            confidence={simulation.confidence}
          />
        </section>

        {/* Section 2: Zoom-In Cards */}
        {simulation.zoomIns && (
          <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Zoom In" subtitle="Peek into the details of your future" />
            <ZoomInCards zoomIns={simulation.zoomIns} />
          </section>
        )}

        {/* Section 3: Career Timeline */}
        {simulation.timeline?.milestones?.length > 0 && (
          <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Career Timeline" subtitle="Your progression year by year" />
            <CareerTimeline milestones={simulation.timeline.milestones} />
          </section>
        )}

        {/* Section 4: Global Comparison */}
        {simulation.globalComparison && (
          <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Global Comparison" subtitle="How you stack up against the world" />
            <GlobalComparisonSection data={simulation.globalComparison} />
          </section>
        )}

        {/* Section 5: Regret Moments */}
        {simulation.zoomIns?.regretMoments?.length > 0 && (
          <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Regret Moments" subtitle="The roads not taken" />
            <RegretMomentsSection
              regrets={simulation.zoomIns.regretMoments}
              reflection={simulation.zoomIns.reflection}
            />
          </section>
        )}

        {/* Section 6: Societal Impact */}
        {simulation.societalImpact && (
          <section className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Your Impact" subtitle="The mark you leave on the world" />
            <SocietalImpactSection data={simulation.societalImpact} />
          </section>
        )}

        {/* Section 7: Alternate Paths */}
        {simulation.alternatePaths?.length > 0 && (
          <section id="alternate-paths" className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <SectionHeader title="Alternate Paths" subtitle="What if you made a different choice?" />
            <AlternatePathsSection
              paths={simulation.alternatePaths}
              onSelectPath={handleAlternatePath}
              isPro={isPro ?? false}
            />
          </section>
        )}

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          {isSaved ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 font-semibold">
              <Check className="w-5 h-5" />
              Simulation Saved
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
            >
              <span className="flex items-center gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Simulation'}
              </span>
            </button>
          )}
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showAuthModal && (
        <SaveAuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Paywall Modal - Alternate paths locked */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowPaywallModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-center">Explore alternate paths with Mora+</h3>
              <p className="text-gray-500 text-center text-sm">
                Mora+ lets you re-generate simulations from any decision point and try different choices.
              </p>
              <button
                onClick={() => {
                  setShowPaywallModal(false);
                  navigate('/career/paywall');
                }}
                className="w-full py-3 rounded-2xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
              >
                Upgrade to Mora+ — $1 for 7-day trial
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(2rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// --------------- Inline Auth Modal ---------------

function SaveAuthModal({
  onSuccess,
  onClose,
}: {
  onSuccess: (userId: string) => void;
  onClose: () => void;
}) {
  const { data: onboardingData } = useOnboarding();
  const onboardingEmail = onboardingData.email?.trim() || '';
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(onboardingEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email from onboarding when it becomes available
  useEffect(() => {
    if (onboardingEmail && !email) setEmail(onboardingEmail);
  }, [onboardingEmail, email]);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOtp = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        setError(otpError.message);
        setIsLoading(false);
        return;
      }

      setStep('otp');
      setResendCooldown(60);
      setIsLoading(false);
      // Focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendOtp();
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < Math.min(pasted.length, 6); i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: cleanCode,
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      if (data.user) {
        setIsLoading(false);
        onSuccess(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtpDigits(['', '', '', '', '', '']);
    setError(null);
    sendOtp();
  };

  const otpCode = otpDigits.join('');

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white w-full max-w-md rounded-t-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 pb-safe shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>

        <div className="space-y-4 sm:space-y-5">
          {/* Header */}
          <div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center mb-3 sm:mb-4">
              {step === 'email' ? (
                <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              ) : (
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              )}
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-black"
              style={{
                fontFamily: 'Recoleta, Georgia, serif',
                fontVariantLigatures: 'none',
                WebkitFontFeatureSettings: '"liga" off',
                fontFeatureSettings: '"liga" off',
              }}
            >
              {step === 'email' ? 'Save your simulation' : 'Check your email'}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {step === 'email'
                ? "Enter your email and we'll send you a verification code. No password needed."
                : (
                  <>
                    We sent a verification code to{' '}
                    <span className="font-semibold text-gray-700">{email}</span>
                  </>
                )}
            </p>
          </div>

          {/* Form */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3 sm:space-y-4">
              <input
                type="email"
                enterKeyHint="done"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors text-sm sm:text-base"
              />

              <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                By continuing, you agree to our{' '}
                <a
                  href="https://pastoral-supply-662.notion.site/Terms-of-Service-Mora-2d72cec59ddf80099945c84fe81add84?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-600 hover:underline"
                >
                  Terms of Service
                </a>
              </p>

              {error && (
                <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                style={{
                  background: isLoading || !email
                    ? 'rgba(0, 0, 0, 0.1)'
                    : 'linear-gradient(135deg, #25729f, #62edb9)',
                  color: isLoading || !email ? 'rgba(0, 0, 0, 0.4)' : '#FFFFFF',
                  minHeight: '48px',
                }}
              >
                {isLoading ? 'Sending code...' : 'Send Verification Code'}
                {!isLoading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* OTP Input */}
              <div className="flex justify-center gap-1.5 sm:gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    enterKeyHint="done"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-[42px] sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 transition-all focus:outline-none ${
                      digit
                        ? 'border-teal-400 bg-teal-50/50 text-black'
                        : 'border-gray-200 bg-white text-black focus:border-black'
                    }`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              )}

              {/* Resend + Change email */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    resendCooldown > 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-teal-600 hover:text-teal-800'
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't get the code? Resend"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpDigits(['', '', '', '', '', '']);
                    setError(null);
                  }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2
        className="text-xl md:text-2xl font-bold text-black"
        style={{
          fontFamily: 'Recoleta, Georgia, serif',
          fontVariantLigatures: 'none',
          WebkitFontFeatureSettings: '"liga" off',
          fontFeatureSettings: '"liga" off',
        }}
      >
        {title}
      </h2>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}
