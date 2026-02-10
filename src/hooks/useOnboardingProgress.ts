import { useLocation } from 'react-router-dom';
import { getProgress, getStepNumber, getEncouragingText, getTeaser, isOptional, getMicroSlide } from '../lib/onboardingProgress';

export function useOnboardingProgress() {
  const location = useLocation();
  const stepNumber = getStepNumber(location.pathname);
  const progress = getProgress(location.pathname);
  const encouragingText = getEncouragingText(stepNumber);
  const teaser = getTeaser(stepNumber);
  const optional = isOptional(location.pathname);
  const microSlide = getMicroSlide(stepNumber);

  return {
    stepNumber,
    progress,
    encouragingText,
    teaser,
    isOptional: optional,
    microSlide,
    path: location.pathname,
  };
}

