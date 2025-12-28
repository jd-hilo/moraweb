import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';

const lifeStageOptions = [
  { value: 'early-career', label: 'Early career' },
  { value: 'mid-career', label: 'Mid-career' },
  { value: 'established', label: 'Established' },
  { value: 'transition', label: 'Transition' },
];

export function LifeStageScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [lifeStage, setLifeStage] = useState(data.lifeStage);

  const handleChange = (value: string) => {
    setLifeStage(value);
    if (value && value !== 'other') {
      updateData({ lifeStage: value });
      navigate('/onboarding/goals');
    }
  };

  const handleContinue = () => {
    updateData({ lifeStage });
    navigate('/onboarding/goals');
  };

  return (
    <OnboardingScreen
      progress={48}
      title="What stage of life are you in?"
      onContinue={handleContinue}
      continueDisabled={!lifeStage}
      hideButton={lifeStage && lifeStage !== 'other'}
    >
      <ChoiceQuestion
        options={lifeStageOptions}
        value={lifeStage}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
