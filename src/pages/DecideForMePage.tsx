import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GradientButton } from '../components/GradientButton';

export function DecideForMePage() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!decision.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      alert(`Based on your digital twin, we recommend: Option A. This aligns with your values and decision-making style.`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white overlay-gradient flex items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-black mb-4">
            Decide for Me
          </h1>
          <p className="text-xl text-gray-600">
            Tell us about a decision you're facing, and your digital twin will help you choose
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Describe your decision... (e.g., Should I take the new job offer or stay at my current company?)"
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-turquoise focus:outline-none resize-none"
            rows={6}
          />

          <div className="flex justify-center">
            <GradientButton
              onClick={handleAnalyze}
              disabled={!decision.trim() || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Decision'}
            </GradientButton>
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding/complete')}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          Back to options
        </button>
      </div>
    </div>
  );
}
