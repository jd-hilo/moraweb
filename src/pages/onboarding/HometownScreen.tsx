import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function HometownScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [hometown, setHometown] = useState(data.hometown);

  const handleContinue = () => {
    updateData({ hometown });
    trackEvent(Events.ONBOARDING_STEP_HOMETOWN);
    navigate('/onboarding/college');
  };

  return (
    <OnboardingScreen
      progress={54}
      title="Where did you grow up?"
      onContinue={handleContinue}
      continueDisabled={!hometown.trim()}
    >
      <input
        type="text"
        enterKeyHint="done"
        value={hometown}
        onChange={(e) => setHometown(e.target.value)}
        placeholder="City, State/Country (e.g., Austin, TX or London, UK)"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: hometown ? '#000000' : 'rgba(0, 0, 0, 0.5)'
        }}
      />
      <style>{`
        input::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        input:focus {
          color: #000000;
        }
      `}</style>
    </OnboardingScreen>
  );
}
