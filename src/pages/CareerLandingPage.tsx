import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { Star, Shield, GitBranch, Building2, MapPin, Menu, X } from 'lucide-react';
import moraLogo from '../assets/mora.png';
import { trackEvent, Events } from '../lib/mixpanel';

export function CareerLandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [compRevealed, setCompRevealed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    trackEvent(Events.CAREER_LANDING_VIEWED);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setCompRevealed(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const startCareerOnboarding = (source: string) => {
    trackEvent(Events.GET_STARTED_CLICKED, { source, simulation_type: 'career' });
    navigate('/career/student-check');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20 ? 'bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4 md:py-5' : 'bg-transparent py-6 md:py-8'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center flex-shrink-0">
            <img src={moraLogo} alt="Mora" className="h-8 md:h-10 w-auto shrink-0 object-contain" />
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4 md:gap-6 flex-shrink-0">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm md:text-base font-medium text-gray-600 hover:text-black transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="text-sm md:text-base font-medium text-gray-600 hover:text-black transition-colors"
              >
                Log In
              </button>
            )}
            <GradientButton 
              onClick={() => startCareerOnboarding('nav')}
              size="sm"
              variant="purple"
              className="md:py-2.5 md:px-5 md:text-base"
            >
              Begin
            </GradientButton>
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-0 right-0 w-full max-w-[280px] h-full bg-white shadow-xl p-6 pt-14 flex flex-col gap-4 pb-safe animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="text-left py-3 font-medium text-gray-700 hover:text-black transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/auth');
                }}
                className="text-left py-3 font-medium text-gray-700 hover:text-black transition-colors"
              >
                Log In
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                startCareerOnboarding('mobile_menu');
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-center"
              style={{ background: 'linear-gradient(135deg, #25729f, #62edb9)' }}
            >
              Begin
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 px-5 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent -z-10" />
        <div className="absolute top-20 right-[-100px] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-[-100px] w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 rounded-full bg-gray-50 border border-gray-100 animate-fade-in">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white object-cover" />
            </div>
            <span className="text-[11px] md:text-sm font-medium text-gray-600">8,200+ Careers Simulated</span>
          </div>

          <h1 className="text-xl md:text-4xl font-bold text-black leading-tight tracking-tight">
            Ready to see where your career is headed?
          </h1>

          {/* Hero Preview — Blurred Comp Card */}
          <div className="mt-4 mb-4 md:mt-6 md:mb-6 relative">
            <div className="bg-gray-900 rounded-lg md:rounded-xl p-1.5 md:p-2 shadow-2xl border border-gray-200 max-w-[200px] md:max-w-sm mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="bg-white rounded-lg overflow-hidden relative min-h-[120px] md:min-h-[140px]">
                {!compRevealed ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-sm md:text-base font-medium text-gray-500 animate-pulse">Simulating...</p>
                  </div>
                ) : (
                  <div className="p-2 md:p-4 space-y-1 md:space-y-2 select-none animate-fade-in">
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Career Outcome</p>
                    <h4 className="text-sm md:text-lg font-bold text-black leading-tight" style={{ filter: 'blur(6px)' }}>Senior Engineering Manager</h4>
                    <div className="flex items-center gap-2 md:gap-3 text-[11px] md:text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span style={{ filter: 'blur(6px)' }}>Horizon Labs</span></span>
                      <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span style={{ filter: 'blur(6px)' }}>San Francisco, CA</span></span>
                    </div>
                    <div className="flex items-baseline gap-1.5 md:gap-2">
                      <span className="text-xl md:text-3xl font-bold text-black tracking-tight" style={{ filter: 'blur(6px)' }}>$285K</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200" style={{ filter: 'blur(6px)' }}>+12% vs Market</span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {[...Array(4)].map((_, i) => <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />)}
                      <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-200" />
                      <span className="text-[11px] md:text-xs text-gray-500 ml-0.5 md:ml-1" style={{ filter: 'blur(6px)' }}>4.2</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 md:gap-2 pt-1.5 md:pt-2 border-t border-gray-100">
                      {[
                        { label: 'Promotions', val: '3' },
                        { label: 'Team Size', val: '12' },
                        { label: 'Hours/Wk', val: '50' },
                        { label: 'Burnout', val: 'Med' },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[8px] md:text-[9px] text-gray-400">{s.label}</p>
                          <p className="text-xs md:text-sm font-bold text-black" style={{ filter: 'blur(6px)' }}>{s.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-2 md:gap-4 pt-3 md:pt-4 mb-4 md:mb-6">
            <div className="text-center bg-gray-50 rounded-lg px-2.5 py-2 md:px-6 md:py-4 border border-gray-100">
              <p className="text-base md:text-2xl font-bold text-black">91.3%</p>
              <p className="text-[10px] md:text-sm text-gray-500">Say it was accurate</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg px-2.5 py-2 md:px-6 md:py-4 border border-gray-100">
              <p className="text-base md:text-2xl font-bold text-black">8,200+</p>
              <p className="text-[10px] md:text-sm text-gray-500">Happy Customers</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
            <GradientButton 
              onClick={() => startCareerOnboarding('hero')}
              size="sm"
              variant="purple"
              className="w-full sm:w-auto min-w-[180px] md:min-w-[280px] md:py-4 md:px-10 md:text-xl"
            >
              Simulate My Career
            </GradientButton>
            <p className="text-[11px] md:text-sm text-gray-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Secure • 5 Questions • 90 Seconds
            </p>
          </div>

          {/* Logos ticker */}
          <div className="mt-10 md:mt-12 pt-6 md:pt-8 w-full max-w-4xl mx-auto animate-fade-in overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <p className="text-center text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4 md:mb-6">As seen on</p>
            
            <div className="relative w-full">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
              
              <div className="flex w-max animate-scroll pause-on-hover">
                {[0, 1].map((set) => (
                  <div key={set} className="flex items-center gap-16 mx-8 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                    <div className="h-8 flex items-center text-black min-w-[100px] justify-center">
                       <svg className="h-6 w-auto" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                       </svg>
                    </div>
                    <div className="h-6 flex items-center text-[#029f73] min-w-[120px] justify-center">
                       <span className="text-xl font-bold tracking-tighter font-serif whitespace-nowrap">TechCrunch</span>
                    </div>
                    <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                       <span className="text-xl font-bold font-serif tracking-tight">Forbes</span>
                    </div>
                    <div className="h-8 flex items-center gap-2 min-w-[140px] justify-center">
                       <div className="w-6 h-6 rounded-full bg-[#DA552F] flex items-center justify-center text-white font-bold text-sm shrink-0">P</div>
                       <span className="text-lg font-bold text-[#DA552F] whitespace-nowrap">Product Hunt</span>
                    </div>
                    <div className="h-6 flex items-center text-black min-w-[80px] justify-center">
                       <span className="text-xl font-bold font-mono tracking-tighter border-2 border-black px-1">WIRED</span>
                    </div>
                    <div className="h-6 flex items-center text-[#e1005b] min-w-[100px] justify-center">
                       <span className="text-lg font-bold font-sans tracking-wide uppercase">The Verge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll See Section */}
      <section className="py-12 md:py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-xl md:text-4xl font-bold text-black mb-3 md:mb-4 font-recoleta">
              What you'll see
            </h2>
            <p className="text-sm md:text-lg text-gray-600">
              A complete picture of your career — the good, the bad, and what you need to know
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">

            {/* 1. Career Outcome Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 md:mb-3">Where You'll End Up</p>
              <div className="space-y-2 md:space-y-3">
                <h4 className="text-base md:text-lg font-bold text-black leading-tight">Senior Engineering Manager</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Horizon Labs</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> San Francisco, CA</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-black tracking-tight">$285K</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">+12% vs Market</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  <Star className="w-3.5 h-3.5 text-gray-200" />
                  <span className="text-xs text-gray-500 ml-1">4.2</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                  {[
                    { label: 'Promotions', val: '3' },
                    { label: 'Team Size', val: '12' },
                    { label: 'Hours/Wk', val: '50' },
                    { label: 'Burnout', val: 'Med' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[9px] text-gray-400">{s.label}</p>
                      <p className="text-sm font-bold text-black">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Career Timeline */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Your Path Year by Year</p>
              <div className="relative pl-5 space-y-4">
                <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-teal-400 to-green-400 opacity-30" />
                {[
                  { year: 1, role: 'Senior Software Engineer', comp: '$165k', co: 'Current Co.' },
                  { year: 3, role: 'Staff Engineer', comp: '$210k', co: 'Growth Startup' },
                  { year: 5, role: 'Engineering Manager', comp: '$255k', co: 'Growth Startup' },
                  { year: 10, role: 'Sr. Engineering Manager', comp: '$285k', co: 'Horizon Labs' },
                ].map((m) => (
                  <div key={m.year} className="relative flex items-start gap-3">
                    <div className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-[2.5px] border-teal-500 z-10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">Yr {m.year}</span>
                        <span className="text-sm font-bold text-black truncate">{m.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{m.co}</span>
                        <span className="font-bold text-gray-600">{m.comp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. A Random Tuesday */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">📱 What Your Day Looks Like</p>
              <p className="text-xs text-gray-500 mb-3">Tuesday, March 15, 2034</p>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3">
                {[
                  { icon: '💬', app: 'Slack', title: 'Design Review', body: 'Sarah shared 3 mockups for your review', time: '9:30 AM' },
                  { icon: '📧', app: 'Gmail', title: 'Board Update Due', body: 'Quarterly metrics deck due Friday', time: '10:15 AM' },
                  { icon: '📅', app: 'Calendar', title: 'Reminder', body: '1:1 with your VP in 15 minutes', time: '1:45 PM' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-1.5 bg-white rounded-lg">
                    <span className="text-sm flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-[10px] font-bold text-gray-700">{n.app}</p>
                        <span className="text-[9px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800 truncate">{n.title}</p>
                      <p className="text-[9px] text-gray-400 truncate">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-black">23</p>
                  <p className="text-[9px] text-gray-400">Decisions Made</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-black">2</p>
                  <p className="text-[9px] text-gray-400">Impostor Moments</p>
                </div>
              </div>
            </div>

            {/* 4. The Email */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">📧 The Big Email</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <div className="space-y-1 text-[10px] text-gray-500">
                  <div><span className="font-semibold text-gray-700">From:</span> David Chen &lt;david@horizonlabs.io&gt;</div>
                  <div><span className="font-semibold text-gray-700">Subject:</span> We'd like you to lead the platform team</div>
                  <div className="text-[9px] text-gray-400">Mon, Apr 12, 2028 — 2:34 PM</div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-4">
                    After seeing how you handled the Q1 migration — on time, zero incidents, and the team actually enjoyed the process — we've been talking about the next step for you. We're creating a new Platform Engineering org, and we want you to lead it. The role comes with a $40K bump, a fresh equity grant (details below), and a team of 8...
                  </p>
                </div>
                <div className="flex gap-3 text-[9px] text-gray-400 pt-1">
                  <span>📁 Career Milestones</span>
                  <span>👁 Opened 47 times</span>
                  <span>⭐ Starred</span>
                </div>
              </div>
            </div>

            {/* 5. Global Comparison */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">🌍 How You Compare</p>
              <div className="space-y-3.5">
                {[
                  { label: 'Income', pct: 8, width: 92 },
                  { label: 'Career Progression', pct: 12, width: 88 },
                  { label: 'Work-Life Balance', pct: 55, width: 45 },
                  { label: 'Equity', pct: 25, width: 75 },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-600 font-medium">{bar.label}</span>
                      <span className="font-bold text-gray-800">Top {bar.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-full rounded-full" style={{ width: `${bar.width}%`, background: 'linear-gradient(90deg, #25729f, #62edb9)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 italic mt-4 leading-relaxed">
                "You're making more money than 92% of people in your field, but working longer hours than most..."
              </p>
            </div>

            {/* 6. Regret Moments */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">😔 What You'll Regret</p>
              <div className="space-y-3">
                {[
                  { year: 2029, title: 'The Startup Job You Said No To', desc: 'You turned down a job at a startup. That company later became worth $40M. Your share would have been $2.8M.' },
                  { year: 2032, title: 'The Break You Never Took', desc: 'You worked too hard for three years straight. You got promoted, but you also got sleep problems.' },
                ].map((r) => (
                  <div key={r.year} className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{r.year}</span>
                    <h5 className="text-xs font-bold text-black mt-1.5">{r.title}</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">{r.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 italic mt-3 text-center">
                "You played it safe. It worked out — mostly."
              </p>
            </div>

            {/* 7. Team Feedback */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">💬 What People Say About You</p>
              <div className="space-y-3">
                {[
                  { avatar: '👤', author: 'Anonymous Coworker A', msg: "Best manager I've had. Gives honest feedback without being mean. Saved our project when the company wanted to shut it down.", reactions: [{ e: '❤️', c: 8 }, { e: '💯', c: 5 }] },
                  { avatar: '👤', author: 'Anonymous Coworker B', msg: "Takes too long to make decisions. Always wants everyone to agree when the answer is obvious.", reactions: [{ e: '👀', c: 3 }] },
                ].map((m, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{m.avatar}</span>
                      <span className="text-[10px] font-bold text-gray-700">{m.author}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-relaxed pl-6">{m.msg}</p>
                    <div className="flex gap-1.5 pl-6">
                      {m.reactions.map((r, ri) => (
                        <span key={ri} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full">{r.e} {r.c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 italic mt-3 border-t border-gray-100 pt-3">
                What they don't say: You turned into the kind of boss you used to complain about.
              </p>
            </div>

            {/* 8. Alternate Paths */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">🔀 What If You Choose Different?</p>
              <p className="text-xs text-gray-500 mb-3">See what happens if you make different choices</p>
              <div className="space-y-2.5">
                {[
                  { label: 'What if you took the startup CTO offer?', year: 3 },
                  { label: 'What if you went freelance in Year 5?', year: 5 },
                  { label: 'What if you moved to Europe?', year: 7 },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <GitBranch className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-black leading-tight">{p.label}</p>
                      <p className="text-[9px] text-gray-400">Branch point — Year {p.year}</p>
                    </div>
                    <span className="text-gray-300 text-sm">→</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 md:py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={moraLogo} alt="Mora" className="h-6 opacity-50" />
            <span className="text-sm text-gray-400">© 2026 Mora Inc.</span>
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
