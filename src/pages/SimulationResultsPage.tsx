import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { Sparkles, TrendingUp, TrendingDown, Share2, X } from 'lucide-react';
import { TimelineSimulation, TimelineEvent } from '../lib/simulation';
import moraIcon from '../assets/moraicon.png';
import moraLogo from '../assets/mora.png';
import { trackEvent, Events } from '../lib/mixpanel';

export function SimulationResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Support both location.state and URL query params for public access
  const { simulationId: stateSimulationId } = location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const querySimulationId = searchParams.get('simulationId');
  const simulationId = stateSimulationId || querySimulationId;
  
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Use Intersection Observer for scroll animations
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchSimulation = async () => {
      if (!simulationId) {
        // If no simulationId in URL or state, redirect to home
        if (!querySimulationId && !stateSimulationId) {
          navigate('/');
        }
        return;
      }

      // Reset state when simulationId changes
      setIsLoading(true);
      setSimulationData(null);

      console.log('Fetching simulation with ID:', simulationId);

      // Try to fetch simulation - this should work for public access
      const { data, error } = await supabase
        .from('websims')
        .select('*')
        .eq('id', simulationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching simulation:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Don't redirect immediately - show error state instead
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.error('Simulation not found for ID:', simulationId);
        setIsLoading(false);
        return;
      }

      console.log('Simulation fetched successfully:', data.id);
      setSimulationData(data);
      setIsLoading(false);
      
      // Track simulation viewed
      trackEvent(Events.SIMULATION_VIEWED, {
        simulation_id: data.id,
        user_id: data.user_id,
        is_shared_link: !!querySimulationId,
      });
      
      // Trigger page load animation after data is loaded
      setTimeout(() => {
        setIsPageLoaded(true);
      }, 100);
    };

    fetchSimulation();
  }, [simulationId, navigate, querySimulationId, stateSimulationId]);

  // Check if current user is the owner
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
      if (user && simulationData?.user_id) {
        setIsOwner(user.id === simulationData.user_id);
      } else {
        setIsOwner(false);
        // Show modal for non-owners after a short delay
        setTimeout(() => {
          setShowModal(true);
          trackEvent(Events.SHARE_MODAL_SHOWN, {
            simulation_id: simulationData.id,
          });
        }, 2000);
      }
    };

    if (simulationData) {
      checkUser();
    }
  }, [simulationData]);

  useEffect(() => {
    if (!isLoading) {
      // Setup observer for scroll animations
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observerRef.current?.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe all timeline cards
      document.querySelectorAll('.timeline-card').forEach((card) => {
        observerRef.current?.observe(card);
      });

      return () => observerRef.current?.disconnect();
    }
  }, [isLoading]);

  // Calculate timeline and events (always, even when loading)
  const timeline: TimelineSimulation = simulationData?.scenarios || {
    one_year: [],
    three_year: [],
    five_year: [],
    ten_year: [],
  };
  
  const allEvents: (TimelineEvent & { period: string })[] = [
    ...(timeline?.one_year?.map(e => ({ ...e, period: '1 Year' })) || []),
    ...(timeline?.three_year?.map(e => ({ ...e, period: '3 Years' })) || []),
    ...(timeline?.five_year?.map(e => ({ ...e, period: '5 Years' })) || []),
    ...(timeline?.ten_year?.map(e => ({ ...e, period: '10 Years' })) || []),
  ];

  // Calculate average probability (always call hooks)
  const averageProbability = useMemo(() => {
    const eventsWithProb = allEvents.filter(e => e.probability !== undefined && e.probability !== null);
    if (eventsWithProb.length === 0) return 0;
    const sum = eventsWithProb.reduce((acc, e) => acc + (e.probability || 0), 0);
    return Math.round(sum / eventsWithProb.length);
  }, [allEvents]);

  // Determine confidence level and badge - using website's gradient colors
  const confidenceLevel = useMemo(() => {
    if (averageProbability >= 75) {
      return { text: 'High Confidence', icon: TrendingUp, color: 'bg-turquoise/10', textColor: 'text-turquoise-dark', borderColor: 'border-turquoise/20' };
    } else if (averageProbability >= 50) {
      return { text: 'Moderate Confidence', icon: TrendingUp, color: 'bg-purple/10', textColor: 'text-purple', borderColor: 'border-purple/20' };
    } else {
      return { text: 'Optimistic Outlook', icon: TrendingUp, color: 'bg-peach-dark/10', textColor: 'text-peach-dark', borderColor: 'border-peach-dark/20' };
    }
  }, [averageProbability]);

  // Generate chart data points (probability over time)
  const chartData = useMemo(() => {
    const periods = ['1 Year', '3 Years', '5 Years', '10 Years'];
    return periods.map(period => {
      const periodEvents = allEvents.filter(e => e.period === period && e.probability !== undefined);
      if (periodEvents.length === 0) return 50;
      const avg = periodEvents.reduce((sum, e) => sum + (e.probability || 0), 0) / periodEvents.length;
      return Math.round(avg);
    });
  }, [allEvents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600 animate-pulse">Loading simulation...</p>
      </div>
    );
  }

  if (!simulationData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-600">Simulation not found</p>
          <GradientButton onClick={() => navigate('/')}>
            Go Home
          </GradientButton>
        </div>
      </div>
    );
  }

  const handleRunAnotherSimulation = async () => {
    console.log('🔄 Run Another Simulation button clicked');
    console.log('📋 Current simulationId:', simulationId);
    
    // Set loading state
    setIsGeneratingNew(true);
    
    // Reset component state
    setIsLoading(true);
    setSimulationData(null);

    if (!simulationId) {
      console.log('⚠️ No simulationId, navigating to simulate-life');
      navigate('/simulate-life', { 
        state: { autoRun: true, timestamp: Date.now() },
        replace: true 
      });
      return;
    }

    // Delete the current simulation
    console.log('🗑️ Deleting current simulation:', simulationId);
    try {
      const { error } = await supabase
        .from('websims')
        .delete()
        .eq('id', simulationId);

      if (error) {
        console.error('❌ Error deleting simulation:', error);
        // Still navigate even if delete fails
      } else {
        console.log('✅ Deleted old simulation:', simulationId);
      }
    } catch (error) {
      console.error('❌ Error deleting simulation:', error);
      // Still navigate even if delete fails
    }

    // Navigate to generate a new simulation with timestamp to force fresh generation
    console.log('🚀 Navigating to /simulate-life with autoRun=true');
    navigate('/simulate-life', { 
      state: { autoRun: true, timestamp: Date.now() },
      replace: true 
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/simulation-results?simulationId=${simulationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent(Events.SIMULATION_SHARED, {
        simulation_id: simulationId,
        user_id: currentUserId,
        share_method: 'copy_link',
      });
      trackEvent(Events.SHARE_LINK_COPIED, {
        simulation_id: simulationId,
      });
      // You could add a toast notification here
      alert('Simulation link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const ConfidenceIcon = confidenceLevel.icon;

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className={`max-w-4xl mx-auto space-y-12 transition-all duration-700 ease-out ${
        isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-center gap-4">
          <img 
            src={moraIcon} 
            alt="Mora" 
            className="w-12 h-12"
          />
          <div className="flex flex-col items-center gap-1">
            <h1 
              className="text-3xl md:text-4xl font-bold text-black"
              style={{ 
                fontFamily: 'Recoleta, Georgia, serif',
                fontVariantLigatures: 'none',
                WebkitFontFeatureSettings: '"liga" off',
                fontFeatureSettings: '"liga" off'
              }}
            >
              Your Life Sim
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">presented by</span>
              <img 
                src={moraLogo} 
                alt="Mora" 
                className="h-4"
              />
            </div>
          </div>
        </div>

        {/* Probability Card Section */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#9CA3AF' }}>
            Based on your digital twin analysis
          </p>
          
          <div className="flex gap-4 items-start">
            <div className="relative rounded-3xl p-4 overflow-hidden bg-white border border-gray-100 shadow-lg flex-1" style={{
              minHeight: '120px'
            }}>
              {/* Card Content */}
              <div className="relative z-10">
                {/* Sub Header */}
                <p className="text-sm text-gray-600 mb-2" style={{ fontSize: '14px' }}>
                  Estimated Probability
                </p>

                {/* Large Percentage */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span 
                    className="text-black font-bold"
                    style={{ 
                      fontSize: '36px', 
                      fontWeight: 700, 
                      letterSpacing: '-1px',
                      lineHeight: '1'
                    }}
                  >
                    {averageProbability}%
                  </span>
                </div>

                {/* Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${confidenceLevel.color} ${confidenceLevel.borderColor} border`}>
                  <ConfidenceIcon className={`w-3 h-3 ${confidenceLevel.textColor}`} style={{ width: '12px', height: '12px' }} />
                  <span className={`text-xs font-bold ${confidenceLevel.textColor}`} style={{ fontSize: '11px' }}>
                    {confidenceLevel.text}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="relative space-y-16 pl-8 md:pl-0">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-turquoise to-purple md:left-1/2 md:-ml-0.5 opacity-30"></div>

          {['1 Year', '3 Years', '5 Years', '10 Years'].map((period, periodIndex) => {
            const periodEvents = allEvents.filter(e => e.period === period);

            return (
              <div key={period} className="space-y-8 relative">
                {/* Period Marker */}
                <div className="flex items-center md:justify-center mb-8 relative">
                  <div className="absolute left-[-33px] md:left-auto w-4 h-4 rounded-full bg-white border-4 border-purple z-10 shadow-md"></div>
                  <h2 className="text-xl font-bold text-black bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full border border-gray-100 shadow-sm inline-block z-10">
                    {period}
                  </h2>
                  
                  {/* Share Button - Right side, aligned with 1 Year (only for owner, first period) */}
                  {isOwner && periodIndex === 0 && (
                    <div className="absolute right-0 top-0 md:right-[-200px] md:top-0 z-20">
                      <GradientButton
                        onClick={handleShare}
                        variant="purple"
                        size="md"
                        className="flex items-center gap-2 shadow-xl hover:scale-105 transition-transform whitespace-nowrap"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Sim
                      </GradientButton>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {periodEvents.map((event, index) => (
                    <div
                      key={`${periodIndex}-${index}`}
                      className={`timeline-card opacity-0 translate-y-8 transition-all duration-700 ease-out md:flex ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8 items-center group`}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-[-37px] md:left-1/2 md:-ml-3 w-6 h-6 rounded-full bg-white border-4 border-turquoise group-hover:scale-125 transition-transform duration-300 z-10 shadow-md"></div>

                      {/* Content Card */}
                      <div className="flex-1 md:w-1/2">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group-hover:border-turquoise/30">
                          {/* Probability Badge */}
                          {event.probability && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                              <TrendingUp className="w-3.5 h-3.5 text-turquoise" />
                              <span className="text-xs font-semibold text-gray-700">
                                {event.probability}%
                              </span>
                            </div>
                          )}

                          <div className="text-sm font-bold text-turquoise mb-2 tracking-wide uppercase">
                            {event.time}
                          </div>
                          <h3 className="text-xl font-bold text-black mb-3 pr-16 leading-tight">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Spacer for layout balance */}
                      <div className="hidden md:block flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          {isOwner ? (
            <GradientButton 
              onClick={handleShare}
              variant="purple"
              size="lg"
              className="flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Simulation
            </GradientButton>
          ) : (
            <GradientButton
              onClick={() => navigate('/auth')}
              variant="purple"
              size="lg"
            >
              Simulate Your Own Life
            </GradientButton>
          )}
        </div>
      </div>

      {/* Engaging Modal for Non-Owners */}
      {showModal && !isOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <img 
                  src={moraIcon} 
                  alt="Mora" 
                  className="w-16 h-16"
                />
              </div>
              
              <div className="space-y-2">
                <h2 
                  className="text-2xl font-bold text-black"
                  style={{ 
                    fontFamily: 'Recoleta, Georgia, serif',
                    fontVariantLigatures: 'none',
                    WebkitFontFeatureSettings: '"liga" off',
                    fontFeatureSettings: '"liga" off'
                  }}
                >
                  Create Your Own Simulation
                </h2>
                <p className="text-gray-600">
                  See what your future could look like based on your unique digital twin. Answer a few questions and get your personalized 10-year life simulation.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <GradientButton
                  onClick={() => {
                    setShowModal(false);
                    navigate('/auth');
                  }}
                  variant="purple"
                  size="lg"
                >
                  Get Started
                </GradientButton>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
