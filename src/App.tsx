import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './context/OnboardingContext';

import { MarketingLandingPage } from './pages/MarketingLandingPage';
import { AuthScreen } from './pages/AuthScreen';
import { NameScreen } from './pages/onboarding/NameScreen';
import { SimulationTypeScreen } from './pages/onboarding/SimulationTypeScreen';
import { BirthYearScreen } from './pages/onboarding/BirthYearScreen';
import { ValuesScreen } from './pages/onboarding/ValuesScreen';
import { WorkStatusScreen } from './pages/onboarding/WorkStatusScreen';
import { LivingSituationScreen } from './pages/onboarding/LivingSituationScreen';
import { RelationshipStatusScreen } from './pages/onboarding/RelationshipStatusScreen';
import { FinancialSituationScreen } from './pages/onboarding/FinancialSituationScreen';
import { LifeStageScreen } from './pages/onboarding/LifeStageScreen';
import { GoalsScreen } from './pages/onboarding/GoalsScreen';
import { InterestsScreen } from './pages/onboarding/InterestsScreen';
import { HometownScreen } from './pages/onboarding/HometownScreen';
import { CollegeScreen } from './pages/onboarding/CollegeScreen';
import { CareerStartScreen } from './pages/onboarding/CareerStartScreen';
import { TurningPointScreen } from './pages/onboarding/TurningPointScreen';
import { ShapedMostScreen } from './pages/onboarding/ShapedMostScreen';
import { ChallengesScreen } from './pages/onboarding/ChallengesScreen';
import { DecisionStyleScreen } from './pages/onboarding/DecisionStyleScreen';
import { StressHandlingScreen } from './pages/onboarding/StressHandlingScreen';
import { PoliticsScreen } from './pages/onboarding/PoliticsScreen';
import { ClarifierScreen } from './pages/onboarding/ClarifierScreen';
import { CompleteScreen } from './pages/onboarding/CompleteScreen';
import { PaywallScreen } from './pages/PaywallScreen';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { SimulateLifePage } from './pages/SimulateLifePage';
import { DecideForMePage } from './pages/DecideForMePage';
import { SimulationResultsPage } from './pages/SimulationResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestorsPage } from './pages/InvestorsPage';

import { CareerLandingPage } from './pages/CareerLandingPage';

// Career simulation imports
import { StudentCheckScreen } from './pages/career/StudentCheckScreen';
import { StudentDetailsScreen } from './pages/career/StudentDetailsScreen';
import { RoleScreen } from './pages/career/RoleScreen';
import { SalaryScreen } from './pages/career/SalaryScreen';
import { HorizonScreen } from './pages/career/HorizonScreen';
import { CareerGoalsScreen } from './pages/career/CareerGoalsScreen';
import { WorkStyleScreen } from './pages/career/WorkStyleScreen';
import { RiskScreen } from './pages/career/RiskScreen';
import { EmailScreen } from './pages/career/EmailScreen';
import { CareerPaywallScreen } from './pages/career/CareerPaywallScreen';
import { CareerGeneratingPage } from './pages/career/CareerGeneratingPage';
import { CareerResultsPage } from './pages/career/CareerResultsPage';

function App() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
        <Routes>
          <Route path="/" element={<MarketingLandingPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auth" element={<AuthScreen />} />

          <Route path="/onboarding/name" element={<NameScreen />} />
          <Route path="/onboarding/simulation-type" element={<SimulationTypeScreen />} />
          <Route path="/onboarding/birth-year" element={<BirthYearScreen />} />
          <Route path="/onboarding/values" element={<ValuesScreen />} />
          <Route path="/onboarding/work-status" element={<WorkStatusScreen />} />
          <Route path="/onboarding/living-situation" element={<LivingSituationScreen />} />
          <Route path="/onboarding/relationship-status" element={<RelationshipStatusScreen />} />
          <Route path="/onboarding/financial-situation" element={<FinancialSituationScreen />} />
          <Route path="/onboarding/life-stage" element={<LifeStageScreen />} />
          <Route path="/onboarding/goals" element={<GoalsScreen />} />
          <Route path="/onboarding/interests" element={<InterestsScreen />} />
          <Route path="/onboarding/hometown" element={<HometownScreen />} />
          <Route path="/onboarding/college" element={<CollegeScreen />} />
          <Route path="/onboarding/career-start" element={<CareerStartScreen />} />
          <Route path="/onboarding/turning-point" element={<TurningPointScreen />} />
          <Route path="/onboarding/shaped-most" element={<ShapedMostScreen />} />
          <Route path="/onboarding/challenges" element={<ChallengesScreen />} />
          <Route path="/onboarding/decision-style" element={<DecisionStyleScreen />} />
          <Route path="/onboarding/stress-handling" element={<StressHandlingScreen />} />
          <Route path="/onboarding/politics" element={<PoliticsScreen />} />
          <Route path="/onboarding/clarifier" element={<ClarifierScreen />} />
          <Route path="/onboarding/complete" element={<CompleteScreen />} />

          <Route path="/paywall" element={<PaywallScreen />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/simulate-life" element={<SimulateLifePage />} />
          <Route path="/decide-for-me" element={<DecideForMePage />} />
          <Route path="/simulation-results" element={<SimulationResultsPage />} />

          {/* Career simulation routes */}
          <Route path="/career" element={<CareerLandingPage />} />
          <Route path="/career/student-check" element={<StudentCheckScreen />} />
          <Route path="/career/student-details" element={<StudentDetailsScreen />} />
          <Route path="/career/role" element={<RoleScreen />} />
          <Route path="/career/salary" element={<SalaryScreen />} />
          <Route path="/career/horizon" element={<HorizonScreen />} />
          <Route path="/career/goals" element={<CareerGoalsScreen />} />
          <Route path="/career/work-style" element={<WorkStyleScreen />} />
          <Route path="/career/risk" element={<RiskScreen />} />
          <Route path="/career/email" element={<EmailScreen />} />
          <Route path="/career/paywall" element={<CareerPaywallScreen />} />
          <Route path="/career/generating" element={<CareerGeneratingPage />} />
          <Route path="/career/results" element={<CareerResultsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OnboardingProvider>
    </BrowserRouter>
  );
}

export default App;
