// Onboarding progress tracking utility

export const ONBOARDING_STEPS = [
  { path: '/onboarding/name', name: 'Name', required: true },
  { path: '/onboarding/simulation-type', name: 'Simulation Type', required: true },
  { path: '/onboarding/birth-year', name: 'Birth Year', required: true },
  { path: '/onboarding/values', name: 'Values', required: true },
  { path: '/onboarding/work-status', name: 'Work Status', required: true },
  { path: '/onboarding/living-situation', name: 'Living Situation', required: true },
  { path: '/onboarding/relationship-status', name: 'Relationship Status', required: true },
  { path: '/onboarding/financial-situation', name: 'Financial Situation', required: true },
  { path: '/onboarding/life-stage', name: 'Life Stage', required: true },
  { path: '/onboarding/goals', name: 'Goals', required: false },
  { path: '/onboarding/interests', name: 'Interests', required: true },
  { path: '/onboarding/hometown', name: 'Hometown', required: false },
  { path: '/onboarding/college', name: 'College', required: false },
  { path: '/onboarding/career-start', name: 'Career Start', required: false },
  { path: '/onboarding/turning-point', name: 'Turning Point', required: false },
  { path: '/onboarding/shaped-most', name: 'Shaped Most', required: false },
  { path: '/onboarding/challenges', name: 'Challenges', required: false },
  { path: '/onboarding/decision-style', name: 'Decision Style', required: true },
  { path: '/onboarding/stress-handling', name: 'Stress Handling', required: false },
  { path: '/onboarding/politics', name: 'Politics', required: false },
  { path: '/onboarding/clarifier', name: 'Clarifier', required: false },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function getStepNumber(path: string): number {
  const index = ONBOARDING_STEPS.findIndex(step => step.path === path);
  return index >= 0 ? index + 1 : 0;
}

export function getProgress(path: string): number {
  const stepNumber = getStepNumber(path);
  return stepNumber > 0 ? Math.round((stepNumber / TOTAL_STEPS) * 100) : 0;
}

export function getEncouragingText(stepNumber: number): string | null {
  // Encouraging text removed per user request
  return null;
}

export function getTeaser(stepNumber: number): string | null {
  const progress = (stepNumber / TOTAL_STEPS) * 100;
  
  // Show teasers between 30-50% progress
  if (progress >= 30 && progress <= 50) {
    const teasers = [
      "Sneak peek: 78% chance of happiness boost by 2030",
      "Early insight: Your career trajectory looks promising",
      "Preview: Strong financial growth potential detected",
      "Teaser: Your future self is looking optimistic",
    ];
    const index = Math.floor((stepNumber - Math.floor(TOTAL_STEPS * 0.3)) / 2) % teasers.length;
    return teasers[index];
  }
  
  return null;
}

export function isOptional(path: string): boolean {
  const step = ONBOARDING_STEPS.find(s => s.path === path);
  return step ? !step.required : false;
}

export function getMicroSlide(stepNumber: number): string | null {
  // Show micro slides at 25%, 50%, and 75% progress
  const progress = (stepNumber / TOTAL_STEPS) * 100;
  
  if (stepNumber === 5) {
    return "Your digital twin is learning your lifestyle patterns...";
  } else if (stepNumber === 10) {
    return "We're mapping your personality traits across 1,000+ variables...";
  } else if (stepNumber === 15) {
    return "Your future timeline is coming into focus. Almost ready!";
  }
  
  return null;
}

