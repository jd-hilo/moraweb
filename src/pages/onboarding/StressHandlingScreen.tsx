import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function StressHandlingScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [stressHandling, setStressHandling] = useState(data.stressHandling || '');

  const handleContinue = () => {
    updateData({ stressHandling });
    trackEvent(Events.ONBOARDING_STEP_STRESS_HANDLING);
    navigate('/onboarding/politics');
  };

  return (
    <OnboardingScreen
      progress={72}
      title="When things get tough, how do you handle stress?"
      onContinue={handleContinue}
    >
      <textarea
        value={stressHandling}
        onChange={(e) => setStressHandling(e.target.value)}
        placeholder="Tell us how you handle stress... (optional)"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2 resize-none"
        rows={6}
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: stressHandling ? '#000000' : 'rgba(0, 0, 0, 0.5)'
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
