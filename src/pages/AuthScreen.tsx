import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronRight, ArrowLeft, Star, Mail } from 'lucide-react';
import { trackEvent, identifyUser, Events } from '../lib/mixpanel';
import { identifyReddit } from '../lib/reddit';

export function AuthScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [isLoading, setIsLoading] = useState(false);
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

      trackEvent(Events.SIGN_UP_STARTED, { email });
      setStep('otp');
      setResendCooldown(60);
      setIsLoading(false);
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
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

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
        identifyUser(data.user.id, { email: data.user.email });
        identifyReddit({ email: data.user.email ?? undefined, externalId: data.user.id });

        const userCreatedAt = new Date(data.user.created_at);
        const now = new Date();
        const secondsSinceCreation = (now.getTime() - userCreatedAt.getTime()) / 1000;
        const isNewUser = secondsSinceCreation < 60;

        if (isNewUser) {
          trackEvent(Events.SIGN_UP_COMPLETED, {
            user_id: data.user.id,
            email: data.user.email,
            is_new_user: true,
          });
          setIsLoading(false);
          navigate('/onboarding/name');
          return;
        }

        trackEvent(Events.SIGN_IN_COMPLETED, {
          user_id: data.user.id,
          email: data.user.email,
        });
        setIsLoading(false);
        navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 sm:px-6 pt-safe relative">
      {/* Back button */}
      <button
        onClick={() => {
          if (step === 'otp') {
            setStep('email');
            setOtpDigits(['', '', '', '', '', '']);
            setError(null);
          } else {
            navigate(-1);
          }
        }}
        className="absolute top-3 left-4 sm:top-6 sm:left-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full pb-8 sm:pb-12">
        {step === 'email' ? (
          /* ───────── Email Step ───────── */
          <div className="w-full space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1
                className="text-black mb-2 sm:mb-3"
                style={{
                  fontSize: 'clamp(22px, 6vw, 32px)',
                  fontWeight: 700,
                  fontFamily: 'Recoleta, Georgia, serif',
                  fontVariantLigatures: 'none',
                  WebkitFontFeatureSettings: '"liga" off',
                  fontFeatureSettings: '"liga" off',
                  lineHeight: '1.2',
                }}
              >
                Let's get started
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Enter your email — we'll send a code. No password needed.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
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
              </div>

              <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                By continuing, you agree to our{' '}
                <a
                  href="https://pastoral-supply-662.notion.site/Terms-of-Service-Mora-2d72cec59ddf80099945c84fe81add84?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a
                  href="#"
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Privacy Policy
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
                className="w-full py-3 sm:py-4 px-5 sm:px-6 rounded-2xl sm:rounded-3xl text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                style={{
                  background: isLoading || !email
                    ? 'rgba(0, 0, 0, 0.1)'
                    : 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: isLoading || !email ? 'rgba(0, 0, 0, 0.5)' : '#FFFFFF',
                  minHeight: '48px',
                }}
              >
                {isLoading ? 'Sending code...' : 'Send Verification Code'}
                {!isLoading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </form>

            {/* Social proof */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Trusted by 10,000+ other users
              </p>
            </div>
          </div>
        ) : (
          /* ───────── OTP Step ───────── */
          <div className="w-full space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <h1
                className="text-black mb-2 sm:mb-3"
                style={{
                  fontSize: 'clamp(22px, 6vw, 32px)',
                  fontWeight: 700,
                  fontFamily: 'Recoleta, Georgia, serif',
                  fontVariantLigatures: 'none',
                  WebkitFontFeatureSettings: '"liga" off',
                  fontFeatureSettings: '"liga" off',
                  lineHeight: '1.2',
                }}
              >
                Check your email
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                We sent a verification code to{' '}
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            {/* OTP Inputs */}
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
                  autoFocus={i === 0}
                  className={`h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg sm:rounded-xl border-2 transition-all focus:outline-none w-[42px] sm:w-[48px] ${
                    digit
                      ? 'border-purple-400 bg-purple-50/50 text-black'
                      : 'border-gray-200 bg-white text-black focus:border-black'
                  }`}
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
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            )}

            {/* Resend + Change email */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={`text-xs sm:text-sm font-semibold transition-colors ${
                  resendCooldown > 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : ''
                }`}
                style={resendCooldown > 0 ? {} : {
                  background: 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
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
  );
}
