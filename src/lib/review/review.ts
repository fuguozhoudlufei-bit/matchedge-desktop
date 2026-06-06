export type MatchOutcome = "home" | "draw" | "away";

export interface ActualScore {
  homeGoals: number;
  awayGoals: number;
}

export interface OutcomeProbabilities {
  home: number;
  draw: number;
  away: number;
}

export interface ReviewInput {
  actualScore: ActualScore;
  probabilities: OutcomeProbabilities;
  predictedOutcome: MatchOutcome;
}

export interface ReviewResult {
  actualScore: ActualScore;
  actualOutcome: MatchOutcome;
  probabilities: OutcomeProbabilities;
  predictedOutcome: MatchOutcome;
  predictionHit: boolean;
  brierScore: number;
  summary: string;
}

export class InvalidReviewInputError extends Error {
  readonly field: string;
  readonly value: unknown;

  constructor(field: string, value: unknown, message?: string) {
    super(message ?? `Invalid review input for ${field}: ${String(value)}`);
    this.name = "InvalidReviewInputError";
    this.field = field;
    this.value = value;
  }
}

const MATCH_OUTCOMES: readonly MatchOutcome[] = ["home", "draw", "away"];
const PROBABILITY_SUM_TOLERANCE = 1e-6;

const outcomeLabels: Record<MatchOutcome, string> = {
  home: "home win",
  draw: "draw",
  away: "away win"
};

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new InvalidReviewInputError(
      field,
      value,
      `${field} must be a finite whole number greater than or equal to 0.`
    );
  }
}

function isMatchOutcome(value: unknown): value is MatchOutcome {
  return MATCH_OUTCOMES.some((outcome) => outcome === value);
}

function assertMatchOutcome(value: unknown, field: string): asserts value is MatchOutcome {
  if (!isMatchOutcome(value)) {
    throw new InvalidReviewInputError(
      field,
      value,
      `${field} must be one of home, draw, or away.`
    );
  }
}

function assertValidProbabilities(probabilities: OutcomeProbabilities): void {
  for (const outcome of MATCH_OUTCOMES) {
    const probability = probabilities[outcome];

    if (!Number.isFinite(probability)) {
      throw new InvalidReviewInputError(
        `probabilities.${outcome}`,
        probability,
        `probabilities.${outcome} must be a finite number.`
      );
    }

    if (probability < 0) {
      throw new InvalidReviewInputError(
        `probabilities.${outcome}`,
        probability,
        `probabilities.${outcome} must be greater than or equal to 0.`
      );
    }
  }

  const total = probabilities.home + probabilities.draw + probabilities.away;

  if (Math.abs(total - 1) > PROBABILITY_SUM_TOLERANCE) {
    throw new InvalidReviewInputError(
      "probabilities",
      total,
      "Probabilities must sum approximately to 1."
    );
  }
}

function assertValidBrierScore(brierScore: number): void {
  if (!Number.isFinite(brierScore) || brierScore < 0) {
    throw new InvalidReviewInputError(
      "brierScore",
      brierScore,
      "brierScore must be a finite number greater than or equal to 0."
    );
  }
}

export function getMatchOutcome(actualScore: ActualScore): MatchOutcome {
  assertNonNegativeInteger(actualScore.homeGoals, "homeGoals");
  assertNonNegativeInteger(actualScore.awayGoals, "awayGoals");

  if (actualScore.homeGoals > actualScore.awayGoals) {
    return "home";
  }

  if (actualScore.homeGoals < actualScore.awayGoals) {
    return "away";
  }

  return "draw";
}

export function getHighestProbabilityOutcome(
  probabilities: OutcomeProbabilities
): MatchOutcome {
  assertValidProbabilities(probabilities);

  return MATCH_OUTCOMES.reduce<MatchOutcome>(
    (currentOutcome, nextOutcome) =>
      probabilities[nextOutcome] > probabilities[currentOutcome] ? nextOutcome : currentOutcome,
    "home"
  );
}

export function calculateBrierScore(
  probabilities: OutcomeProbabilities,
  actualOutcome: MatchOutcome
): number {
  assertValidProbabilities(probabilities);
  assertMatchOutcome(actualOutcome, "actualOutcome");

  return MATCH_OUTCOMES.reduce((total, outcome) => {
    const actualValue = outcome === actualOutcome ? 1 : 0;

    return total + (probabilities[outcome] - actualValue) ** 2;
  }, 0);
}

export function calculatePredictionHit(
  predictedOutcome: MatchOutcome,
  actualOutcome: MatchOutcome
): boolean {
  assertMatchOutcome(predictedOutcome, "predictedOutcome");
  assertMatchOutcome(actualOutcome, "actualOutcome");

  return predictedOutcome === actualOutcome;
}

export function formatReviewSummary(
  review: Omit<ReviewResult, "actualScore" | "probabilities" | "summary">
): string {
  assertMatchOutcome(review.predictedOutcome, "predictedOutcome");
  assertMatchOutcome(review.actualOutcome, "actualOutcome");
  assertValidBrierScore(review.brierScore);

  const verdict = review.predictionHit ? "Prediction matched" : "Prediction missed";

  return `${verdict}: predicted ${outcomeLabels[review.predictedOutcome]}, actual 90-minute outcome was ${outcomeLabels[review.actualOutcome]}. Brier score ${review.brierScore.toFixed(3)}.`;
}

export function reviewPrediction(input: ReviewInput): ReviewResult {
  const actualOutcome = getMatchOutcome(input.actualScore);
  const brierScore = calculateBrierScore(input.probabilities, actualOutcome);
  const predictionHit = calculatePredictionHit(input.predictedOutcome, actualOutcome);
  const summary = formatReviewSummary({
    actualOutcome,
    brierScore,
    predictedOutcome: input.predictedOutcome,
    predictionHit
  });

  return {
    actualScore: { ...input.actualScore },
    actualOutcome,
    probabilities: { ...input.probabilities },
    predictedOutcome: input.predictedOutcome,
    predictionHit,
    brierScore,
    summary
  };
}
