import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';

const turningPointOptions = [
  { value: 'graduation', label: 'Graduation' },
  { value: 'moving-cities', label: 'Moving cities' },
  { value: 'job-change', label: 'Job change' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'family-event', label: 'Family event' },
];

export function TurningPointScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [turningPoint, setTurningPoint] = useState(data.turningPoint);

  const handleChange = (value: string) => {
    setTurningPoint(value);
    if (value && value !== 'other') {
      updateData({ turningPoint: value });
      navigate('/onboarding/shaped-most');
    }
  };

  const handleContinue = () => {
    updateData({ turningPoint });
    navigate('/onboarding/shaped-most');
  };

  return (
    <OnboardingScreen
      progress={60}
      title="What was a key turning point in your life?"
      onContinue={handleContinue}
      continueDisabled={!turningPoint}
      hideButton={turningPoint && turningPoint !== 'other'}
    >
      <ChoiceQuestion
        options={turningPointOptions}
        value={turningPoint}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
