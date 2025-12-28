import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GradientButton } from '../components/GradientButton';
import { CheckCircle, Sparkles } from 'lucide-react';
import { trackEvent } from '../lib/mixpanel';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate('/payment');
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        // Verify payment with backend
        const response = await fetch(`${PROXY_URL}/api/stripe/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          // Mark user as premium
          if (user?.id) {
            await supabase
              .from('profiles')
              .update({ is_premium: true })
              .eq('user_id', user.id);
          }

          // Track successful payment
          trackEvent('Payment Completed', {
            user_id: user?.id,
            amount: 7.99,
            currency: 'USD',
            session_id: sessionId,
          });

          setIsVerified(true);
        } else {
          // Payment not verified
          navigate('/payment');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        navigate('/payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div>
          <h1 
            className="text-3xl md:text-4xl font-bold text-black mb-4"
            style={{ 
              fontFamily: 'Recoleta, Georgia, serif',
              fontVariantLigatures: 'none',
              WebkitFontFeatureSettings: '"liga" off',
              fontFeatureSettings: '"liga" off'
            }}
          >
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your payment has been processed successfully.
          </p>
          <p className="text-gray-500">
            You now have access to your life simulation.
          </p>
        </div>

        <GradientButton
          onClick={() => navigate('/simulate-life', { state: { paymentSuccess: true } })}
          variant="purple"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Start Your Simulation
        </GradientButton>
      </div>
    </div>
  );
}

