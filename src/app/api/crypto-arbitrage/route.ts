import { NextResponse } from 'next/server';

interface ExchangePrice {
  exchange: string;
  price: number;
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
}

async function fetchExchangePrices(coinId: string): Promise<ExchangePrice[]> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_exchange_logo=false&include_24hr_vol=true&include_24hr_change=false&include_last_updated_at=false&x_cg_demo_api_key=CG-Dja2R2rhxMMJ9bYxERe3D27n`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch crypto prices');
  }

  const data = await response.json();
  
  // Simulate different exchange prices by adding/subtracting small random variations
  // In a real implementation, we would fetch actual prices from different exchanges
  const basePrice = data[coinId].usd;
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Gemini', 'FTX'];
  
  return exchanges.map(exchange => ({
    exchange,
    price: basePrice * (1 + (Math.random() * 0.02 - 0.01)) // +/- 1% variation
  }));
}

async function findArbitrageOpportunities(
  coinId: string,
  investmentAmount: number = 1000
): Promise<CryptoArbitrageOpportunity[]> {
  const prices = await fetchExchangePrices(coinId);
  const opportunities: CryptoArbitrageOpportunity[] = [];

  for (let i = 0; i < prices.length; i++) {
    for (let j = 0; j < prices.length; j++) {
      if (i !== j) {
        const buyPrice = prices[i].price;
        const sellPrice = prices[j].price;
        
        if (sellPrice > buyPrice) {
          const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
          const potentialProfit = (investmentAmount / buyPrice) * (sellPrice - buyPrice);
          
          opportunities.push({
            coin: coinId,
            buyExchange: prices[i].exchange,
            sellExchange: prices[j].exchange,
            buyPrice,
            sellPrice,
            profitPercentage,
            investmentAmount,
            potentialProfit
          });
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
}

const popularCoins = [
  'bitcoin',
  'ethereum',
  'ripple',
  'cardano',
  'solana'
];

export async function POST() {
  try {
    const allOpportunities: CryptoArbitrageOpportunity[] = [];
    
    for (const coin of popularCoins) {
      const opportunities = await findArbitrageOpportunities(coin);
      allOpportunities.push(...opportunities);
    }
    
    // Return top 5 opportunities across all coins
    return NextResponse.json({
      opportunities: allOpportunities
        .sort((a, b) => b.profitPercentage - a.profitPercentage)
        .slice(0, 5)
    });
    
  } catch (error) {
    console.error('Error in crypto-arbitrage route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find arbitrage opportunities' },
      { status: 500 }
    );
  }
}
