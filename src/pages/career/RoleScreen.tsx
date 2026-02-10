import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

export function RoleScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [currentRole, setCurrentRole] = useState(data.currentRole || '');

  useEffect(() => {
    trackEvent(Events.CAREER_ROLE);
  }, []);
  const [company, setCompany] = useState(data.company || '');

  const handleContinue = () => {
    updateData({ currentRole, company });
    navigate('/career/salary');
  };

  return (
    <OnboardingScreen
      progress={35}
      title="What's your current role?"
      onContinue={handleContinue}
      continueDisabled={!currentRole.trim() || !company.trim()}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            enterKeyHint="done"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager, Nurse"
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            enterKeyHint="done"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Google, Local Hospital, Self-employed"
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
          />
        </div>
      </div>
    </OnboardingScreen>
  );
}
