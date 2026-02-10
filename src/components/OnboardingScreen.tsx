import { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  progress: number;
  title?: string;
  children: ReactNode;
  onContinue?: () => void;
  onSkip?: () => void;
  continueText?: string;
  continueDisabled?: boolean;
  hideButton?: boolean;
  helperText?: string;
  encouragingText?: string | null;
  teaser?: string | null;
  isOptional?: boolean;
}

export function OnboardingScreen({
  progress,
  title,
  children,
  onContinue,
  onSkip,
  continueText = 'Continue',
  continueDisabled = false,
  hideButton = false,
  helperText,
  encouragingText,
  teaser,
  isOptional = false,
}: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: '60px' }}>
      <ProgressBar progress={progress} />

      <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full pb-24">
        {encouragingText && (
          <p 
            className="text-gray-600 mb-4 text-sm md:text-base font-medium"
            style={{ fontSize: '14px' }}
          >
            {encouragingText}
          </p>
        )}

        {teaser && (
          <div 
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-turquoise-50 border border-purple-100"
            style={{ animation: 'fadeIn 0.5s ease-in' }}
          >
            <p className="text-purple-700 font-semibold text-sm">
              ✨ {teaser}
            </p>
          </div>
        )}

        {title && (
          <h1 
            className="text-black mb-6 md:mb-8"
            style={{ 
              fontSize: 'clamp(28px, 8vw, 36px)', 
              fontWeight: 700,
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off',
              lineHeight: '1.2'
            }}
          >
            {title}
          </h1>
        )}

        <div className="w-full flex-1 flex flex-col justify-center py-4">
          {children}
        </div>

        {helperText && (
          <p 
            className="text-black mt-4 md:mt-6"
            style={{ fontSize: '12px', opacity: 0.7 }}
          >
            {helperText}
          </p>
        )}

        {!hideButton && (
          <div className="mt-6 md:mt-8 space-y-3">
            {onContinue && (
              <button
                onClick={onContinue}
                disabled={continueDisabled}
                className="w-full px-8 py-4 text-lg text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: continueDisabled
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #25729f, #62edb9)',
                }}
              >
                {continueText}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            {isOptional && onSkip && (
              <button
                onClick={onSkip}
                className="w-full py-3 md:py-4 px-6 rounded-full text-gray-600 font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors"
                style={{
                  fontSize: '15px',
                  minHeight: '48px'
                }}
              >
                Skip for now
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
