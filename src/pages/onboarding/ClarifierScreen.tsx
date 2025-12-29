import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { TypewriterText } from '../../components/TypewriterText';
import { GradientButton } from '../../components/GradientButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { trackEvent, Events } from '../../lib/mixpanel';

export function ClarifierScreen() {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [showButton, setShowButton] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateTwin = async () => {
    setIsSaving(true);

    try {
      const aiSummary = `${data.firstName} is a ${data.birthYear ? new Date().getFullYear() - parseInt(data.birthYear) : 'N/A'}-year-old from ${data.hometown || 'an unknown location'}, who values ${data.values.join(', ')}. They are currently ${data.workStatus}${data.jobTitle ? ` as a ${data.jobTitle}` : ''} and living ${data.livingWith}. In relationships, they are ${data.relationshipStatus}. Their life has been shaped by ${data.shapedMost}, and they make decisions ${data.decisionStyle}.`;

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Auth error:', userError);
        setIsSaving(false);
        return;
      }

      if (!userData?.user) {
        console.error('No user found');
        setIsSaving(false);
        return;
      }

      // Update profiles table with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userData.user.id,
          first_name: data.firstName,
          hometown: data.hometown,
          university: data.collegeName,
          career_entrypoint: data.careerStart,
          core_json: data, // Store all onboarding data in core_json
          values_json: data.values,
          narrative_summary: aiSummary,
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Error saving profile:', profileError);
      } else {
        // Track twin creation and onboarding completion
        trackEvent(Events.TWIN_CREATED, {
          user_id: userData.user.id,
          has_values: data.values && data.values.length > 0,
          values_count: data.values?.length || 0,
        });
        trackEvent(Events.ONBOARDING_COMPLETED, {
          user_id: userData.user.id,
        });
      }

      // Profile saved - payment page will handle navigation
      setIsSaving(false);
    } catch (error) {
      console.error('Error creating digital twin:', error);
      setIsSaving(false);
    }
  };

  return (
    <OnboardingScreen
      progress={90}
      hideButton
    >
      <div className="text-center space-y-8">
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
              onClick={async () => {
                // Track step completion
                trackEvent(Events.ONBOARDING_STEP_CLARIFIER);
                // Save profile data first, then navigate to payment
                await handleCreateTwin();
                if (!isSaving) {
                  navigate('/payment');
                }
              }}
              disabled={isSaving}
              variant="purple"
            >
              {isSaving ? 'Saving...' : 'Simulate My Life'}
            </GradientButton>
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
