import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { MultiSelectGrid } from '../../components/MultiSelectGrid';
import { MicroSlide } from '../../components/MicroSlide';
import { useOnboarding } from '../../context/OnboardingContext';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { trackEvent, Events } from '../../lib/mixpanel';

const interestOptions = [
  { value: 'music', label: 'Music', emoji: '🎵' },
  { value: 'movies', label: 'Movies', emoji: '🎬' },
  { value: 'reading', label: 'Reading', emoji: '📚' },
  { value: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { value: 'cooking', label: 'Cooking', emoji: '🍳' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'tech', label: 'Tech', emoji: '💻' },
  { value: 'nature', label: 'Nature', emoji: '🌲' },
  { value: 'photography', label: 'Photography', emoji: '📷' },
];

export function InterestsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [interests, setInterests] = useState<string[]>(data.interests);
  const { microSlide } = useOnboardingProgress();
  const [showMicroSlide, setShowMicroSlide] = useState(!!microSlide);

  const handleContinue = () => {
    updateData({ interests });
    trackEvent(Events.ONBOARDING_STEP_INTERESTS);
    navigate('/onboarding/hometown');
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
        progress={52}
        title="What are you interested in?"
        onContinue={handleContinue}
        continueDisabled={interests.length === 0}
      >
        <MultiSelectGrid
          options={interestOptions}
          selected={interests}
          onChange={setInterests}
        />
      </OnboardingScreen>
    </>
  );
}
