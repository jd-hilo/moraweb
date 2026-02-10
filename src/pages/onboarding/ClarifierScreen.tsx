import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { TypewriterText } from '../../components/TypewriterText';
import { GradientButton } from '../../components/GradientButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function ClarifierScreen() {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [showButton, setShowButton] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateTwin = async () => {
    setIsSaving(true);

    try {
      // Track twin creation and onboarding completion (no auth required)
      trackEvent(Events.TWIN_CREATED, {
        has_values: data.values && data.values.length > 0,
        values_count: data.values?.length || 0,
      });
      trackEvent(Events.ONBOARDING_COMPLETED);

      // Onboarding data is already stored in localStorage via OnboardingContext
      // No need to save to database - proceed directly to simulation
      setIsSaving(false);
    } catch (error) {
      console.error('Error creating digital twin:', error);
      setIsSaving(false);
    }
  };

  return (
    <OnboardingScreen
      progress={90}
      hideButton
    >
      <div className="text-center space-y-8">
        <div className="mb-8">
          <TypewriterText
            texts={["Your digital twin has been initialized"]}
            speed={60}
            onComplete={() => {
              // Fade in button after text completes
              setTimeout(() => {
                setShowButton(true);
              }, 300);
            }}
            className="text-3xl md:text-4xl font-serif font-bold text-black"
          />
        </div>
        {showButton && (
          <div className="animate-fade-in">
            <GradientButton
              onClick={async () => {
                // Track step completion
                trackEvent(Events.ONBOARDING_STEP_CLARIFIER);
                // Create twin (no auth required), then navigate to simulation
                await handleCreateTwin();
                if (!isSaving) {
                  navigate('/simulate-life');
                }
              }}
              disabled={isSaving}
              variant="purple"
            >
              {isSaving ? 'Saving...' : 'Simulate My Life'}
            </GradientButton>
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
