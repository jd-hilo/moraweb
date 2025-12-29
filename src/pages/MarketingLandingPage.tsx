import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { Star, TrendingUp, Shield, Users, Clock, ArrowRight, PlayCircle, X } from 'lucide-react';
import moraLogo from '../assets/mora.png';
import moraIcon from '../assets/moraicon.png';
import { trackEvent, Events } from '../lib/mixpanel';

const demoSimulations = [
  {
    id: 1,
    title: "The Career Pivot",
    role: "Marketing Manager",
    scenario: "Transitioning to Tech",
    preview: "Success Probability: 87%",
    details: {
      year1: "Complete coding bootcamp while working part-time. Income drops by 40%.",
      year5: "Senior Developer at mid-sized fintech. Income 2x previous role.",
      year10: "CTO of Series B startup. High stress, high reward.",
      netWorth: "$1.2M",
      happiness: "8.5/10"
    }
  },
  {
    id: 2,
    title: "The Big Move",
    role: "Designer",
    scenario: "Relocating to Bali",
    preview: "Lifestyle Match: 94%",
    details: {
      year1: "Adjustment period. Lower cost of living allows for significant savings.",
      year5: "Established remote agency. Strong community network built.",
      year10: "Owning property in multiple countries. Freedom maximized.",
      netWorth: "$850k",
      happiness: "9.2/10"
    }
  },
  {
    id: 3,
    title: "The Startup Gamble",
    role: "Corporate Exec",
    scenario: "Bootstrapping SaaS",
    preview: "Success Chance: 42%",
    details: {
      year1: "Burn rate high. Living off savings. Product launch in Q4.",
      year5: "Profitable niche business. Team of 12. Moderate acquisition offers.",
      year10: "Successful exit or sustainable lifestyle business. Legacy built.",
      netWorth: "$3.5M",
      happiness: "7.8/10"
    }
  }
];

export function MarketingLandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState<typeof demoSimulations[0] | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<number>(0);

  const animatedEvents = [
    { year: 2025, event: "Started new remote job", impact: "+$15k Income" },
    { year: 2026, event: "Moved to a new city", impact: "High Happiness" },
  ];

  // Animation loop for hero section
  useEffect(() => {
    // Wait a bit before starting animation
    const startTimeout = setTimeout(() => {
      // Show events one by one
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setVisibleEvents(currentStep);
        
        // After showing all events, wait then show question mark
        if (currentStep === animatedEvents.length) {
          clearInterval(interval);
          setTimeout(() => {
            setVisibleEvents(-1); // -1 indicates question mark state
          }, 2000); // Keep events visible for 2s before switching
        }
      }, 1500);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(startTimeout);
  }, []);

  // Check if user is signed in and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      } else {
        // Track landing page view for non-authenticated users
        trackEvent(Events.LANDING_PAGE_VIEWED);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20 ? 'bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={moraLogo} alt="Mora" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                trackEvent(Events.GET_STARTED_CLICKED, { source: 'nav' });
                navigate('/auth');
              }} 
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Sign In
            </button>
            <GradientButton 
              onClick={() => {
                trackEvent(Events.GET_STARTED_CLICKED, { source: 'nav' });
                navigate('/welcome');
              }}
              size="sm"
              variant="purple"
            >
              Get Started
            </GradientButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-50/50 to-transparent -z-10" />
        <div className="absolute top-20 right-[-100px] w-96 h-96 bg-turquoise/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-[-100px] w-96 h-96 bg-purple/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 animate-fade-in">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
            </div>
            <span className="text-sm font-medium text-gray-600">12,567+ Lives Simulated</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight tracking-tight">
            Ready to see your future?
          </h1>

          {/* Hero Image/Preview */}
          <div className="mt-8 mb-8 relative">
            <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-200 max-w-xl mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="p-4 bg-gray-50 min-h-[200px]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold font-recoleta text-black">Your Future Timeline</h3>
                      <p className="text-[10px] text-gray-500">Simulating trajectory...</p>
                    </div>
                    <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Live
                    </div>
                  </div>
                  <div className="space-y-2 relative min-h-[120px]">
                    {visibleEvents !== -1 ? (
                      animatedEvents.map((event, i) => (
                        <div 
                          key={event.year} 
                          className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex gap-2 items-center transition-all duration-700 absolute w-full left-0 ${
                            i < visibleEvents 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-4'
                          }`}
                          style={{
                            top: `${i * 3.5}rem`,
                            transitionDelay: `${i * 200}ms`
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-[10px]">
                            {event.year}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-black">{event.event}</p>
                            <p className="text-[10px] text-gray-500">{event.impact}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center animate-fade-in py-2 h-full absolute inset-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-turquoise-100 flex items-center justify-center mb-2">
                          <span className="text-xl">?</span>
                        </div>
                        <p className="text-sm font-bold text-black">What happens next?</p>
                        <p className="text-xs text-gray-500">Only the simulation knows.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GradientButton 
              onClick={() => {
                trackEvent(Events.GET_STARTED_CLICKED, { source: 'hero' });
                navigate('/welcome');
              }}
              size="lg"
              variant="purple"
              className="w-full sm:w-auto min-w-[200px]"
            >
              Start Simulation
            </GradientButton>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Private & Secure • Proprietary Simulation Technology
            </p>
          </div>

          <div className="mt-12 pt-8 w-full max-w-4xl mx-auto animate-fade-in overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <p className="text-center text-xs font-semibold text-gray-300 uppercase tracking-widest mb-6">As seen on</p>
            
            <div className="relative w-full">
              {/* Gradient masks */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
              
              <div className="flex w-max animate-scroll pause-on-hover">
                {/* First set of logos */}
                <div className="flex items-center gap-16 mx-8 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                  {/* TikTok */}
                  <div className="h-8 flex items-center text-black min-w-[100px] justify-center">
                     <svg className="h-6 w-auto" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                     </svg>
                  </div>
                  
                  {/* TechCrunch */}
                  <div className="h-6 flex items-center text-[#029f73] min-w-[120px] justify-center">
                     <span className="text-xl font-bold tracking-tighter font-serif whitespace-nowrap">TechCrunch</span>
                  </div>

                   {/* Forbes */}
                  <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                     <span className="text-xl font-bold font-serif tracking-tight">Forbes</span>
                  </div>

                  {/* Product Hunt */}
                  <div className="h-8 flex items-center gap-2 min-w-[140px] justify-center">
                     <div className="w-6 h-6 rounded-full bg-[#DA552F] flex items-center justify-center text-white font-bold text-sm shrink-0">P</div>
                     <span className="text-lg font-bold text-[#DA552F] whitespace-nowrap">Product Hunt</span>
                  </div>

                  {/* Wired */}
                  <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                     <span className="text-xl font-bold font-mono tracking-tighter border-2 border-black px-1">WIRED</span>
                  </div>

                  {/* The Verge */}
                  <div className="h-6 flex items-center text-[#e1005b] min-w-[100px] justify-center">
                     <span className="text-lg font-bold font-sans tracking-wide uppercase">The Verge</span>
                  </div>
                </div>

                {/* Duplicate set for infinite scroll */}
                <div className="flex items-center gap-16 mx-8 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                  {/* TikTok */}
                  <div className="h-8 flex items-center text-black min-w-[100px] justify-center">
                     <svg className="h-6 w-auto" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                     </svg>
                  </div>
                  
                  {/* TechCrunch */}
                  <div className="h-6 flex items-center text-[#029f73] min-w-[120px] justify-center">
                     <span className="text-xl font-bold tracking-tighter font-serif whitespace-nowrap">TechCrunch</span>
                  </div>

                   {/* Forbes */}
                  <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                     <span className="text-xl font-bold font-serif tracking-tight">Forbes</span>
                  </div>

                  {/* Product Hunt */}
                  <div className="h-8 flex items-center gap-2 min-w-[140px] justify-center">
                     <div className="w-6 h-6 rounded-full bg-[#DA552F] flex items-center justify-center text-white font-bold text-sm shrink-0">P</div>
                     <span className="text-lg font-bold text-[#DA552F] whitespace-nowrap">Product Hunt</span>
                  </div>

                  {/* Wired */}
                  <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                     <span className="text-xl font-bold font-mono tracking-tighter border-2 border-black px-1">WIRED</span>
                  </div>

                  {/* The Verge */}
                  <div className="h-6 flex items-center text-[#e1005b] min-w-[100px] justify-center">
                     <span className="text-lg font-bold font-sans tracking-wide uppercase">The Verge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview removed from here */}
        </div>
      </section>

      {/* Sample Simulations Section */}
      <section className="hidden md:block py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-recoleta">
              See what your simulation looks like
            </h2>
            <p className="text-lg text-gray-600">
              Real examples of how Mora predicts your future path
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {demoSimulations.map((sim) => (
              <div 
                key={sim.id}
                onClick={() => setSelectedDemo(sim)}
                className="group cursor-pointer bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-2 shadow-sm">
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6 text-purple-600" />
                </div>
                
                <h3 className="text-lg font-bold text-black mb-1">{sim.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{sim.scenario}</p>
                
                <div className="bg-white rounded-lg p-3 border border-gray-100 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Projection</span>
                    <span className="text-xs font-bold text-green-600">{sim.preview}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-purple-500 to-turquoise-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-purple-600 transition-colors">
                  <span className="font-medium">View full trajectory</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="hidden md:block py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Digital Twin Technology</h3>
              <p className="text-gray-600">
                We build a complex model of your personality, values, and circumstances to create a highly accurate digital version of you.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-turquoise-light/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-turquoise-dark" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Predictive Modeling</h3>
              <p className="text-gray-600">
                Run thousands of simulations to see how different choices ripple out over 1, 5, and 10 years of your life.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-peach-light/30 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-peach-dark" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Instant Insights</h3>
              <p className="text-gray-600">
                Get immediate feedback on career moves, relationship decisions, and lifestyle changes before you commit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="hidden md:block py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 font-recoleta">
            Trusted by thousands of future-planners
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "The accuracy is scary. It predicted my exact career pivot 3 years before I made it.",
                author: "Sarah J.",
                role: "Product Designer"
              },
              {
                text: "I used Mora to decide between two job offers. The simulation showed me a perspective I hadn't considered.",
                author: "Michael C.",
                role: "Software Engineer"
              },
              {
                text: "Finally, a way to visualize the 'what ifs' in my life without the anxiety.",
                author: "Elena R.",
                role: "Marketing Director"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl text-left">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 font-medium">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-black">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hidden md:block py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-turquoise-900/20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <img src={moraIcon} alt="Mora" className="w-16 h-16 mx-auto mb-8 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-recoleta">
            Ready to meet your future self?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of others who are designing their lives with data, not just guessing.
          </p>
          <GradientButton 
            onClick={() => {
              trackEvent(Events.GET_STARTED_CLICKED, { source: 'cta' });
              navigate('/welcome');
            }}
            size="lg"
            variant="turquoise"
            className="w-full sm:w-auto min-w-[200px]"
          >
            Create Your Digital Twin
          </GradientButton>
        </div>
      </section>

      {/* Demo Modal */}
      {selectedDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDemo(null)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-slide-up shadow-2xl">
            <button 
              onClick={() => setSelectedDemo(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-recoleta text-black">{selectedDemo.title}</h3>
                  <p className="text-gray-500">{selectedDemo.scenario}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-black mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Projected Timeline
                  </h4>
                  <div className="space-y-4 relative pl-4 border-l-2 border-purple-100">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-white" />
                      <p className="text-xs font-bold text-purple-600 mb-1">Year 1</p>
                      <p className="text-gray-700 text-sm">{selectedDemo.details.year1}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-white" />
                      <p className="text-xs font-bold text-purple-600 mb-1">Year 5</p>
                      <p className="text-gray-700 text-sm">{selectedDemo.details.year5}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-turquoise-500 ring-4 ring-white" />
                      <p className="text-xs font-bold text-turquoise-600 mb-1">Year 10</p>
                      <p className="text-gray-700 text-sm">{selectedDemo.details.year10}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-green-600 font-bold mb-1">Projected Net Worth</p>
                    <p className="text-xl font-bold text-green-700">{selectedDemo.details.netWorth}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold mb-1">Happiness Score</p>
                    <p className="text-xl font-bold text-blue-700">{selectedDemo.details.happiness}</p>
                  </div>
                </div>

                <div className="pt-4 text-center">
                   <GradientButton 
                    onClick={() => {
                      trackEvent(Events.GET_STARTED_CLICKED, { source: 'demo_modal' });
                      navigate('/welcome');
                    }}
                    className="w-full"
                    variant="purple"
                  >
                    Simulate My Life Now
                  </GradientButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="hidden md:block py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={moraLogo} alt="Mora" className="h-6 opacity-50" />
            <span className="text-sm text-gray-400">© 2024 Mora Inc.</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="https://pastoral-supply-662.notion.site/Terms-of-Service-Mora-2d72cec59ddf80099945c84fe81add84?source=copy_link" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

