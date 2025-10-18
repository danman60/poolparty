export function scoreVolumeToTVL(dailyVolume: number, tvl: number): {
  score: number; // 0-10
  rating: string;
  description: string;
} {
  if (!isFinite(dailyVolume) || !isFinite(tvl) || tvl <= 0) {
    return { score: 1, rating: 'Very Poor', description: 'Insufficient data' };
  }
  const ratio = dailyVolume / tvl;

  if (ratio > 1.0) return {
    score: 10,
    rating: 'Excellent',
    description: 'Exceptional trading activity - premium fee generation',
  };

  if (ratio > 0.5) return {
    score: 9,
    rating: 'Excellent',
    description: 'Very high volume - great for earning fees',
  };

  if (ratio > 0.3) return {
    score: 7,
    rating: 'Good',
    description: 'Healthy trading activity',
  };

  if (ratio > 0.15) return {
    score: 5,
    rating: 'Fair',
    description: 'Moderate activity - fees may not offset IL',
  };

  if (ratio > 0.05) return {
    score: 3,
    rating: 'Poor',
    description: 'Low trading volume - poor fee generation',
  };

  return {
    score: 1,
    rating: 'Very Poor',
    description: 'Stagnant pool - avoid',
  };
}

