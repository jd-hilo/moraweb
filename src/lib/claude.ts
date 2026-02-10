import { TimelineSimulation } from './simulation';

// Use proxy server to avoid CORS issues
// In production (Vercel), use relative path. In dev, use localhost proxy
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001');
const PROXY_ENDPOINT = `${PROXY_URL}/api/claude/generate`;

export async function generateSimulationWithClaude(userData: any): Promise<TimelineSimulation> {
  console.log('✅ Using proxy server for Claude API, proceeding with AI generation...');

  // Build user context from onboarding data
  const userContext = {
    firstName: userData.firstName || 'User',
    simulationType: userData.simulationType || 'career', // Default to career if not specified
    birthYear: userData.birthYear,
    age: userData.birthYear ? new Date().getFullYear() - parseInt(userData.birthYear) : 30,
    hometown: userData.hometown,
    university: userData.collegeName,
    major: userData.major,
    careerEntrypoint: userData.careerStart,
    values: userData.values || [],
    workStatus: userData.workStatus,
    jobTitle: userData.jobTitle,
    livingWith: userData.livingWith,
    relationshipStatus: userData.relationshipStatus,
    partnerName: userData.partnerName,
    financialSituation: userData.financialSituation,
    lifeStage: userData.lifeStage,
    goals: userData.goals,
    interests: userData.interests || [],
    turningPoint: userData.turningPoint,
    shapedMost: userData.shapedMost,
    challenges: userData.challenges,
    decisionStyle: userData.decisionStyle,
    stressHandling: userData.stressHandling,
    politics: userData.politics,
  };

  const simulationTypeFocus = {
    career: 'Focus primarily on professional development, career transitions, job changes, promotions, skill development, industry shifts, and work-related achievements. Include some personal context but prioritize career trajectory.',
    relationship: 'Focus primarily on romantic relationships, dating, partnerships, relationship milestones, breakups, new connections, and relationship dynamics. Include some career/personal context but prioritize relationship evolution.',
    social: 'Focus primarily on friendships, social circles, community involvement, networking, social events, group activities, and how social connections evolve. Include some career/relationship context but prioritize social life development.',
  };

  const focusInstruction = simulationTypeFocus[userContext.simulationType as keyof typeof simulationTypeFocus] || simulationTypeFocus.career;

  const systemPrompt = `You are a life trajectory simulator. Generate HYPER-SPECIFIC, concrete events with real details.
  
  CRITICAL: Write ALL events in SECOND PERSON (you/your). The user is living this timeline. Make each event vivid, tangible, and exciting to read - like reading a compelling biography of their future self.
  
  TONE: Insightful, entertaining, and accurate yet surprising. Don't just list achievements; capture the *feeling* of living this life. Avoid repetitive financial specifics ($X amount) unless it's a major milestone. Focus on narrative variety: unexpected turns, personal growth, simple joys, and meaningful relationships.`;

  const userPrompt = `User Context: ${JSON.stringify(userContext, null, 2)}

SIMULATION TYPE: ${userContext.simulationType || 'career'}
FOCUS AREA: ${focusInstruction}

Generate a timeline of 5 HYPER-SPECIFIC, exciting events for each horizon (1 year, 3 years, 5 years, 10 years) that show how their life naturally unfolds based on their current trajectory, values, and aspirations.

CRITICAL REQUIREMENTS:
1. SIMULATION TYPE FOCUS: ${focusInstruction}
2. LIFE TRAJECTORY: Events should reflect natural progression based on their current situation, values, goals, and personality
3. AUTHENTICITY: Incorporate relevant facts from the User Context (their job, location, relationships, values, interests, life stage)
4. CAUSAL CHAIN: Show how small actions and natural progression create meaningful life changes over time
5. BALANCE: While focusing on ${userContext.simulationType || 'career'}, include relevant context from other life areas
6. EXCITEMENT: Make each event feel significant and engaging - like turning points, achievements, discoveries, or transformative moments
7. PROBABILITY: Assign a realistic probability (0-100%) to each event based on the user's profile and the event's likelihood.
8. VARIETY: Include diverse events within the ${userContext.simulationType || 'career'} focus area - different aspects, unexpected turns, and meaningful moments
9. ACCURATE YET SURPRISING: Events should feel like they *could* happen to this person, but reveal a path they might not have expected.

Be HYPER-SPECIFIC with concrete details:
- Exact numbers ($X saved, X% growth, X hours per week, X people, X miles traveled) - use sparingly for impact
- Generic locations (coffee shop, downtown, convention center, office, hiking trail, beach) - NO brand names
- Named people when relevant (can be hypothetical: "colleague Alex", "friend Jamie", "mentor Sarah")
- Concrete activities (meeting, trip, project launch, purchase, move, achievement, discovery)
- TIME FORMAT: Use simple timeframes ONLY - "Month X" or "Year X" or "Year X.Y" (e.g., "Month 2", "Year 1.5", "Year 3"). NEVER use combinations like "Month 2, Week 3" or "Year 1, Month 6"
- SHORT descriptions (1-2 sentences ONLY, prefer single sentence) - but make them vivid and engaging

Return ONLY valid JSON in this exact format:
{
  "one_year": [
    {"time": "Month 2", "title": "...", "description": "...", "probability": 85},
    {"time": "Month 5", "title": "...", "description": "...", "probability": 75},
    {"time": "Month 8", "title": "...", "description": "...", "probability": 90},
    {"time": "Month 10", "title": "...", "description": "...", "probability": 80},
    {"time": "Year 1", "title": "...", "description": "...", "probability": 95}
  ],
  "three_year": [
    {"time": "Year 1.5", "title": "...", "description": "...", "probability": 70},
    {"time": "Year 2", "title": "...", "description": "...", "probability": 65},
    {"time": "Year 2.5", "title": "...", "description": "...", "probability": 75},
    {"time": "Year 2.8", "title": "...", "description": "...", "probability": 80},
    {"time": "Year 3", "title": "...", "description": "...", "probability": 85}
  ],
  "five_year": [
    {"time": "Year 3.5", "title": "...", "description": "...", "probability": 60},
    {"time": "Year 4", "title": "...", "description": "...", "probability": 70},
    {"time": "Year 4.5", "title": "...", "description": "...", "probability": 75},
    {"time": "Year 4.8", "title": "...", "description": "...", "probability": 65},
    {"time": "Year 5", "title": "...", "description": "...", "probability": 80}
  ],
  "ten_year": [
    {"time": "Year 6.5", "title": "...", "description": "...", "probability": 55},
    {"time": "Year 7.5", "title": "...", "description": "...", "probability": 60},
    {"time": "Year 8.5", "title": "...", "description": "...", "probability": 50},
    {"time": "Year 9", "title": "...", "description": "...", "probability": 65},
    {"time": "Year 10", "title": "...", "description": "...", "probability": 70}
  ]
}`;

  try {
    console.log('🚀 Calling Claude API via proxy with user data:', userContext);
    console.log('🔗 Proxy URL:', PROXY_ENDPOINT);
    
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        systemPrompt,
        userPrompt,
      }),
    });

    console.log('📡 API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error response:', errorText);
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Received response from Claude API');
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Invalid response structure:', data);
      throw new Error('Invalid response structure from Claude API');
    }
    
    const content = data.content[0].text;
    console.log('📄 Response content length:', content.length, 'characters');

    // Extract JSON from the response (handle markdown code blocks if present)
    let jsonText = content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      console.log('📦 Extracted JSON from markdown code block');
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
      console.log('📦 Extracted JSON from code block');
    }

    console.log('🔍 Parsing JSON response...');
    const simulation = JSON.parse(jsonText) as TimelineSimulation;
    console.log('✅ Successfully parsed simulation JSON');

    // Validate structure
    if (!simulation.one_year || !simulation.three_year || !simulation.five_year || !simulation.ten_year) {
      throw new Error('Invalid simulation structure from Claude');
    }

    // Validate that probabilities exist
    const allEvents = [
      ...simulation.one_year,
      ...simulation.three_year,
      ...simulation.five_year,
      ...simulation.ten_year,
    ];
    
    const missingProbabilities = allEvents.filter(e => e.probability === undefined || e.probability === null);
    if (missingProbabilities.length > 0) {
      console.warn(`Warning: ${missingProbabilities.length} events missing probability field`);
    }

    console.log('Successfully generated AI simulation with', allEvents.length, 'events');
    return simulation;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}
