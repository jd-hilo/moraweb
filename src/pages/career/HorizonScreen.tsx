import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { Clock, Zap, Telescope } from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';

const horizonOptions = [
  {
    value: 5 as const,
    label: '5 Years',
    subtitle: 'Near-term outlook',
    icon: Zap,
  },
  {
    value: 10 as const,
    label: '10 Years',
    subtitle: 'Mid-career view',
    icon: Clock,
  },
  {
    value: 15 as const,
    label: '15 Years',
    subtitle: 'Long-term vision',
    icon: Telescope,
  },
];

export function HorizonScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  useEffect(() => {
    trackEvent(Events.CAREER_HORIZON);
  }, []);

  const handleSelect = (value: 5 | 10 | 15) => {
    updateData({ careerTimeHorizon: value });
    navigate('/career/goals');
  };

  return (
    <OnboardingScreen
      progress={65}
      title="How far ahead do you want to look?"
      hideButton
    >
      <div className="space-y-4">
        {horizonOptions.map((opt) => {
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
                  <h3 className="text-xl font-bold text-black">
                    {opt.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {opt.subtitle}
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
