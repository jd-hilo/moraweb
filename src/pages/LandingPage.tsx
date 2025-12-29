import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TypewriterText } from '../components/TypewriterText';
import { GradientButton } from '../components/GradientButton';
import { ProgressBar } from '../components/ProgressBar';
import { Star } from 'lucide-react';
import moraLogo from '../assets/mora.png';
import { trackEvent, Events } from '../lib/mixpanel';

export function LandingPage() {
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  // Check if user is signed in and has completed onboarding - only then redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('core_json')
          .eq('user_id', user.id)
          .maybeSingle();

        // Only redirect to dashboard if onboarding is complete
        if (profile && profile.core_json) {
          navigate('/dashboard');
        }
        // Otherwise, stay on welcome page for onboarding
      }
    };
    checkAuth();
  }, [navigate]);

  const messages = [
    "let's build your digital twin",
    "we'll ask you questions to understand who you are",
    "so we can create an accurate digital version of you",
    "so you can run it through simulations",
    "please answer truthfully",
  ];

  const handleComplete = () => {
    setShowButton(true);
  };

  return (
    <div className="min-h-screen bg-white overlay-gradient flex flex-col px-6">
      <ProgressBar progress={0} />

      <div className="absolute top-8 left-8">
        <img src={moraLogo} alt="Mora" className="w-24 h-24 rounded-lg object-contain" />
      </div>

      <div className="absolute top-8 right-8 flex items-center" style={{ height: '96px' }}>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm font-semibold text-black">10,000+ lives simulated</span>
        </div>
      </div>

      <div className="max-w-3xl w-full pt-32 pb-16">
        <div className="min-h-[300px]">
          <TypewriterText
            texts={messages}
            speed={30}
            onComplete={handleComplete}
            className="text-xl md:text-3xl text-black leading-snug space-y-4"
            firstLineClassName="font-bold text-2xl md:text-4xl"
            firstLineStyle={{ 
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off'
            }}
            restLineClassName="font-sans font-normal"
            lastLineClassName="font-sans font-normal text-base md:text-lg"
          />
        </div>

        {showButton && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex justify-center">
              <GradientButton onClick={() => {
                trackEvent(Events.ONBOARDING_STARTED);
                navigate('/auth');
              }}>
                Begin
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
