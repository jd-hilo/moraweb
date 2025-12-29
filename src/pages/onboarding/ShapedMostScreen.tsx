import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const shapedOptions = [
  { value: 'family', label: 'Family' },
  { value: 'mentors', label: 'Mentors' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'values', label: 'Values' },
  { value: 'education', label: 'Education' },
];

export function ShapedMostScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [shapedMost, setShapedMost] = useState(data.shapedMost);

  const handleChange = (value: string) => {
    setShapedMost(value);
    if (value && value !== 'other') {
      updateData({ shapedMost: value });
      trackEvent(Events.ONBOARDING_STEP_SHAPED_MOST);
      navigate('/onboarding/challenges');
    }
  };

  const handleContinue = () => {
    updateData({ shapedMost });
    trackEvent(Events.ONBOARDING_STEP_SHAPED_MOST);
    navigate('/onboarding/challenges');
  };

  return (
    <OnboardingScreen
      progress={62}
      title="What shaped you the most?"
      onContinue={handleContinue}
      continueDisabled={!shapedMost}
      hideButton={shapedMost && shapedMost !== 'other'}
    >
      <ChoiceQuestion
        options={shapedOptions}
        value={shapedMost}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
