import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';

export function GoalsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [goals, setGoals] = useState(data.goals || '');

  const handleContinue = () => {
    updateData({ goals });
    navigate('/onboarding/interests');
  };

  return (
    <OnboardingScreen
      progress={50}
      title="What are your current goals?"
      onContinue={handleContinue}
    >
      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="Tell us about your goals... (optional)"
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2 resize-none"
        rows={6}
        style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: goals ? '#000000' : 'rgba(0, 0, 0, 0.5)'
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
