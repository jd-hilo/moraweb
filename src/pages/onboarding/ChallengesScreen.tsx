import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function ChallengesScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [challenges, setChallenges] = useState(data.challenges || '');

  const handleContinue = () => {
    updateData({ challenges });
    trackEvent(Events.ONBOARDING_STEP_CHALLENGES);
    navigate('/onboarding/decision-style');
  };

  return (
    <OnboardingScreen
      progress={64}
      title="What challenges have you faced?"
      onContinue={handleContinue}
    >
      <textarea
        value={challenges}
        onChange={(e) => setChallenges(e.target.value)}
        placeholder="Tell us about challenges you've faced... (optional)"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2 resize-none"
        rows={6}
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: challenges ? '#000000' : 'rgba(0, 0, 0, 0.5)'
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
