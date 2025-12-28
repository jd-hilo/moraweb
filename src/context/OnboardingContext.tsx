import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface OnboardingData {
  firstName: string;
  birthYear: string;
  values: string[];
  workStatus: string;
  jobTitle?: string;
  jobHappiness?: number;
  livingWith: string;
  relationshipStatus: string;
  relationshipLength?: string;
  beenInRelationship?: string;
  lookingFor?: string;
  partnerName?: string;
  relationshipHappiness?: number;
  singleLength?: string;
  financialSituation: string;
  lifeStage: string;
  goals?: string;
  interests: string[];
  hometown: string;
  wentToCollege: string;
  collegeName?: string;
  careerStart: string;
  turningPoint: string;
  shapedMost: string;
  challenges?: string;
  decisionStyle: string;
  stressHandling?: string;
  politics: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const defaultData: OnboardingData = {
  firstName: '',
  birthYear: '',
  values: [],
  workStatus: '',
  livingWith: '',
  relationshipStatus: '',
  financialSituation: '',
  lifeStage: '',
  interests: [],
  hometown: '',
  wentToCollege: '',
  careerStart: '',
  turningPoint: '',
  shapedMost: '',
  decisionStyle: '',
  politics: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(() => {
    const saved = localStorage.getItem('onboardingData');
    return saved ? JSON.parse(saved) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem('onboardingData', JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(defaultData);
    localStorage.removeItem('onboardingData');
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
