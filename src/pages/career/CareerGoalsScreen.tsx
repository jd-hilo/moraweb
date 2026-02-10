import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const goalOptions = [
  { id: 'money', label: 'Making money', emoji: '💰' },
  { id: 'balance', label: 'Work-life balance', emoji: '⚖️' },
  { id: 'impact', label: 'Doing meaningful work', emoji: '🌍' },
  { id: 'growth', label: 'Learning & growth', emoji: '📈' },
  { id: 'title', label: 'Status & title', emoji: '👔' },
  { id: 'freedom', label: 'Freedom & flexibility', emoji: '🕊️' },
  { id: 'team', label: 'Leading a team', emoji: '👥' },
  { id: 'stability', label: 'Job security', emoji: '🛡️' },
];

export function CareerGoalsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.careerGoals || []);

  useEffect(() => {
    trackEvent(Events.CAREER_GOALS);
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleContinue = () => {
    updateData({ careerGoals: selected });
    navigate('/career/work-style');
  };

  return (
    <OnboardingScreen
      progress={70}
      title="What matters most to you?"
      onContinue={handleContinue}
      continueDisabled={selected.length === 0}
      helperText="Pick up to 3"
    >
      <div className="flex flex-wrap gap-3">
        {goalOptions.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`px-4 py-3 rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <span className="mr-1.5">{opt.emoji}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}
