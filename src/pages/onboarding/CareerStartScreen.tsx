import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';

const careerOptions = [
  { value: 'first-job', label: 'First job' },
  { value: 'internship', label: 'Internship' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'family-business', label: 'Family business' },
];

export function CareerStartScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [careerStart, setCareerStart] = useState(data.careerStart);

  const handleChange = (value: string) => {
    setCareerStart(value);
    if (value && value !== 'other') {
      updateData({ careerStart: value });
      navigate('/onboarding/turning-point');
    }
  };

  const handleContinue = () => {
    updateData({ careerStart });
    navigate('/onboarding/turning-point');
  };

  return (
    <OnboardingScreen
      progress={58}
      title="How did you start your career?"
      onContinue={handleContinue}
      continueDisabled={!careerStart}
      hideButton={careerStart && careerStart !== 'other'}
    >
      <ChoiceQuestion
        options={careerOptions}
        value={careerStart}
        onChange={handleChange}
        allowOther
      />
    </OnboardingScreen>
  );
}
