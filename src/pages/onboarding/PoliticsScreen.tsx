import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const politicsOptions = [
  { value: 'progressive', label: 'Progressive' },
  { value: 'liberal', label: 'Liberal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'conservative', label: 'Conservative' },
  { value: 'libertarian', label: 'Libertarian' },
  { value: 'not-political', label: 'Not political' },
];

export function PoliticsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [politics, setPolitics] = useState(data.politics);

  const handleChange = (value: string) => {
    setPolitics(value);
    if (value && value !== 'other') {
      updateData({ politics: value });
      trackEvent(Events.ONBOARDING_STEP_POLITICS);
      navigate('/onboarding/clarifier');
    }
  };

  const handleContinue = () => {
    updateData({ politics });
    trackEvent(Events.ONBOARDING_STEP_POLITICS);
    navigate('/onboarding/clarifier');
  };

  return (
    <OnboardingScreen
      progress={76}
      title="What are your political views?"
      onContinue={handleContinue}
      continueDisabled={!politics}
      hideButton={politics && politics !== 'other'}
    >
      <ChoiceQuestion
        options={politicsOptions}
        value={politics}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
