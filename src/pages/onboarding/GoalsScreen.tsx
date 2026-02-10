import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';

export function GoalsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [goals, setGoals] = useState(data.goals || '');
  const { progress, encouragingText, teaser, isOptional } = useOnboardingProgress();

  const handleContinue = () => {
    updateData({ goals });
    trackEvent(Events.ONBOARDING_STEP_GOALS);
    navigate('/onboarding/interests');
  };

  const handleSkip = () => {
    updateData({ goals: '' });
    trackEvent(Events.ONBOARDING_STEP_GOALS);
    navigate('/onboarding/interests');
  };

  return (
    <OnboardingScreen
      progress={progress}
      title="What are your current goals?"
      onContinue={handleContinue}
      onSkip={isOptional ? handleSkip : undefined}
      encouragingText={encouragingText}
      teaser={teaser}
      isOptional={isOptional}
    >
      <textarea
        enterKeyHint="done"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="Tell us about your goals... (optional)"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-3 md:pb-2 resize-none"
        rows={6}
        style={{
          fontSize: 'clamp(20px, 6vw, 28px)',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: goals ? '#000000' : 'rgba(0, 0, 0, 0.5)',
          minHeight: '120px'
        }}
      />
      <style>{`
        textarea::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        textarea:focus {
          color: #000000;
        }
      `}</style>
    </OnboardingScreen>
  );
}
