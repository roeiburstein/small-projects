import { NextResponse } from 'next/server';

interface ExchangePrice {
  exchange: string;
  price: number;
  volume: number;
  last_updated: string;
}

interface CryptoArbitrageOpportunity {
  coin: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  investmentAmount: number;
  potentialProfit: number;
  volume24h: number;
  lastUpdated: string;
}

interface CoinGeckoTicker {
  market: {
    name: string;
  };
  last: number;
  volume: number;
  converted_last: {
    usd: number;
  };
  converted_volume: {
    usd: number;
  };
  trust_score: string;
  timestamp: string;
  target: string;
}

async function fetchExchangePrices(coinId: string): Promise<ExchangePrice[]> {
  // First get the coin's current price to ensure it exists
  const coinResponse = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&x_cg_demo_api_key=CG-Dja2R2rhxMMJ9bYxERe3D27n`,
    { next: { revalidate: 60 } }
  );

  if (!coinResponse.ok) {
    throw new Error('Failed to fetch coin price');
  }

  const coinData = await coinResponse.json();
  if (!coinData[coinId]) {
    throw new Error('Coin not found');
  }

  // Then get all markets for this coin
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/tickers?x_cg_demo_api_key=CG-Dja2R2rhxMMJ9bYxERe3D27n`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch market prices');
  }

  const data = await response.json();
  
  // Filter and transform the market data
  return data.tickers
    .filter((ticker: CoinGeckoTicker) => 
      // Only include USD markets and exchanges with good trust score
      ticker.target === 'USD' && 
      ticker.trust_score === 'green' &&
      ticker.converted_volume?.usd > 10000 // Minimum volume threshold
    )
    .map((ticker: CoinGeckoTicker) => ({
      exchange: ticker.market.name,
      price: ticker.converted_last.usd,
      volume: ticker.converted_volume.usd,
      last_updated: ticker.timestamp
    }))
    .filter(price => price.price > 0 && price.volume > 0); // Ensure valid prices and volumes
}

async function findArbitrageOpportunities(
  coinId: string,
  investmentAmount: number = 1000
): Promise<CryptoArbitrageOpportunity[]> {
  const prices = await fetchExchangePrices(coinId);
  const opportunities: CryptoArbitrageOpportunity[] = [];

  // Sort prices by exchange for consistent ordering
  prices.sort((a, b) => a.exchange.localeCompare(b.exchange));

  for (let i = 0; i < prices.length; i++) {
    for (let j = 0; j < prices.length; j++) {
      if (i !== j) {
        const buyPrice = prices[i].price;
        const sellPrice = prices[j].price;
        const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;

        // Only include opportunities with positive profit
        if (profitPercentage > 0) {
          const potentialProfit = (investmentAmount * profitPercentage) / 100;
          opportunities.push({
            coin: coinId,
            buyExchange: prices[i].exchange,
            sellExchange: prices[j].exchange,
            buyPrice,
            sellPrice,
            profitPercentage,
            investmentAmount,
            potentialProfit,
            volume24h: Math.min(prices[i].volume, prices[j].volume),
            lastUpdated: new Date(prices[i].last_updated).toLocaleString()
          });
        }
      }
    }
  }

  // Sort by profit percentage descending
  return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
}

const popularCoins = [
  'bitcoin',
  'ethereum',
  'ripple',
  'cardano',
  'solana',
  'polkadot',
  'dogecoin'
];

export async function POST() {
  try {
    const allOpportunities: CryptoArbitrageOpportunity[] = [];
    
    // Fetch opportunities for each coin in parallel
    const opportunityPromises = popularCoins.map(coin => 
      findArbitrageOpportunities(coin).catch(error => {
        console.error(`Error fetching ${coin} opportunities:`, error);
        return [];
      })
    );
    
    const results = await Promise.all(opportunityPromises);
    
    // Combine and sort all opportunities
    results.forEach(opportunities => {
      allOpportunities.push(...opportunities);
    });
    
    // Sort by profit percentage
    allOpportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
    
    return NextResponse.json({ opportunities: allOpportunities });
  } catch (error) {
    console.error('Error in crypto-arbitrage route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find arbitrage opportunities' },
      { status: 500 }
    );
  }
}
