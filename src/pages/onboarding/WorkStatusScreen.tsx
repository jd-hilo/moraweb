import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { HappinessSlider } from '../../components/HappinessSlider';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const workOptions = [
  { value: 'employed-full', label: 'Employed full-time' },
  { value: 'employed-part', label: 'Employed part-time' },
  { value: 'student', label: 'Student' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
];

export function WorkStatusScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [workStatus, setWorkStatus] = useState(data.workStatus);
  const [jobTitle, setJobTitle] = useState(data.jobTitle || '');
  const [jobHappiness, setJobHappiness] = useState(data.jobHappiness || 50);

  const isEmployed = workStatus.startsWith('employed');

  const handleContinue = () => {
    updateData({
      workStatus,
      jobTitle: isEmployed ? jobTitle : undefined,
      jobHappiness: isEmployed ? jobHappiness : undefined,
    });
    trackEvent(Events.ONBOARDING_STEP_WORK_STATUS);
    navigate('/onboarding/living-situation');
  };

  const canContinue = workStatus && (!isEmployed || jobTitle.trim());

  return (
    <OnboardingScreen
      progress={40}
      title="What's your work status?"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <div className="space-y-6">
        <ChoiceQuestion
          options={workOptions}
          value={workStatus}
          onChange={setWorkStatus}
          allowOther
        />

        {isEmployed && workStatus && (
          <div className="space-y-4 animate-slide-up">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="What is your current job?"
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
              style={{
                fontSize: '24px',
                fontWeight: 500,
                letterSpacing: '-0.3px',
                color: jobTitle ? '#000000' : 'rgba(0, 0, 0, 0.5)'
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
            {jobTitle && (
              <div className="animate-slide-up">
                <HappinessSlider
                  value={jobHappiness}
                  onChange={setJobHappiness}
                  label="How happy are you with your job?"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
