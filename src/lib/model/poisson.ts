export interface ScoreProbability {
  homeGoals: number;
  awayGoals: number;
  probability: number;
}

export interface ScoreMatrixInput {
  homeLambda: number;
  awayLambda: number;
  maxGoals: number;
}

export interface WinDrawLoseProbabilities {
  home: number;
  draw: number;
  away: number;
}

export interface OverUnderProbabilities {
  over: number;
  under: number;
}

export class InvalidPoissonInputError extends Error {
  readonly field: string;
  readonly value: unknown;

  constructor(field: string, value: unknown) {
    super(`Invalid Poisson input for ${field}: ${String(value)}`);
    this.name = "InvalidPoissonInputError";
    this.field = field;
    this.value = value;
  }
}

function assertValidLambda(lambda: number, field: string): void {
  if (!Number.isFinite(lambda) || lambda < 0) {
    throw new InvalidPoissonInputError(field, lambda);
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidPoissonInputError(field, value);
  }
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InvalidPoissonInputError(field, value);
  }
}

function assertPositiveFiniteNumber(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new InvalidPoissonInputError(field, value);
  }
}

export function factorial(n: number): number {
  assertNonNegativeInteger(n, "n");

  let result = 1;

  for (let factor = 2; factor <= n; factor += 1) {
    result *= factor;
  }

  return result;
}

function logFactorial(n: number): number {
  let result = 0;

  for (let factor = 2; factor <= n; factor += 1) {
    result += Math.log(factor);
  }

  return result;
}

function poissonLogProbability(lambda: number, goals: number): number {
  if (lambda === 0) {
    return goals === 0 ? 0 : Number.NEGATIVE_INFINITY;
  }

  return -lambda + goals * Math.log(lambda) - logFactorial(goals);
}

export function poissonProbability(lambda: number, goals: number): number {
  assertValidLambda(lambda, "lambda");
  assertNonNegativeInteger(goals, "goals");

  if (lambda === 0) {
    return goals === 0 ? 1 : 0;
  }

  return Math.exp(poissonLogProbability(lambda, goals));
}

export function generateScoreMatrix(input: ScoreMatrixInput): ScoreProbability[][] {
  const { homeLambda, awayLambda, maxGoals } = input;

  assertValidLambda(homeLambda, "homeLambda");
  assertValidLambda(awayLambda, "awayLambda");
  assertNonNegativeInteger(maxGoals, "maxGoals");

  const logWeights: number[][] = [];
  let maxLogWeight = Number.NEGATIVE_INFINITY;

  for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals += 1) {
    const row: number[] = [];
    const homeLogProbability = poissonLogProbability(homeLambda, homeGoals);

    for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals += 1) {
      const logWeight = homeLogProbability + poissonLogProbability(awayLambda, awayGoals);

      row.push(logWeight);
      maxLogWeight = Math.max(maxLogWeight, logWeight);
    }

    logWeights.push(row);
  }

  const weights = logWeights.map((row) =>
    row.map((logWeight) => Math.exp(logWeight - maxLogWeight))
  );
  const totalWeight = weights.reduce(
    (matrixTotal, row) => matrixTotal + row.reduce((rowTotal, weight) => rowTotal + weight, 0),
    0
  );

  // Goals above maxGoals are intentionally truncated for the MVP. Normalize the
  // retained 0..maxGoals grid so downstream probabilities sum to 1.
  return weights.map((row, homeGoals) =>
    row.map((weight, awayGoals) => ({
      homeGoals,
      awayGoals,
      probability: weight / totalWeight
    }))
  );
}

export function aggregateWinDrawLose(
  scoreMatrix: ScoreProbability[][]
): WinDrawLoseProbabilities {
  return scoreMatrix.reduce<WinDrawLoseProbabilities>(
    (totals, row) =>
      row.reduce<WinDrawLoseProbabilities>((rowTotals, score) => {
        if (score.homeGoals > score.awayGoals) {
          return { ...rowTotals, home: rowTotals.home + score.probability };
        }

        if (score.homeGoals < score.awayGoals) {
          return { ...rowTotals, away: rowTotals.away + score.probability };
        }

        return { ...rowTotals, draw: rowTotals.draw + score.probability };
      }, totals),
    { home: 0, draw: 0, away: 0 }
  );
}

export function mostLikelyScores(
  scoreMatrix: ScoreProbability[][],
  limit: number
): ScoreProbability[] {
  assertPositiveInteger(limit, "limit");

  return scoreMatrix
    .flat()
    .sort(
      (left, right) =>
        right.probability - left.probability ||
        left.homeGoals - right.homeGoals ||
        left.awayGoals - right.awayGoals
    )
    .slice(0, limit)
    .map((score) => ({ ...score }));
}

export function overUnderProbabilities(
  scoreMatrix: ScoreProbability[][],
  line: number
): OverUnderProbabilities {
  assertPositiveFiniteNumber(line, "line");

  return scoreMatrix.reduce<OverUnderProbabilities>(
    (totals, row) =>
      row.reduce<OverUnderProbabilities>((rowTotals, score) => {
        if (score.homeGoals + score.awayGoals > line) {
          return { ...rowTotals, over: rowTotals.over + score.probability };
        }

        return { ...rowTotals, under: rowTotals.under + score.probability };
      }, totals),
    { over: 0, under: 0 }
  );
}
