import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function NameScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.firstName);

  const handleContinue = () => {
    updateData({ firstName: name });
    trackEvent(Events.ONBOARDING_STEP_NAME);
    navigate('/onboarding/birth-year');
  };

  return (
    <OnboardingScreen
      progress={25}
      title="What's your first name?"
      onContinue={handleContinue}
      continueDisabled={!name.trim()}
      helperText="The more information, the more accurate your digital twin will be."
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your first name"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: name ? '#000000' : 'rgba(0, 0, 0, 0.5)'
        }}
        autoFocus
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
