// Career Simulation Types

export interface CareerOnboardingData {
  // Everyone
  timeHorizon: 5 | 10 | 15;
  careerPriorities: string;       // Legacy free-text (kept for compat)
  careerGoals?: string[];         // e.g. ['money', 'balance', 'impact']
  workStyle?: string;             // 'big-company' | 'startup' | 'remote-freelance' | 'own-business'
  riskTolerance?: string;         // 'safe' | 'balanced' | 'aggressive'

  // Students only
  isStudent: boolean;
  gradeLevel?: string;            // "High School" | "Freshman" | ... | "Graduate Student"
  school?: string;
  studying?: string;

  // Working professionals only
  currentRole?: string;           // "Software Engineer"
  company?: string;               // "Google"
  salary?: string;                // "150000"
}

export interface CareerSimulation {
  id: string;
  timeHorizon: 5 | 10 | 15;
  pathName: string;
  confidence: number;
  outcome: CareerOutcome;
  stats: CareerStats;
  timeline: { milestones: TimelineNode[] };
  globalComparison: GlobalComparison;
  zoomIns: ZoomIns;
  societalImpact: SocietalImpact;
  alternatePaths: AlternatePath[];
}

export interface CareerOutcome {
  title: string;
  company: string;
  totalComp: number;
  location: string;
  satisfaction: number; // 0-5
}

export interface CareerStats {
  compensation: { base: number; equity: number };
  growth: { promotions: number; yearsToSenior: number; teamSize: number };
  workLife: {
    hoursPerWeek: number;
    burnoutRisk: 'Low' | 'Medium' | 'High';
    flexibility: 'Low' | 'Medium' | 'High';
  };
  skills: { technical: string; leadership: string; expertise: string };
}

export interface TimelineNode {
  year: number;
  title: string;
  company: string;
  salary: number;
  description?: string;
}

export interface GlobalComparison {
  income: {
    yourComp: number;
    globalPercentile: number;
    globalAverage: number;
    usAverage: number;
    topEarners: { range: string; group: string };
    developingMarkets: { min: number; max: number };
  };
  careerProgression: {
    yourLevel: string;
    globalPercentile: number;
    mostCommon: string;
    fastest: string;
    many: string;
  };
  workLife: {
    yourHours: number;
    globalPercentile: number;
    range: { min: number; minLabel: string; max: number; maxLabel: string };
    bestBalance: string;
    worstBalance: string;
  };
  equity: {
    yourEquity: number;
    globalPercentile: number;
    mostEngineers: string;
    lotteryWinners: { range: string; percentage: number };
    note: string;
  };
  geographic: {
    northAmerica: number;
    europe: number;
    asia: number;
    latinAmerica: number;
    note: string;
  };
  globalReality: string;
}

export interface ZoomIns {
  regretMoments: RegretMoment[];
  reflection: string;
  cards: Array<{ id: string; title: string; icon: string }>;
  randomTuesday: RandomTuesdayData;
  theEmail: EmailData;
  calendar: CalendarData;
  teamFeedback: FeedbackData;
  inbox: InboxData;
}

export interface RegretMoment {
  year: number;
  title: string;
  description: string;
}

export interface RandomTuesdayData {
  date: string;
  notifications: Array<{
    app: string;
    icon: string;
    title: string;
    body: string;
    time: string;
  }>;
  timeline: Array<{
    time: string;
    icon: string;
    title: string;
    description: string;
  }>;
  stats: { decisionsMade: number; imposterSyndromeMoments: number };
}

export interface EmailData {
  from: string;
  to: string;
  subject: string;
  timestamp: string;
  body: string;
  metadata: { folder: string; timesOpened: number; lastUpdate: string };
}

export interface CalendarData {
  current: CalendarView;
  future: CalendarView;
  stats: {
    meetingsPerWeek: { current: number; future: number };
    stressLevel: { current: string; future: string };
    controlLevel: { current: string; future: string };
    lastOpenedFigma: { current: string; future: string };
  };
}

export interface CalendarView {
  year: number;
  events: Array<{
    day: string;
    time: string;
    title: string;
    color: string;
    duration: number;
  }>;
}

export interface FeedbackData {
  messages: Array<{
    author: string;
    avatar: string;
    timestamp: string;
    message: string;
    reactions: Array<{ emoji: string; count: number }>;
  }>;
  finalMessage: string;
}

export interface InboxData {
  current: InboxView;
  future: InboxView;
  stats: {
    responseTime: { current: string; future: string };
    stressLevel: { current: string; future: string };
  };
}

export interface InboxView {
  year: number;
  emails: Array<{
    sender: string;
    subject: string;
    time: string;
    unread: boolean;
    important?: boolean;
  }>;
  filteredCount?: number;
}

export interface SocietalImpact {
  productsShipped: string[];
  peopleInfluenced: string[];
  industryContributions: string[];
  rippleEffect: string;
  honestAssessment: string;
}

export interface AlternatePath {
  id: string;
  label: string;
  year?: number;
  decision?: string;
}
