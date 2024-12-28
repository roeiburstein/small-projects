'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface ArbitrageStep {
  currency: string;
  amount: number;
  rate?: number;
}

interface ArbitrageOpportunity {
  steps: ArbitrageStep[];
  profitPercentage: number;
}

export default function ArbitragePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
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
      setOpportunities(data.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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
        <h1 className="text-4xl font-bold tracking-tight">Currency Arbitrage Finder</h1>
        <p className="text-xl text-muted-foreground">
          Find profitable currency exchange cycles using real-time exchange rates
        </p>
      </section>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Find Arbitrage Opportunities'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {opportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Arbitrage Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {opportunities.map((opportunity, index) => (
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
      </div>
    </>
  );
}
