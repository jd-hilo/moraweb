import { useState, useEffect, useRef } from 'react';
import { TypewriterText } from '../components/TypewriterText';
import { GradientButton } from '../components/GradientButton';
import { Star, ArrowRight, TrendingUp, Users, Globe, Building2, Loader2 } from 'lucide-react';
import moraLogo from '../assets/mora.png';
import { supabase } from '../lib/supabase';

type Stage = 'intro' | 'questions' | 'simulation' | 'deck';

export function InvestorsPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    firmName: '',
    aum: '',
    focus: '',
    link: ''
  });
  const [showIntroButton, setShowIntroButton] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Deck scroll ref
  const deckRef = useRef<HTMLDivElement>(null);

  const introMessages = [
    "simulate the life of your firm",
    "see the future of your portfolio",
    "understand the impact of decision intelligence"
  ];

  const handleIntroComplete = () => {
    setShowIntroButton(true);
  };

  const startQuestions = () => {
    if (email) {
      setStage('questions');
    }
  };

  const runSimulation = async () => {
    setIsSubmitting(true);
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('investor_leads')
        .insert([
          {
            email,
            firm_name: formData.firmName,
            aum_stage: formData.aum,
            primary_focus: formData.focus,
            website_link: formData.link
          }
        ]);

      if (error) {
        console.error('Error saving lead:', error);
        // We continue anyway to not block the user experience
      }
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setIsSubmitting(false);
      setStage('simulation');
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setSimulationProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage('deck'), 1000);
        }
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-white overlay-gradient flex flex-col font-sans text-gray-900">
      {/* Header */}
      <div className="absolute top-8 left-8 z-50">
        <img src={moraLogo} alt="Mora" className="w-16 h-16 rounded-lg object-contain" />
      </div>

      {stage === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-12">
            <div className="min-h-[200px]">
              <TypewriterText
                texts={introMessages}
                speed={30}
                onComplete={handleIntroComplete}
                className="text-3xl md:text-5xl text-black leading-tight"
                firstLineClassName="font-bold font-serif"
                restLineClassName="font-sans font-normal text-gray-600 mt-4 block text-xl md:text-2xl"
              />
            </div>

            {showIntroButton && (
              <div className="animate-slide-up space-y-6">
                <input
                  type="email"
                  enterKeyHint="done"
                  placeholder="Enter your email to begin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md bg-transparent border-b-2 border-gray-200 py-3 text-xl focus:outline-none focus:border-black transition-colors"
                />
                <div className="pt-4">
                  <GradientButton onClick={startQuestions} disabled={!email}>
                    Start Simulation
                  </GradientButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'questions' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-xl w-full space-y-8">
            <h2 className="text-3xl font-serif font-bold mb-8">Tell us about your firm</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Firm Name</label>
                <input
                  type="text"
                  enterKeyHint="done"
                  value={formData.firmName}
                  onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. Sequoia Capital"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AUM / Stage</label>
                <input
                  type="text"
                  enterKeyHint="done"
                  value={formData.aum}
                  onChange={(e) => setFormData({...formData, aum: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. $500M / Series A"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Primary Focus</label>
                <input
                  type="text"
                  enterKeyHint="done"
                  value={formData.focus}
                  onChange={(e) => setFormData({...formData, focus: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. B2B SaaS, Consumer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Website / Link</label>
                <input
                  type="text"
                  enterKeyHint="done"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <GradientButton onClick={runSimulation} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Generate Future'
                )}
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {stage === 'simulation' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black text-white">
          <div className="max-w-4xl w-full space-y-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-2">{formData.firmName || "Your Firm"}</h2>
                <p className="text-gray-400">Simulating 5-year trajectory...</p>
              </div>
              <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                20{26 + Math.floor(simulationProgress / 20)}
              </div>
            </div>

            {/* Simulation Visualization */}
            <div className="relative h-64 bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-900/50 to-blue-500/50 rounded-t-sm transition-all duration-300"
                    style={{ 
                      height: `${Math.min(100, Math.max(10, (i * 5) + (Math.random() * 20) * (simulationProgress / 100)))}%`,
                      opacity: (i / 20) < (simulationProgress / 100) ? 1 : 0.2
                    }}
                  />
                ))}
              </div>
              
              {/* Floating Events */}
              {simulationProgress > 20 && (
                <div className="absolute top-1/4 left-1/4 bg-green-900/80 border border-green-500/30 p-2 rounded text-xs text-green-200 animate-fade-in">
                  Portfolio Unicorn 🦄
                </div>
              )}
              {simulationProgress > 50 && (
                <div className="absolute top-1/3 right-1/3 bg-blue-900/80 border border-blue-500/30 p-2 rounded text-xs text-blue-200 animate-fade-in">
                  Fund III Closed 💰
                </div>
              )}
              {simulationProgress > 80 && (
                <div className="absolute bottom-1/3 right-1/4 bg-purple-900/80 border border-purple-500/30 p-2 rounded text-xs text-purple-200 animate-fade-in">
                  Global Expansion 🌍
                </div>
              )}
            </div>

            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-out"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {stage === 'deck' && (
        <div className="flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory" ref={deckRef}>
          {/* Slide 1: Opening */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-white">
            <div className="max-w-4xl w-full">
              <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">
                People are making the most important decisions of their lives with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">almost no real signal.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                70% of people fail to follow through on major life decisions. Not because they lack motivation, but because they lack foresight.
              </p>
              <div className="mt-12 animate-bounce">
                <ArrowRight className="w-8 h-8 transform rotate-90 text-gray-400" />
              </div>
            </div>
          </section>

          {/* Slide 2: The Core Insight */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-6">Advice is cheap. <br/>Outcomes are not.</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Most AI companions are reactive. They wait for prompts, give generic answers, and forget context.
                </p>
                <p className="text-xl font-medium text-black">
                  What if instead of asking AI for advice, you could simulate yourself?
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-24 bg-gray-100 rounded-lg p-4 text-gray-500 text-sm">
                    Generic AI: "Here are some tips for your career..."
                  </div>
                  <div className="flex items-center gap-3 text-purple-600 mt-8">
                    <img src={moraLogo} className="w-8 h-8 rounded-full" />
                    <div className="h-4 w-24 bg-purple-100 rounded" />
                  </div>
                  <div className="h-32 bg-purple-50 rounded-lg p-4 text-purple-900 text-sm font-medium border border-purple-100">
                    Mora: "I've simulated 1,000 timelines. If you switch careers now, your happiness dips for 6 months but lifetime earnings increase by 40%."
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 3: The Solution */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-black text-white">
            <div className="max-w-5xl w-full text-center">
              <div className="inline-block px-4 py-1 border border-white/20 rounded-full text-sm mb-6">Introducing a new category</div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-12">
                Life simulation through a <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">digital twin.</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10">
                  <Users className="w-8 h-8 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Structured Twin</h3>
                  <p className="text-gray-400 text-sm">Captures goals, habits, values, constraints, and real-life context.</p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10">
                  <TrendingUp className="w-8 h-8 mb-4 text-purple-400" />
                  <h3 className="text-xl font-bold mb-2">Outcome Simulation</h3>
                  <p className="text-gray-400 text-sm">Simulate outcomes over time, compare decisions, surface tradeoffs.</p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10">
                  <Star className="w-8 h-8 mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">Not Advice</h3>
                  <p className="text-gray-400 text-sm">We don't tell users what to do. We show them what is likely to happen.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 4: Why We Win Early */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-white">
            <div className="max-w-4xl w-full flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <div className="text-9xl font-bold text-gray-100 absolute -z-10 -ml-8 -mt-8">85%</div>
                <h2 className="text-5xl font-serif font-bold mb-6 relative">The digital twin is the key.</h2>
                <p className="text-xl text-gray-600 mb-8">
                  85% of users complete the digital twin. This is extremely high for consumer onboarding.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <span>Mora locks in depth immediately</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <span>Every decision improves the system</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <span>Instant moat against generic AI tools</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-50 p-8 rounded-2xl border border-gray-100 rotate-3 shadow-lg">
                <div className="space-y-4">
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    Deep User Context Model
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 5: Traction */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-blue-50">
            <div className="max-w-4xl w-full">
              <h2 className="text-4xl font-serif font-bold mb-12 text-center">Traction since December</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">8%</div>
                  <div className="text-gray-500 font-medium">CTR on Reddit Ads</div>
                  <div className="text-xs text-gray-400 mt-2">Well above benchmarks</div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">$350</div>
                  <div className="text-gray-500 font-medium">MRR in first 30 days</div>
                  <div className="text-xs text-gray-400 mt-2">Zero outbound</div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">0</div>
                  <div className="text-gray-500 font-medium">Influencers</div>
                  <div className="text-xs text-gray-400 mt-2">Pure product pull</div>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 8: Long Term Vision */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="max-w-4xl w-full relative z-10 text-center">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">
                A society of <br/>digital twins.
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                As this network grows, Mora becomes a longitudinal dataset of human decisions and outcomes. A predictive system that improves with scale.
              </p>
              <div className="inline-block px-8 py-4 border border-white/30 rounded-full text-2xl font-light">
                Advice <span className="mx-4 text-gray-500">→</span> Forecasting
              </div>
            </div>
          </section>

          {/* Slide 11: Team */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-white">
            <div className="max-w-4xl w-full">
              <h2 className="text-4xl font-serif font-bold mb-12">The Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {/* Placeholder for JD */}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">JD</h3>
                    <p className="text-sm text-gray-500">Founder & Tech Lead</p>
                  </div>
                  <p className="text-sm text-gray-600">Voodoo Publishing Program alumni. Founded 11:47. Launched 5 consumer apps in the last year.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {/* Placeholder for Patricia */}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Patricia</h3>
                    <p className="text-sm text-gray-500">Designer</p>
                  </div>
                  <p className="text-sm text-gray-600">Based in London. Focused on high-taste consumer UX.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {/* Placeholder for Isabella */}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Isabella</h3>
                    <p className="text-sm text-gray-500">Growth</p>
                  </div>
                  <p className="text-sm text-gray-600">Leads paid acquisition and UGC campaigns.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 13: Closing */}
          <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 bg-white text-center">
            <div className="max-w-3xl w-full space-y-12">
              <p className="text-2xl text-gray-500">People will stop asking "what should I do?"</p>
              <h2 className="text-5xl md:text-7xl font-serif font-bold">
                They will start asking:<br/>
                <span className="text-black">"What happens if I choose this?"</span>
              </h2>
              <div className="pt-12">
                <GradientButton onClick={() => window.location.href = 'mailto:jd@mora.app'}>
                  Get in Touch
                </GradientButton>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
