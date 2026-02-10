import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { MicroSlide } from '../../components/MicroSlide';
import { useOnboarding } from '../../context/OnboardingContext';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { trackEvent, Events } from '../../lib/mixpanel';

const livingOptions = [
  { value: 'alone', label: 'Alone' },
  { value: 'partner', label: 'With partner' },
  { value: 'family', label: 'With family' },
  { value: 'roommates', label: 'With roommates' },
];

export function LivingSituationScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [livingWith, setLivingWith] = useState(data.livingWith);
  const { microSlide } = useOnboardingProgress();
  const [showMicroSlide, setShowMicroSlide] = useState(!!microSlide);

  const handleChange = (value: string) => {
    setLivingWith(value);
    if (value && value !== 'other') {
      updateData({ livingWith: value });
      trackEvent(Events.ONBOARDING_STEP_LIVING_SITUATION);
      navigate('/onboarding/relationship-status');
    }
  };

  const handleContinue = () => {
    updateData({ livingWith });
    trackEvent(Events.ONBOARDING_STEP_LIVING_SITUATION);
    navigate('/onboarding/relationship-status');
  };

  return (
    <>
      {showMicroSlide && microSlide && (
        <MicroSlide
          message={microSlide}
          onComplete={() => setShowMicroSlide(false)}
        />
      )}
      <OnboardingScreen
        progress={42}
        title="What's your living situation?"
        onContinue={handleContinue}
        continueDisabled={!livingWith}
        hideButton={livingWith && livingWith !== 'other'}
      >
        <ChoiceQuestion
          options={livingOptions}
          value={livingWith}
          onChange={handleChange}
          allowOther
        />
      </OnboardingScreen>
    </>
  );
}
