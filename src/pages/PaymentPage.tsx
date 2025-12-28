import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { Check, Lock, Shield, Sparkles, Star, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import moraIcon from '../assets/moraicon.png';
import { trackEvent } from '../lib/mixpanel';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export function PaymentPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Check if user already has premium access
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.is_premium) {
          // User already paid, redirect to simulation
          navigate('/simulate-life');
          return;
        }
      }
    };

    getUser();
  }, [navigate]);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      trackEvent('Checkout Started', {
        user_id: userId,
        amount: 4.99,
      });

      // Create Stripe Checkout Session
      const response = await fetch(`${PROXY_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements from Home Page */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-50/50 to-transparent -z-10" />
      <div className="absolute top-20 right-[-100px] w-96 h-96 bg-turquoise/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 left-[-100px] w-96 h-96 bg-purple/10 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="pt-16 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 animate-fade-in mb-8">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
            </div>
            <span className="text-sm font-medium text-gray-600">10,345+ Lives Simulated</span>
          </div>

          <h1 
            className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight"
            style={{ 
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off'
            }}
          >
            Unlock Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-turquoise-dark">
              Life Simulation
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            See your future before you live it. Get instant access to your AI-powered 10-year timeline.
          </p>

          {/* Pricing Card - Limited Time Offer */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative max-w-md mx-auto mt-12">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" />
              Limited Time Offer
            </div>

            <div className="text-center mb-8 pt-4">
              <p className="text-gray-500 font-medium mb-2">One-time payment</p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-6xl font-bold text-black tracking-tight">$4.99</span>
              </div>
              <p className="text-sm text-gray-400 line-through">$29.99 value</p>
            </div>

            <GradientButton
              onClick={handleCheckout}
              disabled={isLoading}
              variant="purple"
              size="lg"
              className="w-full mb-6 text-lg py-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Checkout with Stripe
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </GradientButton>

            {/* Trust Indicators */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Lock className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Privacy protected & anonymous</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="max-w-2xl mx-auto mb-16">
          {/* Value Proposition */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-black">What's Included</h2>
              </div>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg">10-Year AI Timeline</p>
                    <p className="text-gray-600">See exactly how your life unfolds with hyper-specific events and milestones.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg">In-Depth Analysis</p>
                    <p className="text-gray-600">Understand the likelihood of each event with data-backed probability scores.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg">Shareable Results</p>
                    <p className="text-gray-600">Share your simulation with friends and family.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Trust Badge */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-turquoise-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"></div>
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm font-medium text-black">Rated 4.9/5 by 10,000+ users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-black mb-8 font-recoleta">What people are saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "This simulation helped me make a major career decision. So insightful!",
                author: "Sarah M.",
                role: "Marketing Director"
              },
              {
                text: "I was skeptical but the accuracy is incredible. Worth every penny.",
                author: "James K.",
                role: "Software Engineer"
              },
              {
                text: "Finally, a way to visualize my future without the anxiety. Love it!",
                author: "Elena R.",
                role: "Product Manager"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl text-left border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 font-medium leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-black">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Terms of Service */}
        <div className="text-center pt-12 border-t border-gray-200">
          <a
            href="https://pastoral-supply-662.notion.site/Terms-of-Service-mora-2a32cec59ddf80aca5e3ec91fdf8e529?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
