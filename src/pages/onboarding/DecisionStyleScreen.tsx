import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const decisionOptions = [
  { value: 'analytical', label: 'Analytical - I research and weigh pros/cons' },
  { value: 'intuitive', label: 'Intuitive - I go with my gut' },
  { value: 'collaborative', label: 'Collaborative - I discuss with others' },
  { value: 'quick', label: 'Quick - I decide fast' },
];

export function DecisionStyleScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [decisionStyle, setDecisionStyle] = useState(data.decisionStyle);

  const handleChange = (value: string) => {
    setDecisionStyle(value);
    if (value && value !== 'other') {
      updateData({ decisionStyle: value });
      trackEvent(Events.ONBOARDING_STEP_DECISION_STYLE);
      navigate('/onboarding/stress-handling');
    }
  };

  const handleContinue = () => {
    updateData({ decisionStyle });
    trackEvent(Events.ONBOARDING_STEP_DECISION_STYLE);
    navigate('/onboarding/stress-handling');
  };

  return (
    <OnboardingScreen
      progress={68}
      title="How do you usually make big decisions?"
      onContinue={handleContinue}
      continueDisabled={!decisionStyle}
      hideButton={decisionStyle && decisionStyle !== 'other'}
    >
      <ChoiceQuestion
        options={decisionOptions}
        value={decisionStyle}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
