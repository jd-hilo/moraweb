import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { Building2, Rocket, Wifi, Store } from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';

const workStyleOptions = [
  {
    value: 'big-company',
    label: 'Big company',
    description: 'Stability, structure, clear ladder',
    icon: Building2,
  },
  {
    value: 'startup',
    label: 'Startup',
    description: 'Fast-paced, equity upside, wear many hats',
    icon: Rocket,
  },
  {
    value: 'remote-freelance',
    label: 'Remote / Freelance',
    description: 'Location freedom, own schedule',
    icon: Wifi,
  },
  {
    value: 'own-business',
    label: 'Start my own thing',
    description: 'Build something from scratch',
    icon: Store,
  },
];

export function WorkStyleScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  useEffect(() => {
    trackEvent(Events.CAREER_WORK_STYLE);
  }, []);

  const handleSelect = (value: string) => {
    updateData({ workStyle: value });
    navigate('/career/risk');
  };

  return (
    <OnboardingScreen
      progress={80}
      title="What's your ideal work setup?"
      hideButton
    >
      <div className="space-y-3">
        {workStyleOptions.map((opt) => {
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
