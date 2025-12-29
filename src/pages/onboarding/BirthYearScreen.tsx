import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function BirthYearScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [birthYear, setBirthYear] = useState(data.birthYear);

  const years = Array.from({ length: 2012 - 1950 + 1 }, (_, i) => (2012 - i).toString());

  const handleContinue = () => {
    updateData({ birthYear });
    trackEvent(Events.ONBOARDING_STEP_BIRTH_YEAR);
    navigate('/onboarding/values');
  };

  return (
    <OnboardingScreen
      progress={30}
      title="What year were you born?"
      onContinue={handleContinue}
      continueDisabled={!birthYear}
    >
      <select
        value={birthYear}
        onChange={(e) => setBirthYear(e.target.value)}
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: birthYear ? '#000000' : 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <option value="" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Select year</option>
        {years.map((year) => (
          <option key={year} value={year} style={{ color: '#000000' }}>
            {year}
          </option>
        ))}
      </select>
      <style>{`
        select:focus {
          color: #000000;
        }
      `}</style>
    </OnboardingScreen>
  );
}
