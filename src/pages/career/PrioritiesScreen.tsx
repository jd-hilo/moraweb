import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';

export function PrioritiesScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [priorities, setPriorities] = useState(data.careerPriorities || '');

  const handleContinue = () => {
    updateData({ careerPriorities: priorities });
    navigate('/career/generating');
  };

  const handleSkip = () => {
    updateData({ careerPriorities: '' });
    navigate('/career/generating');
  };

  return (
    <OnboardingScreen
      progress={85}
      title="What matters to you?"
      onContinue={handleContinue}
      continueDisabled={false}
      isOptional={true}
      onSkip={handleSkip}
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          In a few sentences, tell us what matters most in your career. What are you optimizing for?
        </p>
        <textarea
          enterKeyHint="done"
          value={priorities}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setPriorities(e.target.value);
            }
          }}
          placeholder="e.g., I want to maximize my earning potential but I also care about work-life balance. I've been thinking about switching to management but I'm not sure if I'd miss coding..."
          className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors resize-none"
          rows={6}
          autoFocus
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            The more specific you are, the more personalized your simulation will be.
          </p>
          <span className={`text-xs font-medium ${priorities.length >= 450 ? 'text-red-500' : 'text-gray-400'}`}>
            {priorities.length}/500
          </span>
        </div>
      </div>
    </OnboardingScreen>
  );
}
