import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const collegeOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export function CollegeScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [wentToCollege, setWentToCollege] = useState(data.wentToCollege);
  const [collegeName, setCollegeName] = useState(data.collegeName || '');

  const handleContinue = () => {
    updateData({
      wentToCollege,
      collegeName: wentToCollege === 'yes' ? collegeName : undefined,
    });
    trackEvent(Events.ONBOARDING_STEP_COLLEGE);
    navigate('/onboarding/career-start');
  };

  const canContinue = wentToCollege && (wentToCollege === 'no' || collegeName.trim());

  return (
    <OnboardingScreen
      progress={56}
      title="Did you go to college?"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <div className="space-y-6">
        <ChoiceQuestion
          options={collegeOptions}
          value={wentToCollege}
          onChange={setWentToCollege}
        />

        {wentToCollege === 'yes' && (
          <div className="animate-slide-up">
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="What college did you attend?"
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
              style={{
                fontSize: '24px',
                fontWeight: 500,
                letterSpacing: '-0.3px',
                color: collegeName ? '#000000' : 'rgba(0, 0, 0, 0.5)'
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
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
