import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const gradeLevels = [
  'High School',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate Student',
];

export function StudentDetailsScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [gradeLevel, setGradeLevel] = useState(data.gradeLevel || '');

  useEffect(() => {
    trackEvent(Events.CAREER_STUDENT_DETAILS);
  }, []);
  const [school, setSchool] = useState(data.school || '');
  const [studying, setStudying] = useState(data.studying || '');

  const handleContinue = () => {
    updateData({ gradeLevel, school, studying });
    navigate('/career/horizon');
  };

  return (
    <OnboardingScreen
      progress={30}
      title="Tell us about your studies"
      onContinue={handleContinue}
      continueDisabled={!gradeLevel}
    >
      <div className="space-y-6">
        {/* Grade Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Grade Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            {gradeLevels.map((level) => (
              <button
                key={level}
                onClick={() => setGradeLevel(level)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                  gradeLevel === level
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* School Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            School Name
          </label>
          <input
            type="text"
            enterKeyHint="done"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g., Stanford University, Lincoln High School"
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
          />
        </div>

        {/* Area of Study */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What are you studying / planning to study?
          </label>
          <input
            type="text"
            enterKeyHint="done"
            value={studying}
            onChange={(e) => setStudying(e.target.value)}
            placeholder="e.g., Computer Science, Business, Nursing"
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
          />
        </div>
      </div>
    </OnboardingScreen>
  );
}
