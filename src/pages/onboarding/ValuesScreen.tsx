import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { MultiSelectGrid } from '../../components/MultiSelectGrid';
import { useOnboarding } from '../../context/OnboardingContext';

const valueOptions = [
  { value: 'family', label: 'Family' },
  { value: 'career', label: 'Career' },
  { value: 'health', label: 'Health' },
  { value: 'freedom', label: 'Freedom' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'wealth', label: 'Wealth' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'spirituality', label: 'Spirituality' },
  { value: 'impact', label: 'Impact' },
  { value: 'security', label: 'Security' },
];

export function ValuesScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [values, setValues] = useState<string[]>(data.values);

  const handleContinue = () => {
    updateData({ values });
    navigate('/onboarding/work-status');
  };

  return (
    <OnboardingScreen
      progress={35}
      title="What matters most to you?"
      onContinue={handleContinue}
      continueDisabled={values.length === 0}
    >
      <MultiSelectGrid
        options={valueOptions}
        selected={values}
        onChange={setValues}
      />
    </OnboardingScreen>
  );
}
