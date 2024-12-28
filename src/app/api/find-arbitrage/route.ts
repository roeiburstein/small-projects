import { NextResponse } from 'next/server';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyPair {
  from: string;
  to: string;
  rate: number;
}

interface ArbitrageStep {
  currency: string;
  amount: number;
  rate?: number;
}

interface ArbitrageOpportunity {
  steps: ArbitrageStep[];
  profitPercentage: number;
}

async function fetchExchangeRates(): Promise<ExchangeRates> {
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY ? 'exists' : 'undefined'
  });
  
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  console.log('Using API Key:', apiKey ? 'Key exists' : 'No key found');
  
  if (!apiKey) {
    throw new Error('API key not configured - please check your .env.local file');
  }
  
  console.log('Fetching exchange rates...');
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
  if (!response.ok) {
    console.error('API Response not OK:', response.status, response.statusText);
    throw new Error('Failed to fetch exchange rates');
  }
  const data = await response.json();
  console.log('Received rates for currencies:', Object.keys(data.conversion_rates).length);
  return data.conversion_rates;
}

function findArbitrageOpportunities(rates: ExchangeRates, startAmount: number = 1000) {
  console.log('Starting arbitrage calculation...');
  const currencies = Object.keys(rates);
  console.log(`Processing ${currencies.length} currencies`);
  
  const pairs: CurrencyPair[] = [];
  
  // Create currency pairs with exchange rates
  console.log('Creating currency pairs...');
  for (const from of currencies) {
    for (const to of currencies) {
      if (from !== to) {
        const rate = rates[to] / rates[from];
        pairs.push({ from, to, rate });
      }
    }
  }
  console.log(`Created ${pairs.length} currency pairs`);

  const opportunities: ArbitrageOpportunity[] = [];
  const maxPathLength = 4; // Maximum number of conversions in a cycle
  let pathsExplored = 0;

  function findPaths(
    currentSteps: ArbitrageStep[],
    visited: Set<string>
  ) {
    pathsExplored++;
    if (pathsExplored % 10000 === 0) {
      console.log(`Explored ${pathsExplored} paths, found ${opportunities.length} opportunities`);
    }

    const currentCurrency = currentSteps[currentSteps.length - 1].currency;
    const currentAmount = currentSteps[currentSteps.length - 1].amount;

    if (currentSteps.length > 1 && currentSteps[0].currency === currentCurrency) {
      if (currentAmount > startAmount) {
        const profit = ((currentAmount - startAmount) / startAmount) * 100;
        console.log(`Found profitable cycle with ${profit.toFixed(2)}% profit`);
        opportunities.push({
          steps: currentSteps,
          profitPercentage: profit
        });
      }
      return;
    }

    if (currentSteps.length >= maxPathLength) {
      return;
    }

    if (pathsExplored > 1000000) {
      console.log('Reached maximum path exploration limit');
      return;
    }

    for (const pair of pairs) {
      if (pair.from === currentCurrency) {
        const newAmount = currentAmount * pair.rate;
        const newStep: ArbitrageStep = {
          currency: pair.to,
          amount: newAmount,
          rate: pair.rate
        };
        const newSteps = [...currentSteps, newStep];
        
        // Skip if we've created a cycle that doesn't end at the start currency
        if (new Set(newSteps.map(s => s.currency)).size !== newSteps.length && 
            pair.to !== currentSteps[0].currency) {
          continue;
        }

        findPaths(newSteps, new Set([...visited, pair.to]));
      }
    }
  }

  // Start finding opportunities from each currency
  console.log('Starting path exploration...');
  for (const currency of currencies) {
    console.log(`Exploring paths starting with ${currency}...`);
    findPaths([{ currency, amount: startAmount }], new Set([currency]));
    if (pathsExplored > 1000000) break;
  }
  console.log(`Finished exploring ${pathsExplored} paths`);

  // Sort opportunities by profit percentage in descending order
  console.log('Sorting opportunities...');
  const sortedOpportunities = opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  console.log(`Found ${sortedOpportunities.length} total opportunities`);
  
  return sortedOpportunities;
}

export async function POST() {
  try {
    console.log('Starting arbitrage search...');
    const rates = await fetchExchangeRates();
    console.log('Found exchange rates, calculating opportunities...');
    
    const opportunities = findArbitrageOpportunities(rates);
    console.log(`Found ${opportunities.length} opportunities`);
    
    // Return only the top 5 opportunities to keep the response size manageable
    const topOpportunities = opportunities.slice(0, 5);
    console.log('Top opportunities:', JSON.stringify(topOpportunities, null, 2));
    
    return NextResponse.json({
      opportunities: topOpportunities
    });
    
  } catch (error) {
    console.error('Error in find-arbitrage route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find arbitrage opportunities' },
      { status: 500 }
    );
  }
}
