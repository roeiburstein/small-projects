'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Currency Arbitrage Types
interface ArbitrageStep {
  currency: string;
  amount: number;
  rate?: number;
}

interface ArbitrageOpportunity {
  steps: ArbitrageStep[];
  profitPercentage: number;
}

// Crypto Arbitrage Types
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

// Sports Arbitrage Types
interface SportsArbitrageOpportunity {
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

export default function ArbitragePage() {
  // Currency Arbitrage State
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(false);
  const [currencyOpportunities, setCurrencyOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [currencyError, setCurrencyError] = useState<string>('');

  // Crypto Arbitrage State
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);
  const [cryptoOpportunities, setCryptoOpportunities] = useState<CryptoArbitrageOpportunity[]>([]);
  const [cryptoError, setCryptoError] = useState<string>('');

  // Sports Arbitrage State
  const [isLoadingSports, setIsLoadingSports] = useState(false);
  const [sportsOpportunities, setSportsOpportunities] = useState<SportsArbitrageOpportunity[]>([]);
  const [sportsError, setSportsError] = useState<string>('');

  const handleCurrencySearch = async () => {
    setIsLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await fetch('/api/find-arbitrage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch arbitrage opportunities');
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCurrencyOpportunities(data.opportunities);
    } catch (err) {
      setCurrencyError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  const handleCryptoSearch = async () => {
    setIsLoadingCrypto(true);
    setCryptoError('');
    try {
      const response = await fetch('/api/crypto-arbitrage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto arbitrage opportunities');
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCryptoOpportunities(data.opportunities);
    } catch (err) {
      setCryptoError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const handleSportsSearch = async () => {
    setIsLoadingSports(true);
    setSportsError('');
    try {
      const response = await fetch('/api/sports-arbitrage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sports arbitrage opportunities');
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSportsOpportunities(data.opportunities);
    } catch (err) {
      setSportsError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingSports(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Arbitrage Finder</h1>
        <p className="text-xl text-muted-foreground">
          Find profitable arbitrage opportunities across different markets
        </p>
      </section>

      <div className="mt-8">
        <Tabs defaultValue="currency" className="space-y-6">
          <TabsList>
            <TabsTrigger value="currency">Currency Arbitrage</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Arbitrage</TabsTrigger>
            <TabsTrigger value="sports">Sports Arbitrage</TabsTrigger>
          </TabsList>

          <TabsContent value="currency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Currency Arbitrage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCurrencySearch}
                  disabled={isLoadingCurrency}
                  className="w-full"
                >
                  {isLoadingCurrency ? 'Searching...' : 'Find Currency Opportunities'}
                </Button>
              </CardContent>
            </Card>

            {currencyError && (
              <Alert variant="destructive">
                <AlertDescription>{currencyError}</AlertDescription>
              </Alert>
            )}

            {currencyOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Currency Arbitrage Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currencyOpportunities.map((opportunity, index) => (
                      <div 
                        key={index} 
                        className="p-6 rounded-lg border space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            Path: {opportunity.steps.map(step => step.currency).join(' → ')}
                          </h3>
                          <span className={opportunity.profitPercentage > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            Profit: {opportunity.profitPercentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          {opportunity.steps.map((step, stepIndex) => {
                            const nextStep = opportunity.steps[stepIndex + 1];
                            if (!nextStep) return null;
                            return (
                              <div key={stepIndex} className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{step.currency}</span>
                                <span className="text-muted-foreground">{formatAmount(step.amount)}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">{nextStep.currency}</span>
                                <span className="text-muted-foreground">{formatAmount(nextStep.amount)}</span>
                                <span className="text-muted-foreground ml-2">
                                  (Rate: {nextStep.rate?.toFixed(6)})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Crypto Arbitrage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCryptoSearch}
                  disabled={isLoadingCrypto}
                  className="w-full"
                >
                  {isLoadingCrypto ? 'Searching...' : 'Find Crypto Opportunities'}
                </Button>
              </CardContent>
            </Card>

            {cryptoError && (
              <Alert variant="destructive">
                <AlertDescription>{cryptoError}</AlertDescription>
              </Alert>
            )}

            {cryptoOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Arbitrage Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cryptoOpportunities.map((opportunity, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">
                            {opportunity.coin.toUpperCase()}
                          </h3>
                          <span className="text-green-600 font-bold">
                            Profit: {opportunity.profitPercentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>BUY on {opportunity.buyExchange}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>SELL on {opportunity.sellExchange}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div>Buy Price: ${formatAmount(opportunity.buyPrice)}</div>
                            <div className="text-muted-foreground">Investment: ${formatAmount(opportunity.investmentAmount)}</div>
                          </div>
                          <div className="space-y-1 text-right">
                            <div>Sell Price: ${formatAmount(opportunity.sellPrice)}</div>
                            <div className="text-muted-foreground">Potential Profit: ${formatAmount(opportunity.potentialProfit)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Sports Betting Arbitrage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleSportsSearch}
                  disabled={isLoadingSports}
                  className="w-full"
                >
                  {isLoadingSports ? 'Searching...' : 'Find Sports Opportunities'}
                </Button>
              </CardContent>
            </Card>

            {sportsError && (
              <Alert variant="destructive">
                <AlertDescription>{sportsError}</AlertDescription>
              </Alert>
            )}

            {sportsOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sports Arbitrage Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sportsOpportunities.map((opportunity, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{opportunity.event}</h3>
                            <p className="text-sm text-muted-foreground">{opportunity.sport} • {opportunity.time}</p>
                          </div>
                          <span className="text-green-600 font-bold">
                            Profit: {opportunity.profitPercentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="font-medium">{opportunity.team1.name}</div>
                            <div>Bet on {opportunity.team1.bookmaker}</div>
                            <div>Odds: {opportunity.team1.odds}</div>
                            <div className="text-muted-foreground">
                              Bet Amount: ${formatAmount(opportunity.betAmounts.team1)}
                            </div>
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="font-medium">{opportunity.team2.name}</div>
                            <div>Bet on {opportunity.team2.bookmaker}</div>
                            <div>Odds: {opportunity.team2.odds}</div>
                            <div className="text-muted-foreground">
                              Bet Amount: ${formatAmount(opportunity.betAmounts.team2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                          <span>Total Investment: ${formatAmount(opportunity.investmentAmount)}</span>
                          <span>Potential Profit: ${formatAmount(opportunity.potentialProfit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
