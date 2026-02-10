import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { useCareerPro } from '../hooks/useCareerPro';
import { Sparkles, Clock, Share2, LogOut } from 'lucide-react';
import moraIcon from '../assets/moraicon.png';
import { trackEvent, resetUser, Events } from '../lib/mixpanel';
import { identifyReddit } from '../lib/reddit';

const BILLING_PORTAL_URL =
  import.meta.env.VITE_STRIPE_BILLING_PORTAL_URL ||
  'https://billing.stripe.com/p/login/dRm14n9bBaOv9yn5AfbjW00';

interface WebSim {
  id: string;
  scenarios: any;
  summary: string;
  simulation_type?: 'life' | 'career';
  created_at: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { hasAccess: isPremium } = useCareerPro();
  const [simulations, setSimulations] = useState<WebSim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }

        setUser(currentUser);
        identifyReddit({
          email: currentUser.email ?? undefined,
          externalId: currentUser.id,
        });

        // Fetch user's simulations
        let careerSims: WebSim[] = [];
        const { data, error } = await supabase
          .from('websims')
          .select('id, scenarios, summary, created_at')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          careerSims = data.filter(
            (s) => (s as WebSim).simulation_type === 'career' ||
              s.scenarios?.outcome != null ||
              s.scenarios?.timeHorizon != null
          );
        }

        if (error) {
          console.error('Error fetching simulations:', error);
        } else {
          setSimulations(careerSims);
          // Track dashboard viewed
          trackEvent(Events.DASHBOARD_VIEWED, {
            user_id: currentUser.id,
            simulation_count: careerSims.length,
          });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleShare = async (simulationId: string, isCareer?: boolean) => {
    const path = isCareer ? '/career/results' : '/simulation-results';
    const shareUrl = `${window.location.origin}${path}?simulationId=${simulationId}`;
    const shareMessage = `Check out my life simulation - presented by mora.\n\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareMessage);
      trackEvent(Events.SIMULATION_SHARED, {
        simulation_id: simulationId,
        user_id: user?.id,
        share_method: 'copy_link',
        source: 'dashboard',
      });
      alert('Simulation link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBillingPortal = () => {
    setPortalLoading(true);
    window.open(BILLING_PORTAL_URL, '_blank');
    setTimeout(() => setPortalLoading(false), 500);
  };

  const handleSignOut = async () => {
    try {
      trackEvent(Events.SIGN_OUT, {
        user_id: user?.id,
      });
      resetUser();
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={moraIcon} 
              alt="Mora" 
              className="w-12 h-12"
            />
            <h1 
              className="text-3xl md:text-4xl font-bold text-black"
              style={{ 
                fontFamily: 'Recoleta, Georgia, serif',
                fontVariantLigatures: 'none',
                WebkitFontFeatureSettings: '"liga" off',
                fontFeatureSettings: '"liga" off'
              }}
            >
              Your Dashboard
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Simulations List */}
        {simulations.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center shadow-lg mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">No career simulations yet</h2>
              <p className="text-gray-600 mb-6">Run your first career simulation to see your projection</p>
              <GradientButton
                onClick={() => navigate('/career/student-check')}
                variant="purple"
              >
                Start Career Simulation
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">Your Career Simulations</h2>
            <div className="grid gap-4">
              {simulations.map((sim) => {
                const outcomeTitle = sim.scenarios?.outcome?.title;
                return (
                  <div
                    key={sim.id}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() =>
                      navigate('/career/results', {
                        state: {
                          careerSimulation: sim.scenarios,
                          simulationId: sim.id,
                        },
                      })
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-500">
                            {formatDate(sim.created_at)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-black mb-1">
                          Career Simulation
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {outcomeTitle || sim.summary || 'Your career projection'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(sim.id, true);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4 flex-shrink-0"
                        title="Share simulation"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer with Terms of Service and Contact */}
        <div className="pt-12 pb-6 flex flex-wrap items-center gap-4">
          <a
            href="https://pastoral-supply-662.notion.site/Terms-of-Service-Mora-2d72cec59ddf80099945c84fe81add84?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="mailto:hello@hilo.media"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Contact Us
          </a>
          {isPremium && (
            <>
              <span className="text-gray-300">•</span>
              <button
                onClick={handleBillingPortal}
                disabled={portalLoading}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-60"
              >
                {portalLoading ? 'Opening...' : 'Cancel subscription'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

