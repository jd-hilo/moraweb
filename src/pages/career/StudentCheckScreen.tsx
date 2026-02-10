import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { GraduationCap, Briefcase } from 'lucide-react';
import { trackEvent, Events } from '../../lib/mixpanel';

export function StudentCheckScreen() {
  const navigate = useNavigate();
  const { updateData } = useOnboarding();

  useEffect(() => {
    trackEvent(Events.CAREER_STUDENT_CHECK);
  }, []);

  const handleSelect = (isStudent: boolean) => {
    updateData({ isStudent });
    if (isStudent) {
      navigate('/career/student-details');
    } else {
      navigate('/career/role');
    }
  };

  const options = [
    {
      value: true,
      label: "Yes, I'm a student",
      icon: GraduationCap,
      description: 'Currently enrolled in school or university',
    },
    {
      value: false,
      label: "No, I'm working",
      icon: Briefcase,
      description: 'Employed or self-employed professional',
    },
  ];

  return (
    <OnboardingScreen
      progress={20}
      title="Are you a student?"
      hideButton
    >
      <div className="space-y-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={String(opt.value)}
              onClick={() => handleSelect(opt.value)}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 bg-white text-black hover:border-black hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gray-100">
                  <Icon className="w-7 h-7 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1 text-black">
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
