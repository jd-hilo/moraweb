import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { Briefcase, Heart, Users } from 'lucide-react';

export function SimulationTypeScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [selectedType, setSelectedType] = useState(data.simulationType || '');
  const { progress, encouragingText, teaser, isOptional } = useOnboardingProgress();

  const simulationTypes = [
    {
      id: 'career',
      label: 'Career',
      icon: Briefcase,
      description: 'Explore your professional path and career trajectory',
      available: true,
    },
    {
      id: 'relationship',
      label: 'Relationship',
      icon: Heart,
      description: 'Simulate your romantic and personal relationships',
      available: false,
      comingSoon: true,
    },
    {
      id: 'social',
      label: 'Social Life',
      icon: Users,
      description: 'Discover how your social connections evolve',
      available: false,
      comingSoon: true,
    },
  ];

  const handleContinue = () => {
    updateData({ simulationType: selectedType });
    trackEvent(Events.ONBOARDING_STEP_SIMULATION_TYPE, { simulation_type: selectedType });
    
    // Route to career-specific onboarding if career is selected
    if (selectedType === 'career') {
      navigate('/career/student-check');
    } else {
      navigate('/onboarding/birth-year');
    }
  };

  return (
    <OnboardingScreen
      progress={progress}
      title="Which type of simulation do you want?"
      onContinue={handleContinue}
      continueDisabled={!selectedType}
      helperText="Choose the area of your life you'd like to explore"
      encouragingText={encouragingText}
      teaser={teaser}
      isOptional={isOptional}
    >
      <div className="space-y-4">
        {simulationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          const isDisabled = !type.available;
          
          return (
            <button
              key={type.id}
              onClick={() => {
                if (type.available) {
                  setSelectedType(type.id);
                }
              }}
              disabled={isDisabled}
              className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left relative ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-200 bg-white text-black hover:border-gray-300'
              }`}
            >
              {type.comingSoon && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isDisabled
                      ? 'bg-gray-200'
                      : isSelected
                      ? 'bg-white/20'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isDisabled
                        ? 'text-gray-400'
                        : isSelected
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      isDisabled
                        ? 'text-gray-400'
                        : isSelected
                        ? 'text-white'
                        : 'text-black'
                    }`}
                  >
                    {type.label}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDisabled
                        ? 'text-gray-400'
                        : isSelected
                        ? 'text-white/80'
                        : 'text-gray-600'
                    }`}
                  >
                    {type.description}
                  </p>
                </div>
                {isSelected && !isDisabled && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}
