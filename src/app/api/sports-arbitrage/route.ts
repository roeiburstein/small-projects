import { NextResponse } from 'next/server';

interface BookmakerOdds {
  bookmaker: string;
  odds: number;
}

interface ArbitrageOpportunity {
  sport: string;
  event: string;
  time: string;
  team1: {
    name: string;
    bookmaker: string;
    odds: number;
  };
  team2: {
    name: string;
    bookmaker: string;
    odds: number;
  };
  investmentAmount: number;
  profitPercentage: number;
  potentialProfit: number;
  betAmounts: {
    team1: number;
    team2: number;
  };
}

interface OddsAPIResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
      }[];
    }[];
  }[];
}

// Calculate arbitrage opportunity
function calculateArbitrage(match: OddsAPIResponse): ArbitrageOpportunity | null {
  const team1Name = match.home_team;
  const team2Name = match.away_team;
  
  let bestOdds1: BookmakerOdds | null = null;
  let bestOdds2: BookmakerOdds | null = null;

  // Find best odds for each team
  match.bookmakers.forEach(bookmaker => {
    const market = bookmaker.markets.find(m => m.key === 'h2h');
    if (!market) return;

    const team1Odds = market.outcomes.find(o => o.name === team1Name);
    const team2Odds = market.outcomes.find(o => o.name === team2Name);

    if (team1Odds && (!bestOdds1 || team1Odds.price > bestOdds1.odds)) {
      bestOdds1 = {
        bookmaker: bookmaker.title,
        odds: team1Odds.price
      };
    }

    if (team2Odds && (!bestOdds2 || team2Odds.price > bestOdds2.odds)) {
      bestOdds2 = {
        bookmaker: bookmaker.title,
        odds: team2Odds.price
      };
    }
  });

  if (!bestOdds1 || !bestOdds2) return null;

  // Calculate arbitrage
  const impliedProb1 = 1 / bestOdds1.odds;
  const impliedProb2 = 1 / bestOdds2.odds;
  const totalImpliedProb = impliedProb1 + impliedProb2;

  // If total implied probability is less than 1, there's an arbitrage opportunity
  if (totalImpliedProb < 1) {
    const investmentAmount = 1000; // Example investment amount
    const profit = (1 / totalImpliedProb) - 1;
    const profitAmount = investmentAmount * profit;

    // Calculate optimal bet amounts
    const bet1 = (investmentAmount * impliedProb1) / totalImpliedProb;
    const bet2 = (investmentAmount * impliedProb2) / totalImpliedProb;

    return {
      sport: match.sport_title,
      event: `${team1Name} vs ${team2Name}`,
      time: new Date(match.commence_time).toLocaleString(),
      team1: {
        name: team1Name,
        bookmaker: bestOdds1.bookmaker,
        odds: bestOdds1.odds
      },
      team2: {
        name: team2Name,
        bookmaker: bestOdds2.bookmaker,
        odds: bestOdds2.odds
      },
      investmentAmount,
      profitPercentage: profit * 100,
      potentialProfit: profitAmount,
      betAmounts: {
        team1: bet1,
        team2: bet2
      }
    };
  }

  return null;
}

const SPORTS = [
  'soccer_epl',           // English Premier League
  'soccer_la_liga',       // Spanish La Liga
  'basketball_nba',       // NBA
  'americanfootball_nfl', // NFL
  'baseball_mlb'          // MLB
];

export async function POST() {
  try {
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }

    const opportunities: ArbitrageOpportunity[] = [];
    
    // Fetch odds for each sport
    for (const sport of SPORTS) {
      console.log(`Fetching odds for ${sport}...`);
      
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      );

      if (!response.ok) {
        console.error(`Failed to fetch odds for ${sport}: ${response.statusText}`);
        continue;
      }

      const matches: OddsAPIResponse[] = await response.json();
      
      // Find arbitrage opportunities in each match
      for (const match of matches) {
        const opportunity = calculateArbitrage(match);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }
    
    // Sort by profit percentage
    opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
    
    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error in sports-arbitrage route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find arbitrage opportunities' },
      { status: 500 }
    );
  }
}
