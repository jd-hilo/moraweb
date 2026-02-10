import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

function formatSalary(value: string): string {
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  return Number(numericValue).toLocaleString('en-US');
}

function parseSalary(formatted: string): string {
  return formatted.replace(/[^0-9]/g, '');
}

export function SalaryScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [salary, setSalary] = useState(data.salary ? formatSalary(data.salary) : '');

  useEffect(() => {
    trackEvent(Events.CAREER_SALARY);
  }, []);

  const handleContinue = () => {
    updateData({ salary: parseSalary(salary) });
    navigate('/career/horizon');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length <= 9) {
      setSalary(formatSalary(raw));
    }
  };

  return (
    <OnboardingScreen
      progress={50}
      title="Your compensation"
      onContinue={handleContinue}
      continueDisabled={!parseSalary(salary)}
      helperText="Base salary before taxes. An estimate is fine."
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Salary
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              value={salary}
              onChange={handleChange}
              placeholder="85,000"
              className="w-full p-4 pl-8 rounded-xl border-2 border-gray-200 bg-white text-black text-lg font-medium placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>
      </div>
    </OnboardingScreen>
  );
}
