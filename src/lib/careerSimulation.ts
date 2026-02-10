import { CareerSimulation, CareerOnboardingData } from '../types/career';

const PROXY_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes('localhost:3001')
    ? import.meta.env.VITE_PROXY_URL
    : '';
const PROXY_ENDPOINT = `${PROXY_URL}/api/claude/career-generate`;

export function buildUserContext(data: CareerOnboardingData): string {
  const sections: string[] = [];

  if (data.isStudent) {
    sections.push('USER PROFILE');
    sections.push('Status: Student');
    if (data.gradeLevel) sections.push(`Grade: ${data.gradeLevel}`);
    if (data.school) sections.push(`School: ${data.school}`);
    if (data.studying) sections.push(`Studying: ${data.studying}`);
  } else {
    sections.push('USER PROFILE');
    sections.push(`Current Role: ${data.currentRole}`);
    sections.push(`Company: ${data.company}`);
    sections.push(`Salary: $${Number(data.salary).toLocaleString()}/year`);
  }

  // Structured priorities
  const goalLabels: Record<string, string> = {
    money: 'Making money', balance: 'Work-life balance', impact: 'Doing meaningful work',
    growth: 'Learning & growth', title: 'Status & title', freedom: 'Freedom & flexibility',
    team: 'Leading a team', stability: 'Job security',
  };
  const styleLabels: Record<string, string> = {
    'big-company': 'Big company (stability, structure)', startup: 'Startup (fast-paced, equity upside)',
    'remote-freelance': 'Remote / Freelance (location freedom)', 'own-business': 'Start own business',
  };
  const riskLabels: Record<string, string> = {
    safe: 'Play it safe — steady, predictable', balanced: 'Balanced — some risk for better rewards',
    aggressive: 'High risk, high reward — big swings',
  };

  if (data.careerGoals?.length || data.workStyle || data.riskTolerance) {
    sections.push('');
    sections.push('CAREER PRIORITIES & VALUES');
    if (data.careerGoals?.length) {
      sections.push(`What matters most: ${data.careerGoals.map(g => goalLabels[g] || g).join(', ')}`);
    }
    if (data.workStyle) {
      sections.push(`Ideal work setup: ${styleLabels[data.workStyle] || data.workStyle}`);
    }
    if (data.riskTolerance) {
      sections.push(`Risk tolerance: ${riskLabels[data.riskTolerance] || data.riskTolerance}`);
    }
  }

  if (data.careerPriorities?.trim()) {
    sections.push('');
    sections.push('ADDITIONAL NOTES');
    sections.push(data.careerPriorities);
  }

  return sections.join('\n');
}

export function buildSystemPrompt(data: CareerOnboardingData): string {
  const currentRole = data.isStudent ? `Entry-level in ${data.studying || 'their field'}` : (data.currentRole || 'their current role');
  const studying = data.studying || 'their field';
  const timeHorizon = data.timeHorizon;

  return `You are a career trajectory simulator. Generate a deeply realistic, specific career simulation based on the user's profile and situation.

ABSOLUTE CRITICAL REQUIREMENT:
The user's CURRENT ROLE is: "${currentRole}"

YOU MUST:
- Start Year 1 of the timeline with "${currentRole}" or a logical immediate next step from this exact role
- NEVER generate roles that are unrelated to "${currentRole}"
- If they're an "App Developer": App Developer → Senior App Developer → Lead Developer → Engineering Manager → Director
- If they're a "Marketing Manager": Marketing Manager → Senior Marketing Manager → Marketing Director → VP Marketing
- If they're a "Nurse": Nurse → Charge Nurse → Nurse Manager → Director of Nursing → VP of Patient Care
- If they're a STUDENT studying "${studying}": Start with entry-level role in their field of study after graduation
- The final outcome title at year ${timeHorizon} must be a logical career progression from "${currentRole}"

REQUIREMENTS:
1. Use SECOND PERSON (you/your) throughout — this should feel like reading YOUR future
2. Be BRUTALLY SPECIFIC with numbers, percentages, dollar amounts, and concrete details
3. Base predictions on realistic industry data and career progression patterns
4. Generate realistic outcomes reflecting real opportunities AND real challenges
5. Include key milestones, compensation changes, and role changes
6. NO brand names for companies — use realistic-sounding generic names
7. ALL fields in the JSON structure MUST be present — never omit any field
8. Arrays should have meaningful content (3+ items for most, 4+ for feedback)
9. Make regret moments genuinely emotionally resonant — not generic
10. The "honest assessment" in societal impact should be genuinely honest, not flattering
11. For alternatePaths: Generate 2-3 specific decision points from your generated timeline. Each should reference a real moment you created in the timeline.

${(data.careerGoals?.length || data.workStyle || data.riskTolerance || data.careerPriorities) ? `
USER'S STATED PRIORITIES:
${data.careerGoals?.length ? `- What matters most: ${data.careerGoals.join(', ')}` : ''}
${data.workStyle ? `- Ideal work setup: ${data.workStyle}` : ''}
${data.riskTolerance ? `- Risk tolerance: ${data.riskTolerance}` : ''}
${data.careerPriorities ? `- Additional context: "${data.careerPriorities}"` : ''}
Factor these priorities heavily into:
- Which regret moments you generate (regrets should conflict with their stated values)
- The satisfaction score
- Work-life balance metrics
- The reflection text
- What the "honest assessment" says
- The tone of team feedback
- The type of companies and roles in the trajectory (match their work style preference)
- Risk level of career moves (match their risk tolerance)
` : ''}

Path Type: For this simulation, generate the "stay at current trajectory" path (the most likely outcome if they keep doing what they're doing).

Time Horizon: ${timeHorizon} years.

IMPORTANT: Respond with valid JSON only. No text outside the JSON object.`;
}

export function buildUserPrompt(data: CareerOnboardingData, userContext: string): string {
  const currentRole = data.isStudent ? `Entry-level in ${data.studying || 'their field'}` : (data.currentRole || 'their current role');
  const company = data.isStudent ? 'Post-graduation employer' : (data.company || 'Current company');
  const salary = data.isStudent ? '55000' : (data.salary || '75000');
  const timeHorizon = data.timeHorizon;

  return `User Profile Context:
${userContext}

Current Career Situation:
- STARTING ROLE: ${currentRole}
- Company: ${company}
- Current Salary: $${Number(salary).toLocaleString()}/year
- Time Horizon: ${timeHorizon} years

Generate a comprehensive career simulation. Return valid JSON matching this EXACT format. Every single field must be present.

{
  "id": "generated-stay-${timeHorizon}y",
  "timeHorizon": ${timeHorizon},
  "pathName": "Most Likely Path",
  "confidence": 75,
  "outcome": {
    "title": "Final role title — MUST be logical progression from ${currentRole}",
    "company": "Company name",
    "totalComp": 250000,
    "location": "City, State",
    "satisfaction": 4.2
  },
  "stats": {
    "compensation": { "base": 200000, "equity": 50000 },
    "growth": { "promotions": 2, "yearsToSenior": 3, "teamSize": 8 },
    "workLife": {
      "hoursPerWeek": 50,
      "burnoutRisk": "Medium",
      "flexibility": "High"
    },
    "skills": {
      "technical": "Specific technical skills developed",
      "leadership": "Leadership capabilities gained",
      "expertise": "Domain expertise areas"
    }
  },
  "timeline": {
    "milestones": [
      {
        "year": 1,
        "title": "Current role or natural next step",
        "company": "Company name",
        "salary": 150000,
        "description": "What happens this year"
      }
    ]
  },
  "globalComparison": {
    "income": {
      "yourComp": 250000,
      "globalPercentile": 8,
      "globalAverage": 120000,
      "usAverage": 195000,
      "topEarners": { "range": "$450k-$650k", "group": "Top performers in field" },
      "developingMarkets": { "min": 45000, "max": 80000 }
    },
    "careerProgression": {
      "yourLevel": "Senior Manager level",
      "globalPercentile": 12,
      "mostCommon": "Most common outcome for people in this role",
      "fastest": "Fastest progression path",
      "many": "What many people end up at"
    },
    "workLife": {
      "yourHours": 50,
      "globalPercentile": 55,
      "range": { "min": 35, "minLabel": "Europe", "max": 80, "maxLabel": "startup hubs" },
      "bestBalance": "Who has the best balance",
      "worstBalance": "Who has the worst"
    },
    "equity": {
      "yourEquity": 180000,
      "globalPercentile": 25,
      "mostEngineers": "$0-$30k equity",
      "lotteryWinners": { "range": "$5M-$50M", "percentage": 0.1 },
      "note": "Context about your equity position"
    },
    "geographic": {
      "northAmerica": 12000,
      "europe": 8500,
      "asia": 45000,
      "latinAmerica": 3200,
      "note": "Geographic context"
    },
    "globalReality": "A raw, honest paragraph comparing the user's trajectory to global workers in same field. Include specific salary comparisons by region. Make it hit hard."
  },
  "zoomIns": {
    "regretMoments": [
      {
        "year": 2029,
        "title": "Specific missed opportunity",
        "description": "Detailed, emotionally resonant description. Include specific numbers — what the alternative would have been worth. Make the reader feel the weight of the road not taken."
      }
    ],
    "reflection": "A 2-3 sentence reflection that acknowledges both what was gained and what was lost. Should feel like something you'd think at 2am. End with something that's true but uncomfortable.",
    "cards": [
      { "id": "tuesday", "title": "A Random Tuesday", "icon": "📱" },
      { "id": "email", "title": "The Email That Changed Everything", "icon": "📧" },
      { "id": "calendar", "title": "Your Calendar Evolution", "icon": "📅" },
      { "id": "feedback", "title": "What Your Team Says About You", "icon": "💬" },
      { "id": "inbox", "title": "Your Inbox: Then vs Now", "icon": "📬" }
    ],
    "randomTuesday": {
      "date": "Tuesday, March 15, 2034",
      "notifications": [
        { "app": "App Name", "icon": "💬", "title": "Notification title", "body": "Preview text", "time": "9:30 AM" }
      ],
      "timeline": [
        { "time": "7:30 AM", "icon": "☕", "title": "Activity", "description": "What you're doing and why" }
      ],
      "stats": { "decisionsMade": 23, "imposterSyndromeMoments": 2 }
    },
    "theEmail": {
      "from": "sender name <email>",
      "to": "you@company.com",
      "subject": "Email subject — should be a career-defining moment",
      "timestamp": "Mon, Apr 12, 2028 at 2:34 PM",
      "body": "Full email body. Should feel real — include compensation details, specific praise, concrete next steps. This is the email you screenshot and send to your mom.",
      "metadata": {
        "folder": "Career Milestones",
        "timesOpened": 47,
        "lastUpdate": "You starred this message"
      }
    },
    "calendar": {
      "current": {
        "year": 2026,
        "events": [
          { "day": "Mon", "time": "9:00 AM", "title": "Meeting name", "color": "#4285F4", "duration": 30 }
        ]
      },
      "future": {
        "year": 2034,
        "events": [
          { "day": "Mon", "time": "9:00 AM", "title": "Meeting name", "color": "#DB4437", "duration": 60 }
        ]
      },
      "stats": {
        "meetingsPerWeek": { "current": 8, "future": 18 },
        "stressLevel": { "current": "Moderate", "future": "High" },
        "controlLevel": { "current": "Medium", "future": "High" },
        "lastOpenedFigma": { "current": "2 hours ago", "future": "3 weeks ago" }
      }
    },
    "teamFeedback": {
      "messages": [
        {
          "author": "Anonymous Teammate A",
          "avatar": "👤",
          "timestamp": "2:14 PM",
          "message": "Specific feedback about working with you",
          "reactions": [{ "emoji": "❤️", "count": 8 }, { "emoji": "💯", "count": 5 }]
        }
      ],
      "finalMessage": "What they don't say: [something uncomfortable but true]"
    },
    "inbox": {
      "current": {
        "year": 2026,
        "emails": [
          { "sender": "Name", "subject": "Subject", "time": "9:42 AM", "unread": true }
        ]
      },
      "future": {
        "year": 2034,
        "emails": [
          { "sender": "Name", "subject": "Subject", "time": "10:15 AM", "unread": true, "important": true }
        ],
        "filteredCount": 23
      },
      "stats": {
        "responseTime": { "current": "2 hours", "future": "4 hours" },
        "stressLevel": { "current": "Low", "future": "Medium-High" }
      }
    }
  },
  "societalImpact": {
    "productsShipped": ["Specific product/project with scale numbers", "Another with impact metrics"],
    "peopleInfluenced": ["Direct reports and what happened to them", "Mentees and their outcomes"],
    "industryContributions": ["Conferences, blog posts, open source with specific numbers"],
    "rippleEffect": "Paragraph describing cascading impact — direct reports → their reports → users affected → broader influence. Use specific numbers.",
    "honestAssessment": "Brutally honest 2-3 sentences. Not flattering. Not self-deprecating. Just true. End with something that sits with you."
  },
  "alternatePaths": [
    { "id": "alt-1", "label": "What if you [specific decision from timeline]?", "year": 3, "decision": "decision_key" },
    { "id": "alt-2", "label": "What if you [another decision]?", "year": 6, "decision": "decision_key" }
  ]
}`;
}

export async function generateCareerSimulation(onboardingData: any): Promise<CareerSimulation> {
  const careerData: CareerOnboardingData = {
    timeHorizon: onboardingData.careerTimeHorizon || 10,
    careerPriorities: onboardingData.careerPriorities || '',
    careerGoals: onboardingData.careerGoals || [],
    workStyle: onboardingData.workStyle || '',
    riskTolerance: onboardingData.riskTolerance || '',
    isStudent: onboardingData.isStudent || false,
    gradeLevel: onboardingData.gradeLevel,
    school: onboardingData.school,
    studying: onboardingData.studying,
    currentRole: onboardingData.currentRole,
    company: onboardingData.company,
    salary: onboardingData.salary,
  };

  const userContext = buildUserContext(careerData);
  const systemPrompt = buildSystemPrompt(careerData);
  const userPrompt = buildUserPrompt(careerData, userContext);

  console.log('🚀 Calling career simulation API...');

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Career simulation API error:', response.status, errorText);
    throw new Error(`Career simulation API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    console.error('Invalid response structure:', data);
    throw new Error('Invalid response structure from Claude API');
  }

  let content = data.content[0].text;

  // Clean markdown code blocks if present
  content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];

  const simulation = JSON.parse(content) as CareerSimulation;
  console.log('✅ Career simulation parsed successfully');
  return simulation;
}
