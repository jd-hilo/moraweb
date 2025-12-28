import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { supabase } from '../lib/supabase';

interface PaywallScreenProps {
  simulationId?: string;
  simulationPreview?: string[];
}

export function PaywallScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { simulationId, simulationPreview } = location.state as PaywallScreenProps || {};
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error('User not authenticated');
        setIsProcessing(false);
        return;
      }

      // Update profile to mark as premium (no payments table exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('user_id', userData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      navigate('/simulation-results', { state: { simulationId } });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overlay-gradient flex flex-col">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full gradient-turquoise flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-black">
                This was a rare simulation
              </h1>
              <p className="text-gray-600">
                Your personalized 10-year timeline is ready. Unlock it now for $4.99
              </p>
            </div>

            {simulationPreview && simulationPreview.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                {simulationPreview.slice(0, 2).map((event, index) => (
                  <div key={index} className="blur-sm text-sm text-gray-600">
                    {event}
                  </div>
                ))}
                <p className="text-sm text-turquoise font-semibold text-center pt-2">
                  Unlock to see full timeline...
                </p>
              </div>
            )}

            <div className="space-y-4">
              <GradientButton
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : '$4.99 - Unlock Simulation'}
              </GradientButton>

              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500">One-time payment</p>
                <p className="text-xs text-gray-500">Full access to your timeline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
