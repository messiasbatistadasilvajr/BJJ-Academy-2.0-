import { BeltColor, SparringPair } from '../types';

export interface SparringAthleteCandidate {
  id: string;
  name: string;
  belt: BeltColor;
  weightKg: number;
  injuryNote?: string;
  hasInjuryWarning?: boolean;
}

const BELT_HIERARCHY: Record<BeltColor, number> = {
  white: 1,
  grey_white: 2,
  grey: 3,
  grey_black: 4,
  yellow_white: 5,
  yellow: 6,
  yellow_black: 7,
  orange_white: 8,
  orange: 9,
  orange_black: 10,
  green_white: 11,
  green: 12,
  green_black: 13,
  blue: 14,
  purple: 15,
  brown: 16,
  black: 17,
  red_black: 18,
  red_white: 19,
  red: 20
};

export function pairAthletesIntelligently(athletes: SparringAthleteCandidate[]): {
  pairs: SparringPair[];
  unpaired?: SparringAthleteCandidate;
} {
  // Ordena por peso e faixa para melhor balanceamento
  const sorted = [...athletes].sort((a, b) => {
    const beltDiff = (BELT_HIERARCHY[a.belt] || 1) - (BELT_HIERARCHY[b.belt] || 1);
    if (beltDiff !== 0) return beltDiff;
    return (a.weightKg || 75) - (b.weightKg || 75);
  });

  const pairs: SparringPair[] = [];
  const pool = [...sorted];

  while (pool.length >= 2) {
    const athlete1 = pool.shift()!;
    let bestMatchIndex = 0;
    let minScore = Infinity;

    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i];
      const weightDiff = Math.abs((athlete1.weightKg || 75) - (cand.weightKg || 75));
      const rankDiff = Math.abs((BELT_HIERARCHY[athlete1.belt] || 1) - (BELT_HIERARCHY[cand.belt] || 1));
      
      const injuryPenalty = (athlete1.hasInjuryWarning || cand.hasInjuryWarning) && weightDiff > 10 ? 50 : 0;
      const score = weightDiff + (rankDiff * 8) + injuryPenalty;

      if (score < minScore) {
        minScore = score;
        bestMatchIndex = i;
      }
    }

    const athlete2 = pool.splice(bestMatchIndex, 1)[0];
    const weightDiff = Math.abs((athlete1.weightKg || 75) - (athlete2.weightKg || 75));

    let balanceScore: 'Perfeito' | 'Equilibrado' | 'Atenção' = 'Perfeito';
    if (weightDiff > 12 || (athlete1.hasInjuryWarning || athlete2.hasInjuryWarning)) {
      balanceScore = 'Atenção';
    } else if (weightDiff > 5) {
      balanceScore = 'Equilibrado';
    }

    pairs.push({
      id: `pair_${Date.now()}_${pairs.length}`,
      athlete1: {
        id: athlete1.id,
        name: athlete1.name,
        belt: athlete1.belt,
        weightKg: athlete1.weightKg,
        injuryNote: athlete1.injuryNote,
        hasInjuryWarning: athlete1.hasInjuryWarning
      },
      athlete2: {
        id: athlete2.id,
        name: athlete2.name,
        belt: athlete2.belt,
        weightKg: athlete2.weightKg,
        injuryNote: athlete2.injuryNote,
        hasInjuryWarning: athlete2.hasInjuryWarning
      },
      weightDiffKg: weightDiff,
      balanceScore
    });
  }

  return {
    pairs,
    unpaired: pool.length > 0 ? pool[0] : undefined
  };
}
