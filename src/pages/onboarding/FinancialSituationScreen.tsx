import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const financialOptions = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'tight', label: 'Tight' },
  { value: 'building-wealth', label: 'Building wealth' },
  { value: 'struggling', label: 'Struggling' },
];

export function FinancialSituationScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [financialSituation, setFinancialSituation] = useState(data.financialSituation);

  const handleChange = (value: string) => {
    setFinancialSituation(value);
    if (value && value !== 'other') {
      updateData({ financialSituation: value });
      trackEvent(Events.ONBOARDING_STEP_FINANCIAL_SITUATION);
      navigate('/onboarding/life-stage');
    }
  };

  const handleContinue = () => {
    updateData({ financialSituation });
    trackEvent(Events.ONBOARDING_STEP_FINANCIAL_SITUATION);
    navigate('/onboarding/life-stage');
  };

  return (
    <OnboardingScreen
      progress={46}
      title="How would you describe your financial situation?"
      onContinue={handleContinue}
      continueDisabled={!financialSituation}
      hideButton={financialSituation && financialSituation !== 'other'}
    >
      <ChoiceQuestion
        options={financialOptions}
        value={financialSituation}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
