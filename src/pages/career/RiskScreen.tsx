import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { Shield, Scale, Flame } from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';

const riskOptions = [
  {
    value: 'safe',
    label: 'Play it safe',
    description: 'Steady growth, low stress, predictable path',
    icon: Shield,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Some risk for better rewards, but nothing crazy',
    icon: Scale,
  },
  {
    value: 'aggressive',
    label: 'High risk, high reward',
    description: 'Big swings, big potential payoffs',
    icon: Flame,
  },
];

export function RiskScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  useEffect(() => {
    trackEvent(Events.CAREER_RISK);
  }, []);

  const handleSelect = (value: string) => {
    updateData({ riskTolerance: value });
    navigate('/career/email');
  };

  return (
    <OnboardingScreen
      progress={90}
      title="How much career risk are you comfortable with?"
      hideButton
    >
      <div className="space-y-3">
        {riskOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white text-black hover:border-black hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-black">
                    {opt.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}
