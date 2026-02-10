import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MicroSlideProps {
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export function MicroSlide({ message, duration = 3000, onComplete }: MicroSlideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        onComplete?.();
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{
        animation: isVisible ? 'fadeIn 0.5s ease-out' : 'fadeOut 0.5s ease-in',
      }}
    >
      <div
        className="bg-white rounded-3xl p-8 md:p-12 max-w-md mx-6 shadow-2xl text-center transform"
        style={{
          animation: isVisible ? 'slideUp 0.5s ease-out' : 'slideDown 0.5s ease-in',
        }}
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-turquoise-100 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        
        <p
          className="text-xl md:text-2xl font-bold text-black leading-snug"
          style={{
            fontFamily: 'Recoleta, Georgia, serif',
            fontVariantLigatures: 'none',
            WebkitFontFeatureSettings: '"liga" off',
            fontFeatureSettings: '"liga" off',
          }}
        >
          {message}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}


