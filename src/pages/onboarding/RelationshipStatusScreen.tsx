import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { ChoiceQuestion } from '../../components/ChoiceQuestion';
import { HappinessSlider } from '../../components/HappinessSlider';
import { useOnboarding } from '../../context/OnboardingContext';
import { trackEvent, Events } from '../../lib/mixpanel';

const relationshipOptions = [
  { value: 'single', label: 'Single' },
  { value: 'dating', label: 'Dating' },
  { value: 'partnered', label: 'Partnered' },
  { value: 'married', label: 'Married' },
];

export function RelationshipStatusScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [relationshipStatus, setRelationshipStatus] = useState(data.relationshipStatus);
  const [singleLength, setSingleLength] = useState(data.singleLength || '');
  const [beenInRelationship, setBeenInRelationship] = useState(data.beenInRelationship || '');
  const [lookingFor, setLookingFor] = useState(data.lookingFor || '');
  const [relationshipLength, setRelationshipLength] = useState(data.relationshipLength || '');
  const [partnerName, setPartnerName] = useState(data.partnerName || '');
  const [relationshipHappiness, setRelationshipHappiness] = useState(data.relationshipHappiness || 75);

  const isSingle = relationshipStatus === 'single';
  const isInRelationship = ['dating', 'partnered', 'married'].includes(relationshipStatus);

  const handleContinue = () => {
    updateData({
      relationshipStatus,
      singleLength: isSingle ? singleLength : undefined,
      beenInRelationship: isSingle ? beenInRelationship : undefined,
      lookingFor: isSingle ? lookingFor : undefined,
      relationshipLength: isInRelationship ? relationshipLength : undefined,
      partnerName: isInRelationship ? partnerName : undefined,
      relationshipHappiness: isInRelationship ? relationshipHappiness : undefined,
    });
    trackEvent(Events.ONBOARDING_STEP_RELATIONSHIP_STATUS);
    navigate('/onboarding/financial-situation');
  };

  const canContinue = relationshipStatus &&
    (!isSingle || (singleLength && beenInRelationship && lookingFor)) &&
    (!isInRelationship || (relationshipLength && partnerName));

  return (
    <OnboardingScreen
      progress={44}
      title="What's your relationship status?"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <div className="space-y-6">
        <ChoiceQuestion
          options={relationshipOptions}
          value={relationshipStatus}
          onChange={setRelationshipStatus}
          allowOther
        />

        {isSingle && relationshipStatus && (
          <div className="space-y-4 animate-slide-up">
            <input
              type="text"
              value={singleLength}
              onChange={(e) => setSingleLength(e.target.value)}
              placeholder="How long have you been single?"
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
              style={{
                fontSize: '24px',
                fontWeight: 500,
                letterSpacing: '-0.3px',
                color: singleLength ? '#000000' : 'rgba(0, 0, 0, 0.5)'
              }}
            />
            {singleLength && (
              <input
                type="text"
                value={beenInRelationship}
                onChange={(e) => setBeenInRelationship(e.target.value)}
                placeholder="Have you been in a relationship before?"
                className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.3px',
                  color: beenInRelationship ? '#000000' : 'rgba(0, 0, 0, 0.5)'
                }}
              />
            )}
            {beenInRelationship && (
              <textarea
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2 resize-none"
                rows={3}
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.3px',
                  color: lookingFor ? '#000000' : 'rgba(0, 0, 0, 0.5)'
                }}
              />
            )}
            <style>{`
              input::placeholder, textarea::placeholder {
                color: rgba(0, 0, 0, 0.5);
              }
              input:focus, textarea:focus {
                color: #000000;
              }
            `}</style>
          </div>
        )}

        {isInRelationship && relationshipStatus && (
          <div className="space-y-4 animate-slide-up">
            <input
              type="text"
              value={relationshipLength}
              onChange={(e) => setRelationshipLength(e.target.value)}
              placeholder="How long have you been together?"
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
              style={{
                fontSize: '24px',
                fontWeight: 500,
                letterSpacing: '-0.3px',
                color: relationshipLength ? '#000000' : 'rgba(0, 0, 0, 0.5)'
              }}
            />
            {relationshipLength && (
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="What's your partner's first name?"
                className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none pb-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.3px',
                  color: partnerName ? '#000000' : 'rgba(0, 0, 0, 0.5)'
                }}
              />
            )}
            {partnerName && (
              <div className="animate-slide-up">
                <HappinessSlider
                  value={relationshipHappiness}
                  onChange={setRelationshipHappiness}
                  label="How happy are you in your relationship?"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingScreen>
  );
}
