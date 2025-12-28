import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { Check, Lock, Shield, Sparkles, Star, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import moraIcon from '../assets/moraicon.png';
import moraLogo from '../assets/mora.png';
import { trackEvent } from '../lib/mixpanel';

// Use relative path in production (Vercel serverless), localhost in dev
const API_BASE_URL = import.meta.env.VITE_PROXY_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

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
      const apiUrl = `${API_BASE_URL}/api/stripe/create-checkout-session`;
      console.log('Calling Stripe API:', apiUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Is production:', import.meta.env.PROD);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout API error:', response.status, errorText);
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout session created:', data);

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      alert(`Failed to start checkout: ${error.message || 'Please check console for details'}`);
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
            className="text-4xl md:text-6xl font-bold text-black mb-2 leading-tight"
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
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-gray-500">presented by</span>
            <img src={moraLogo} alt="Mora" className="h-5" />
          </div>

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

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full mb-6 text-lg py-6 px-8 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #635BFF 0%, #0A2540 100%)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.898l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="currentColor"/>
                  </svg>
                  <span>Checkout with Stripe</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

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
            href="https://pastoral-supply-662.notion.site/Terms-of-Service-Mora-2d72cec59ddf80099945c84fe81add84?source=copy_link"
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
