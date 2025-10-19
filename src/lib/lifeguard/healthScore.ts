/**
 * The Lifeguard - Intelligent Position Health Scoring
 *
 * Calculates a 0-100 health score for Uniswap V3 positions based on:
 * 1. Profitability (40% weight) - Total fees vs potential IL
 * 2. Fee Performance (30% weight) - Fee generation rate
 * 3. Liquidity Utilization (20% weight) - Active liquidity efficiency
 * 4. Risk Metrics (10% weight) - Range width and safety
 */

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  feeTier: string;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0?: string;
  collectedFeesToken1?: string;
  tickLower: { tickIdx: string } | null;
  tickUpper: { tickIdx: string } | null;
};

export interface HealthScore {
  overall: number;
  profitability: number;
  feePerformance: number;
  liquidityUtilization: number;
  riskMetrics: number;
  status: HealthStatus;
}

export interface HealthStatus {
  color: 'excellent' | 'good' | 'warning' | 'danger' | 'critical';
  emoji: string;
  label: string;
}

/**
 * Calculate comprehensive health score for a position
 */
export function calculateHealthScore(position: Position): HealthScore {
  const profitability = calculateProfitability(position);
  const feePerformance = calculateFeePerformance(position);
  const liquidityUtilization = calculateLiquidityUtilization(position);
  const riskMetrics = calculateRiskMetrics(position);

  // Weighted average
  const overall = Math.round(
    profitability * 0.4 +
    feePerformance * 0.3 +
    liquidityUtilization * 0.2 +
    riskMetrics * 0.1
  );

  const status = getHealthStatusSafe(overall);

  return {
    overall,
    profitability,
    feePerformance,
    liquidityUtilization,
    riskMetrics,
    status,
  };
}

/**
 * Factor 1: Profitability (40% weight)
 * Measures total fees earned vs position value
 */
function calculateProfitability(position: Position): number {
  const decimals0 = Number(position.token0.decimals || 18);
  const decimals1 = Number(position.token1.decimals || 18);

  // Calculate total fees (collected + uncollected)
  const totalFees0 = BigInt(position.collectedFeesToken0 || '0') + BigInt(position.uncollectedFeesToken0 || '0');
  const totalFees1 = BigInt(position.collectedFeesToken1 || '0') + BigInt(position.uncollectedFeesToken1 || '0');

  const fees0 = Number(totalFees0) / Math.pow(10, decimals0);
  const fees1 = Number(totalFees1) / Math.pow(10, decimals1);

  // Calculate deposited value
  const deposited0 = Number(position.depositedToken0 || '0') / Math.pow(10, decimals0);
  const deposited1 = Number(position.depositedToken1 || '0') / Math.pow(10, decimals1);

  const totalDeposited = deposited0 + deposited1;
  const totalFees = fees0 + fees1;

  if (totalDeposited === 0) return 0;

  // Calculate fee yield percentage
  const feeYieldPercent = (totalFees / totalDeposited) * 100;

  // Score based on fee yield
  // 0%: 0 points, 1%: 50 points, 5%: 80 points, 10%+: 100 points
  if (feeYieldPercent >= 10) return 100;
  if (feeYieldPercent >= 5) return 80 + (feeYieldPercent - 5) * 4;
  if (feeYieldPercent >= 1) return 50 + (feeYieldPercent - 1) * 7.5;
  return Math.min(50, feeYieldPercent * 50);
}

/**
 * Factor 2: Fee Performance (30% weight)
 * Measures uncollected fees relative to position size
 */
function calculateFeePerformance(position: Position): number {
  const decimals0 = Number(position.token0.decimals || 18);
  const decimals1 = Number(position.token1.decimals || 18);

  const uncollectedFees0 = Number(BigInt(position.uncollectedFeesToken0 || '0')) / Math.pow(10, decimals0);
  const uncollectedFees1 = Number(BigInt(position.uncollectedFeesToken1 || '0')) / Math.pow(10, decimals1);

  const totalUncollectedFees = uncollectedFees0 + uncollectedFees1;

  // Score based on uncollected fee accumulation
  // More uncollected fees = better performance (active position)
  if (totalUncollectedFees === 0) return 30; // Low score for no fees
  if (totalUncollectedFees < 0.001) return 50;
  if (totalUncollectedFees < 0.01) return 65;
  if (totalUncollectedFees < 0.1) return 80;
  if (totalUncollectedFees < 1) return 90;
  return 100; // Excellent fee accumulation
}

/**
 * Factor 3: Liquidity Utilization (20% weight)
 * Measures if the position has meaningful liquidity
 */
function calculateLiquidityUtilization(position: Position): number {
  const liquidity = Number(position.liquidity);

  // Score based on liquidity amount
  // Higher liquidity generally means better utilization
  if (liquidity === 0) return 0;
  if (liquidity < 1000) return 30;
  if (liquidity < 10000) return 50;
  if (liquidity < 100000) return 70;
  if (liquidity < 1000000) return 85;
  return 100;
}

/**
 * Factor 4: Risk Metrics (10% weight)
 * Measures position safety based on range width
 */
function calculateRiskMetrics(position: Position): number {
  if (!position.tickLower || !position.tickUpper) {
    return 50; // Neutral score if tick data unavailable
  }

  const tickLower = Number(position.tickLower.tickIdx);
  const tickUpper = Number(position.tickUpper.tickIdx);
  const tickRange = Math.abs(tickUpper - tickLower);

  // Wider ranges are generally safer (less risk of going out of range)
  // But very wide ranges have lower capital efficiency
  // Sweet spot is moderate range width

  if (tickRange === 0) return 10; // Single tick - very risky
  if (tickRange < 100) return 40; // Very narrow - high risk
  if (tickRange < 500) return 60; // Narrow - moderate risk
  if (tickRange < 2000) return 85; // Moderate - good balance
  if (tickRange < 5000) return 95; // Wide - very safe
  return 100; // Very wide - maximum safety
}

/**
 * Get health status based on overall score
 */
export function getHealthStatus(score: number): HealthStatus {
  if (score >= 90) return { color: 'excellent', emoji: '', label: 'Excellent' };
  if (score >= 75) return { color: 'good', emoji: '', label: 'Good' };
  if (score >= 60) return { color: 'warning', emoji: '', label: 'Fair' };
  if (score >= 40) return { color: 'danger', emoji: '', label: 'Risky' };
  return { color: 'critical', emoji: '', label: 'Critical' };
}

/**
 * Get detailed breakdown of health factors
 */
export function getHealthBreakdown(position: Position) {
  const health = calculateHealthScore(position);

  return {
    overall: health.overall,
    factors: [
      {
        name: 'Profitability',
        score: health.profitability,
        weight: 40,
        description: 'Total fees earned vs position value',
      },
      {
        name: 'Fee Performance',
        score: health.feePerformance,
        weight: 30,
        description: 'Active fee generation',
      },
      {
        name: 'Liquidity Utilization',
        score: health.liquidityUtilization,
        weight: 20,
        description: 'Capital efficiency',
      },
      {
        name: 'Risk Metrics',
        score: health.riskMetrics,
        weight: 10,
        description: 'Position safety',
      },
    ],
    status: health.status,
  };
}

// Safer status mapper without encoding issues
export function getHealthStatusSafe(score: number): HealthStatus {
  if (score >= 90) return { color: 'excellent', emoji: '', label: 'Excellent' };
  if (score >= 75) return { color: 'good', emoji: '', label: 'Good' };
  if (score >= 60) return { color: 'warning', emoji: '', label: 'Fair' };
  if (score >= 40) return { color: 'danger', emoji: '', label: 'Risky' };
  return { color: 'critical', emoji: '', label: 'Critical' };
}

