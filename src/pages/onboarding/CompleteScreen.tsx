import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { TypewriterText } from '../../components/TypewriterText';
import { Compass, Sparkles } from 'lucide-react';

export function CompleteScreen() {
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);

  return (
    <OnboardingScreen
      progress={100}
      hideButton
    >
      <div className="space-y-12 text-center">
        <TypewriterText
          texts={["Let's explore..."]}
          speed={80}
          onComplete={() => setTimeout(() => setShowCards(true), 300)}
          className="text-3xl md:text-4xl font-serif font-bold text-black"
        />

        {showCards && (
          <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
            <button
              onClick={() => navigate('/decide-for-me')}
              className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-turquoise hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full gradient-turquoise flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Decide for me</h3>
                  <p className="text-sm text-gray-600">Make a choice, simulate outcomes</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/simulate-life')}
              className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Simulate your life</h3>
                  <p className="text-sm text-gray-600">Explore Alternate Realities</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
