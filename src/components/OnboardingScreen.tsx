import { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  progress: number;
  title?: string;
  children: ReactNode;
  onContinue?: () => void;
  continueText?: string;
  continueDisabled?: boolean;
  hideButton?: boolean;
  helperText?: string;
}

export function OnboardingScreen({
  progress,
  title,
  children,
  onContinue,
  continueText = 'Continue',
  continueDisabled = false,
  hideButton = false,
  helperText,
}: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: '60px' }}>
      <ProgressBar progress={progress} />

      <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full pb-24">
        {title && (
          <h1 
            className="text-black mb-2"
            style={{ 
              fontSize: '32px', 
              fontWeight: 700,
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off'
            }}
          >
            {title}
          </h1>
        )}

        <div className="w-full flex-1 flex flex-col justify-center">
          {children}
        </div>

        {helperText && (
          <p 
            className="text-black mt-6"
            style={{ fontSize: '12px', opacity: 0.7 }}
          >
            {helperText}
          </p>
        )}

        {!hideButton && onContinue && (
          <button
            onClick={onContinue}
            disabled={continueDisabled}
            className="w-full py-4 px-6 rounded-3xl text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            style={{
              background: continueDisabled
                ? 'rgba(0, 0, 0, 0.1)'
                : 'linear-gradient(135deg, #6BCA9A, #6BB8D4, #7AA5E8)',
              fontSize: '17px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
              color: continueDisabled ? 'rgba(0, 0, 0, 0.5)' : '#FFFFFF'
            }}
          >
            {continueText}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
