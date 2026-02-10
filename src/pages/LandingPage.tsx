import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TypewriterText } from '../components/TypewriterText';
import { GradientButton } from '../components/GradientButton';
import { ProgressBar } from '../components/ProgressBar';
import { Star } from 'lucide-react';
import moraLogo from '../assets/mora.png';
import { trackEvent, Events } from '../lib/mixpanel';

export function LandingPage() {
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  // Removed auth check - users can now create simulations without an account

  const messages = [
    "let's build your digital twin",
    "we'll ask you questions to understand who you are",
    "so we can create an accurate vision of you to run it through millions of timelines",
  ];

  const handleComplete = () => {
    setShowButton(true);
  };

  const testimonials = [
    {
      text: "I was stuck in marketing for 8 years, feeling like I was slowly losing my soul. Mora showed me a timeline where I transitioned to UI/UX design. It wasn't just a blind guess. It showed me the salary dip in year 1, the recovery in year 3, and the happiness index skyrocketing. I made the jump 6 months ago and I've never been more fulfilled.",
      author: "Alex Rivera",
      role: "Product Designer"
    },
    {
      text: "My partner and I were debating moving to London or staying in Austin. The simulation ran 10,000 scenarios. The London timeline showed a 40% higher chance of breakup due to financial stress and commute times, while Austin optimized for our long-term savings and relationship stability. We stayed, bought a house, and are happier than ever.",
      author: "Sarah Chen",
      role: "Operations Manager"
    },
    {
      text: "I had a safe corporate job offer and a risky startup idea. Every friend told me to take the safe bet. Mora's model showed that while the corporate path was safer in the short term, my 'regret metric' would maximize by age 40. I took the risk. The startup failed, but the simulation predicted that the skills I'd learn would land me a better role. It was right.",
      author: "James Wilson",
      role: "Founder"
    },
    {
      text: "We were on the fence about having kids now or waiting 5 years. The simulation visualized the impact on our career trajectories and energy levels. Seeing the data laid out, how waiting would increase financial security but decrease physical energy for parenting, made the choice obvious. We decided to start now and haven't looked back.",
      author: "Emily & Mark",
      role: "New Parents"
    }
  ];

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
          <span className="text-sm font-semibold text-black">12,567+ lives simulated</span>
        </div>
      </div>

      <div className="max-w-4xl w-full pt-32 pb-16 overflow-hidden">
        <div className="min-h-[300px] max-w-3xl">
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
          />
        </div>

        {showButton && (
          <div className="space-y-12 animate-slide-up">
            <div className="flex justify-center pt-2">
              <GradientButton onClick={() => {
                trackEvent(Events.ONBOARDING_STARTED);
                navigate('/onboarding/name');
              }}>
                Begin
              </GradientButton>
            </div>

            <div className="relative w-screen -ml-6 md:-ml-[calc((100vw-56rem)/2)]">
               {/* Gradient masks */}
               <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
               <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

               <div className="flex w-max animate-scroll pause-on-hover">
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <div key={i} className="w-[350px] md:w-[450px] mx-4 p-6 bg-white/60 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4 font-medium">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-turquoise-100 flex items-center justify-center text-xs font-bold text-purple-600">
                            {t.author.charAt(0)}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-black">{t.author}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{t.role}</p>
                         </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
