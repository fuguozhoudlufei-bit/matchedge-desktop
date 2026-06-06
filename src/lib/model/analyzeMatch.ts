import {
  calculateOverround,
  calculateValueGap,
  normalizeThreeWayMarket,
  type ThreeWayOdds,
  type ThreeWayProbabilities,
  type ValueGap
} from "./odds";
import {
  aggregateWinDrawLose,
  generateScoreMatrix,
  mostLikelyScores,
  overUnderProbabilities,
  type OverUnderProbabilities,
  type ScoreProbability,
  type WinDrawLoseProbabilities
} from "./poisson";

const DEFAULT_TOP_SCORE_LIMIT = 5;

export type RiskLevel = "low" | "medium" | "high";

export interface ExpectedGoals {
  home: number;
  away: number;
  total: number;
}

export interface MarketComparison {
  marketProbabilities: ThreeWayProbabilities;
  overround: number;
  valueGap: ValueGap;
}

export interface MatchRecommendation {
  action: "skip" | "observe" | "small" | "playable";
  riskLevel: RiskLevel;
  reasons: string[];
}

export interface AnalyzeMatchInput {
  homeLambda: number;
  awayLambda: number;
  maxGoals: number;
  marketOdds?: ThreeWayOdds;
  overUnderLine?: number;
  topScoreLimit?: number;
}

export interface AnalyzeMatchResult {
  expectedGoals: ExpectedGoals;
  scoreMatrix: ScoreProbability[][];
  winDrawLoseProbabilities: WinDrawLoseProbabilities;
  topScores: ScoreProbability[];
  overUnderProbabilities?: OverUnderProbabilities;
  marketComparison?: MarketComparison;
  recommendation: MatchRecommendation;
}

function largestAbsoluteValueGap(valueGap: ValueGap): number {
  return Math.max(Math.abs(valueGap.home), Math.abs(valueGap.draw), Math.abs(valueGap.away));
}

function determineRiskLevel(input: AnalyzeMatchInput): RiskLevel {
  if (input.maxGoals < 5 || input.marketOdds === undefined) {
    return "high";
  }

  return "medium";
}

function buildRecommendation(
  input: AnalyzeMatchInput,
  marketComparison?: MarketComparison
): MatchRecommendation {
  const riskLevel = determineRiskLevel(input);
  const reasons: string[] = [];

  if (input.maxGoals < 5) {
    reasons.push("maxGoals below 5 increases truncation risk.");
  }

  if (marketComparison === undefined) {
    reasons.push("Market odds are missing, so no model-market comparison is available.");

    return {
      action: "observe",
      riskLevel,
      reasons
    };
  }

  const largestGap = largestAbsoluteValueGap(marketComparison.valueGap);

  if (largestGap < 0.03) {
    reasons.push("All absolute model-market gaps are below 0.03.");

    return {
      action: "skip",
      riskLevel,
      reasons
    };
  }

  if (largestGap < 0.06) {
    reasons.push("Largest absolute model-market gap is at least 0.03 and below 0.06.");

    return {
      action: "observe",
      riskLevel,
      reasons
    };
  }

  if (largestGap < 0.1) {
    reasons.push("Largest absolute model-market gap is at least 0.06 and below 0.10.");

    return {
      action: "small",
      riskLevel,
      reasons
    };
  }

  reasons.push("Largest absolute model-market gap is at least 0.10.");

  return {
    action: "playable",
    riskLevel,
    reasons
  };
}

function compareMarket(
  marketOdds: ThreeWayOdds,
  modelProbabilities: ThreeWayProbabilities
): MarketComparison {
  const marketProbabilities = normalizeThreeWayMarket(marketOdds);
  const overround = calculateOverround(marketOdds);
  const valueGap = calculateValueGap(modelProbabilities, marketProbabilities);

  return {
    marketProbabilities,
    overround,
    valueGap
  };
}

export function analyzeMatch(input: AnalyzeMatchInput): AnalyzeMatchResult {
  const scoreMatrix = generateScoreMatrix({
    homeLambda: input.homeLambda,
    awayLambda: input.awayLambda,
    maxGoals: input.maxGoals
  });
  const winDrawLoseProbabilities = aggregateWinDrawLose(scoreMatrix);
  const marketComparison =
    input.marketOdds === undefined
      ? undefined
      : compareMarket(input.marketOdds, winDrawLoseProbabilities);
  const overUnder =
    input.overUnderLine === undefined
      ? undefined
      : overUnderProbabilities(scoreMatrix, input.overUnderLine);

  return {
    expectedGoals: {
      home: input.homeLambda,
      away: input.awayLambda,
      total: input.homeLambda + input.awayLambda
    },
    scoreMatrix,
    winDrawLoseProbabilities,
    topScores: mostLikelyScores(scoreMatrix, input.topScoreLimit ?? DEFAULT_TOP_SCORE_LIMIT),
    ...(overUnder === undefined ? {} : { overUnderProbabilities: overUnder }),
    ...(marketComparison === undefined ? {} : { marketComparison }),
    recommendation: buildRecommendation(input, marketComparison)
  };
}
