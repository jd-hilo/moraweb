import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { TypewriterText } from '../components/TypewriterText';
import { GradientButton } from '../components/GradientButton';
import { useOnboarding } from '../context/OnboardingContext';
import { generateLifeSimulation } from '../lib/simulation';
import { supabase } from '../lib/supabase';
import { trackEvent, Events } from '../lib/mixpanel';

const simulationLoadingMessages = [
  'Analyzing your digital twin...',
  'Generating life scenarios...',
  'Calculating probabilities...',
  'Building your timeline...',
  'Finalizing simulation...',
];

export function SimulateLifePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: onboardingData } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const autoRunRef = useRef<string | null>(null);

  // Reset state when component mounts or location changes
  useEffect(() => {
    console.log('📍 SimulateLifePage mounted/updated, pathname:', location.pathname);
    console.log('📍 Location state:', location.state);
    setIsGenerating(false);
    setCurrentMessageIndex(0);
    setShowButton(false);
    autoRunRef.current = null;
  }, [location.pathname]);

  useEffect(() => {
    console.log('🔍 Checking autoRun state:', {
      hasAutoRun: !!location.state?.autoRun,
      currentRef: autoRunRef.current,
      isGenerating,
      timestamp: location.state?.timestamp
    });
    
    const autoRunKey = location.state?.autoRun ? `autoRun-${location.state.timestamp || Date.now()}` : null;
    if (autoRunKey && autoRunRef.current !== autoRunKey && !isGenerating) {
      console.log('✅ AutoRun detected! Triggering simulation generation...');
      autoRunRef.current = autoRunKey;
      handleGenerateSimulation();
    } else if (autoRunKey && autoRunRef.current === autoRunKey) {
      console.log('⚠️ AutoRun already processed, skipping');
    } else if (autoRunKey && isGenerating) {
      console.log('⚠️ Already generating, skipping autoRun');
    }
  }, [location.state, isGenerating]);

  useEffect(() => {
    if (isGenerating) {
      setShowButton(false);
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => {
          if (prev >= simulationLoadingMessages.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateSimulation = async () => {
    console.log('🚀 Simulate My Life button clicked - starting AI generation...');
    setIsGenerating(true);
    setCurrentMessageIndex(0);

    try {
      // No auth required - users can create simulations without an account
      trackEvent(Events.SIMULATION_STARTED, {
        is_auto_run: !!location.state?.autoRun,
      });

      console.log('🔄 Starting simulation generation...');
      const simulationData = await generateLifeSimulation(onboardingData);
      console.log('✅ Simulation data received:', {
        hasOneYear: !!simulationData.one_year,
        hasThreeYear: !!simulationData.three_year,
        hasFiveYear: !!simulationData.five_year,
        hasTenYear: !!simulationData.ten_year,
      });

      // Try to save simulation to database (user_id is nullable)
      // If save fails, we'll still show results using the data directly
      let simulationId: string | null = null;
      
      try {
        const simulationType = onboardingData.simulationType || 'career';
        const simulationTypeLabels: Record<string, string> = {
          career: 'Career',
          relationship: 'Relationship',
          social: 'Social Life',
        };
        
        const { data: simulation, error: simulationError } = await supabase
          .from('websims')
          .insert({
            user_id: null, // Anonymous user - no account required
            scenarios: simulationData,
            summary: `${simulationTypeLabels[simulationType] || 'Life'} simulation based on digital twin`,
          })
          .select()
          .single();

        if (!simulationError && simulation) {
          simulationId = simulation.id;
        }
      } catch (dbError) {
        console.warn('Could not save simulation to database (continuing anyway):', dbError);
        // Continue without database save - we'll use the data directly
      }

      // Track simulation generation success
      trackEvent(Events.SIMULATION_GENERATED, {
        simulation_id: simulationId,
        has_one_year: !!simulationData.one_year?.length,
        has_three_year: !!simulationData.three_year?.length,
        has_five_year: !!simulationData.five_year?.length,
        has_ten_year: !!simulationData.ten_year?.length,
      });

      // Navigate to results with simulation data
      // If we have an ID, use it; otherwise pass the data directly
      navigate('/simulation-results', {
        state: {
          simulationId: simulationId,
          simulationData: simulationId ? undefined : simulationData, // Pass data if no ID
          timestamp: Date.now(), // Add timestamp to force fresh load
        },
        replace: true, // Replace current history entry
      });
    } catch (error) {
      console.error('Error:', error);
      setIsGenerating(false);
      setShowButton(true);
    }
  };

  return (
    <OnboardingScreen progress={95} hideButton>
      <div className="text-center space-y-8">
        {!isGenerating ? (
          <>
            <div className="mb-8">
              <TypewriterText
                texts={["Your digital twin has been initialized"]}
                speed={60}
                onComplete={() => {
                  // Fade in button after text completes
                  setTimeout(() => {
                    setShowButton(true);
                  }, 300);
                }}
                className="text-3xl md:text-4xl font-serif font-bold text-black"
              />
            </div>
            {showButton && (
              <div className="animate-fade-in">
                <GradientButton
                  onClick={handleGenerateSimulation}
                  disabled={isGenerating}
                  variant="purple"
                >
                  Simulate My Life
                </GradientButton>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="min-h-[100px] flex items-center justify-center">
              <p className="text-xl text-gray-600 animate-pulse">
                {simulationLoadingMessages[currentMessageIndex]}
              </p>
            </div>
          </>
        )}
      </div>
    </OnboardingScreen>
  );
}
