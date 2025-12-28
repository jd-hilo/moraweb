import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { trackEvent, identifyUser, Events } from '../lib/mixpanel';

export function AuthScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp] = useState(true);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    trackEvent(Events.SIGN_UP_STARTED, { email });
    // Move to password step
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // First, try to sign in (check if user already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.user) {
        // User exists, sign them in and route to dashboard
        identifyUser(signInData.user.id, { email: signInData.user.email });
        trackEvent(Events.SIGN_IN_COMPLETED, { 
          user_id: signInData.user.id,
          email: signInData.user.email 
        });
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('core_json')
          .eq('user_id', signInData.user.id)
          .maybeSingle();

        if (profile && profile.core_json) {
          // User has completed onboarding, go to dashboard
          navigate('/dashboard');
        } else {
          // User needs to complete onboarding
          navigate('/welcome');
        }
        setIsLoading(false);
        return;
      }

      // If sign in failed, try to sign up (user doesn't exist)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (signUpData.user) {
        identifyUser(signUpData.user.id, { email: signUpData.user.email });
        trackEvent(Events.SIGN_UP_COMPLETED, { 
          user_id: signUpData.user.id,
          email: signUpData.user.email 
        });
        navigate('/welcome');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6" style={{ paddingTop: '60px' }}>
      {/* Back button for password step */}
      {step === 'password' && (
        <button
          onClick={() => setStep('email')}
          className="absolute top-8 left-6 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-24">
        {/* Title and Subtitle */}
        <div className="mb-12">
          <h1 
            className="text-black mb-2"
            style={{ 
              fontSize: '32px', 
              fontWeight: 700,
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off'
            }}
          >
            {step === 'email' ? "Let's get started" : 'Enter your password'}
          </h1>
          <p 
            className="text-black"
            style={{ 
              fontSize: '16px', 
              fontWeight: 600,
              opacity: 0.7
            }}
          >
            {step === 'email' 
              ? 'Enter your email to continue' 
              : email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={step === 'email' ? handleEmailSubmit : handlePasswordSubmit} className="flex-1 flex flex-col">
          {step === 'email' ? (
            <div className="mb-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.3px',
                  color: 'rgba(0, 0, 0, 0.5)'
                }}
              />
              <style>{`
                input::placeholder {
                  color: rgba(0, 0, 0, 0.5);
                }
                input:focus {
                  color: #000000;
                }
              `}</style>
            </div>
          ) : (
            <div className="mb-auto space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.3px',
                  color: 'rgba(0, 0, 0, 0.5)'
                }}
              />
              <style>{`
                input::placeholder {
                  color: rgba(0, 0, 0, 0.5);
                }
                input:focus {
                  color: #000000;
                }
              `}</style>

              {/* Terms and Forgot Password */}
              <div className="space-y-4">
                <p 
                  className="text-black"
                  style={{ fontSize: '12px', opacity: 0.7 }}
                >
                  By continuing, you agree to our{' '}
                  <a 
                    href="#" 
                    className="font-semibold"
                    style={{ 
                      background: 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
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
                      backgroundClip: 'text'
                    }}
                  >
                    Privacy Policy
                  </a>
                </p>
                <a 
                  href="#" 
                  className="block font-semibold"
                  style={{ 
                    fontSize: '14px',
                    background: 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Continue Button - Floating at bottom */}
          <button
            type="submit"
            disabled={isLoading || (step === 'email' ? !email : !password)}
            className="w-full py-4 px-6 rounded-3xl text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isLoading || (step === 'email' ? !email : !password)
                ? 'rgba(0, 0, 0, 0.1)'
                : 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
              fontSize: '17px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
              color: isLoading || (step === 'email' ? !email : !password) ? 'rgba(0, 0, 0, 0.5)' : '#FFFFFF'
            }}
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}
