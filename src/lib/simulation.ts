export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  probability?: number;
}

export interface TimelineSimulation {
  one_year: TimelineEvent[];
  three_year: TimelineEvent[];
  five_year: TimelineEvent[];
  ten_year: TimelineEvent[];
}

function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

import { generateSimulationWithClaude } from './claude';

export async function generateLifeSimulation(userData: any): Promise<TimelineSimulation> {
  // Try to use Claude API first, fallback to deterministic generation
  try {
    console.log('🤖 Attempting to generate simulation with Claude AI...');
    console.log('📊 User data being sent:', JSON.stringify(userData, null, 2));
    const result = await generateSimulationWithClaude(userData);
    console.log('✅ Successfully generated simulation using Claude AI');
    console.log('📈 Generated events:', {
      one_year: result.one_year?.length || 0,
      three_year: result.three_year?.length || 0,
      five_year: result.five_year?.length || 0,
      ten_year: result.ten_year?.length || 0,
    });
    return result;
  } catch (error) {
    console.error('❌ Claude API failed, using fallback generation');
    console.error('❌ Error details:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    console.warn('⚠️ WARNING: This simulation is using DETERMINISTIC generation, NOT AI');
    console.warn('⚠️ Check the console logs above to see why the AI call failed');
    
    // Show alert to user (can be removed later)
    if (typeof window !== 'undefined') {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Showing alert to user about fallback usage');
      // Don't use alert in production, but helpful for debugging
      // alert(`AI generation failed: ${errorMsg.substring(0, 100)}. Using fallback.`);
    }
    
    const fallbackResult = generateLifeSimulationFallback(userData);
    console.warn('⚠️ Fallback simulation generated with', {
      one_year: fallbackResult.one_year?.length || 0,
      three_year: fallbackResult.three_year?.length || 0,
      five_year: fallbackResult.five_year?.length || 0,
      ten_year: fallbackResult.ten_year?.length || 0,
    }, 'events');
    return fallbackResult;
  }
}

function generateLifeSimulationFallback(userData: any): TimelineSimulation {
  const currentYear = new Date().getFullYear();
  const age = userData.birthYear ? currentYear - parseInt(userData.birthYear) : 30;
  const hometown = userData.hometown || 'your city';
  const jobTitle = userData.jobTitle || 'your role';
  const workStatus = userData.workStatus || 'employed-full';
  const isEmployed = workStatus.startsWith('employed');
  
  const baseSalary = isEmployed ? getRandomValue(65000, 98000) : getRandomValue(45000, 75000);
  const isInRelationship = ['dating', 'partnered', 'married'].includes(userData.relationshipStatus);
  const partnerName = userData.partnerName || 'your partner';
  const isSingle = userData.relationshipStatus === 'single';

  const primaryInterest = userData.interests?.[0] || 'professional development';
  const primaryValue = userData.values?.[0] || 'growth';
  const secondaryValue = userData.values?.[1] || 'stability';

  const currentRent = getRandomValue(1400, 2200);
  const newRent = getRandomValue(currentRent + 200, currentRent + 800);
  const commuteReduction = getRandomValue(35, 65);

  // Generate hyper-specific, exciting events in second person
  return {
    one_year: [
      {
        time: 'Month 2',
        title: `Save $${getRandomValue(2800, 4200)} in High-Yield Account`,
        description: `You open savings account at ${getRandomDecimal(4.2, 5.1, 1)}% APY. Automate $${getRandomValue(650, 950)}/mo deposits every payday. Watching the balance grow feels like watching a seed become a tree.`,
        probability: getRandomValue(85, 98)
      },
      {
        time: 'Month 5',
        title: 'Coffee Meeting With Industry Contact',
        description: `You meet mentor contact introduced by college friend. ${getRandomValue(35, 55)}-minute conversation leads to job referral and a new perspective on your career path.`,
        probability: getRandomValue(75, 90)
      },
      {
        time: 'Month 8',
        title: `Finish Online Course, ${getRandomValue(72, 96)} Hours`,
        description: `You complete certification program in ${primaryInterest}. Final project scores ${getRandomValue(88, 97)}/100. Add credential to profile and feel a surge of pride in your continued growth.`,
        probability: getRandomValue(80, 95)
      },
      {
        time: 'Month 10',
        title: `Sign Lease on $${newRent}/mo Apt`,
        description: `You move to new place ${getRandomValue(8, 15)} minutes from work. Commute drops from ${75} to ${getRandomValue(10, 18)} minutes each way. Your first place that truly feels like home.`,
        probability: getRandomValue(70, 88)
      },
      {
        time: 'Year 1',
        title: `Performance Review: $${Math.floor(baseSalary * 0.08)} Bonus`,
        description: `Your annual review results in Exceeds rating. You receive $${Math.floor(baseSalary * 0.08)} bonus and ${getRandomValue(3, 5)}% salary increase to $${Math.floor(baseSalary * 1.04)}. The moment you realize your hard work is being recognized.`,
        probability: getRandomValue(82, 96)
      }
    ],
    three_year: [
      {
        time: 'Year 1.5',
        title: `Promotion to $${Math.floor(baseSalary * 1.45 / 1000)}K Base Salary`,
        description: `You are promoted to senior ${jobTitle} managing ${getRandomValue(2, 4)} direct reports. Base salary increases from $${Math.floor(baseSalary/1000)}K to $${Math.floor(baseSalary * 1.45/1000)}K plus new equity grant. You're not just an employee anymore - you're a leader.`,
        probability: getRandomValue(65, 85)
      },
      {
        time: 'Year 2',
        title: `${getRandomValue(6, 9)}-Day International Trip, $${getRandomValue(2400, 3500)}`,
        description: `You book flights for $${getRandomValue(580, 780)}, accommodation $${getRandomValue(850, 1200)} for week. First international solo trip fully paid in cash. Return with ${getRandomValue(180, 250)}+ photos and a completely shifted perspective on what matters.`,
        probability: getRandomValue(70, 90)
      },
      {
        time: 'Year 2.5',
        title: 'Launch Side Consulting Practice',
        description: `You start weekend consulting work in ${jobTitle}. First client contract: $${getRandomValue(3000, 4500)} for ${getRandomValue(18, 24)} hours over ${getRandomValue(3, 5)} weeks. The side hustle becomes a passion project.`,
        probability: getRandomValue(60, 80)
      },
      ...(isInRelationship ? [{
        time: 'Year 2.8',
        title: `Move In Together, Split $${newRent + 200}`,
        description: `${partnerName} moves into your 2BR. You each pay $${Math.floor((newRent + 200)/2)}/mo vs $${newRent} solo, saving $${Math.floor(newRent/2)}/mo combined. This feels like the start of something real.`,
        probability: getRandomValue(75, 92)
      }] : [{
        time: 'Year 2.8',
        title: 'Meet Someone at Networking Event',
        description: `You connect with someone at industry mixer who shares passion for ${primaryValue}. Exchange numbers, plan coffee date for Saturday. This conversation changes everything.`,
        probability: getRandomValue(65, 85)
      }]),
      {
        time: 'Year 3',
        title: `Investment Portfolio Hits $${getRandomValue(58, 78)}K`,
        description: `Your balances: $${getRandomValue(32, 42)}K in 401k, $${getRandomValue(18, 26)}K in index funds, $${getRandomValue(6, 10)}K emergency fund. Compound growth accelerating. You're building real wealth, not just saving.`,
        probability: getRandomValue(80, 95)
      }
    ],
    five_year: [
      {
        time: 'Year 3.5',
        title: `Present at Industry Conference, ${getRandomValue(180, 280)} People`,
        description: `You deliver ${getRandomValue(25, 35)}-minute talk at convention center about ${jobTitle}. ${getRandomValue(32, 45)} connection requests, ${getRandomValue(3, 6)} job inquiries follow. You're becoming a voice in your field.`,
        probability: getRandomValue(55, 75)
      },
      {
        time: 'Year 4',
        title: `Buy $${getRandomValue(32, 48)}K Electric Vehicle`,
        description: `You finance $${getRandomValue(28, 40)}K over 5 years at ${getRandomDecimal(4.8, 5.9, 1)}% APR. Payment $${getRandomValue(520, 680)}/mo, save $${getRandomValue(120, 180)}/mo on fuel costs. Your first major purchase that aligns with your values.`,
        probability: getRandomValue(70, 88)
      },
      {
        time: 'Year 4.5',
        title: `Host Family Dinner for ${getRandomValue(10, 14)}`,
        description: `Thanksgiving at your place for first time. You cook dinner, serve at ${getRandomValue(5, 7)}pm. ${hometown.includes(',') ? 'Dad' : 'Family'} says 'You made it.' That moment hits different.`,
        probability: getRandomValue(85, 95)
      },
      {
        time: 'Year 4.8',
        title: `Complete Half Marathon in ${getRandomValue(1, 2)}:${String(getRandomValue(45, 59)).padStart(2, '0')}:${String(getRandomValue(10, 55)).padStart(2, '0')}`,
        description: `You finish ${hometown.split(',')[0] || 'city'} half marathon after ${getRandomValue(12, 16)}-week training plan. Beat goal by ${getRandomValue(6, 12)} minutes. Lost ${getRandomValue(12, 18)} lbs since starting. Crossing the finish line with tears in your eyes and a new understanding of what you're capable of.`,
        probability: getRandomValue(60, 80)
      },
      {
        time: 'Year 5',
        title: `Accept $${Math.floor(baseSalary * 2.4/1000)}K Offer at Growth Company`,
        description: `Your new job: Director role at ${getRandomValue(40, 65)}-person startup. $${Math.floor(baseSalary * 1.9/1000)}K base + $${Math.floor(baseSalary * 0.5/1000)}K equity. Start date: March ${getRandomValue(10, 20)}. This is the opportunity you've been working toward.`,
        probability: getRandomValue(50, 70)
      }
    ],
    ten_year: [
      {
        time: 'Year 6.5',
        title: `$${getRandomValue(75, 105)}K Down Payment on $${getRandomValue(420, 580)}K Home`,
        description: `You close on ${getRandomValue(2, 3)}BR/${getRandomValue(2, 3)}BA property${hometown.includes(',') ? ` in ${hometown.split(',')[0]}` : ''}. Mortgage $${getRandomValue(2600, 3400)}/mo at ${getRandomDecimal(5.8, 6.5, 1)}%. Build equity vs renting. Your first real estate investment - you're building generational wealth.`,
        probability: getRandomValue(65, 85)
      },
      {
        time: 'Year 7.5',
        title: `Consulting Revenue: $${getRandomValue(85, 110)}K/Year`,
        description: `Your side practice nets $${getRandomValue(7000, 9500)}/mo with ${getRandomValue(5, 8)} retainer clients. You hire assistant for $${getRandomValue(1600, 2200)}/mo to handle admin. The side hustle became a real business.`,
        probability: getRandomValue(45, 65)
      },
      {
        time: 'Year 8.5',
        title: `${getRandomValue(8, 12)}-Week International Sabbatical`,
        description: `You take ${getRandomValue(2, 3)}-month unpaid leave. Budget $${getRandomValue(14000, 19500)} for multi-country trip. Return with ${getRandomValue(180, 250)}+ photos and fresh energy. This trip changes how you see everything.`,
        probability: getRandomValue(40, 60)
      },
      {
        time: 'Year 9',
        title: `Mentor ${getRandomValue(3, 5)} People Through Program`,
        description: `You become official mentor in company program. Meet mentees bi-weekly for coffee. One mentee gets promoted within ${getRandomValue(6, 10)} months. You're paying it forward.`,
        probability: getRandomValue(75, 90)
      },
      {
        time: 'Year 10',
        title: `Net Worth Reaches $${getRandomValue(340, 450)}K`,
        description: `Your assets: $${getRandomValue(140, 190)}K home equity, $${getRandomValue(110, 145)}K in retirement, $${getRandomValue(50, 75)}K brokerage, $${getRandomValue(30, 45)}K cash. Average monthly expenses: $${getRandomValue(3800, 4800)}. You've built something real from nothing.`,
        probability: getRandomValue(55, 75)
      }
    ]
  };
}
