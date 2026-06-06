import {
  getHighestProbabilityOutcome,
  InvalidReviewInputError,
  reviewPrediction,
  type MatchOutcome,
  type OutcomeProbabilities,
  type ReviewResult
} from "../lib/review";

export type ReviewPredictionSelection = "modelTop" | MatchOutcome;

export interface SingleMatchReviewFormState {
  homeGoals: string;
  awayGoals: string;
  predictedOutcome: ReviewPredictionSelection;
}

export interface SingleMatchReviewViewModel {
  modelTopOutcome: MatchOutcome;
  predictedOutcome: MatchOutcome;
  result?: ReviewResult;
  validationMessages: string[];
}

interface ParsedScoreState {
  hasAnyScoreInput: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

export const defaultSingleMatchReviewFormState: SingleMatchReviewFormState = {
  homeGoals: "",
  awayGoals: "",
  predictedOutcome: "modelTop"
};

const matchOutcomes: readonly MatchOutcome[] = ["home", "draw", "away"];

function isMatchOutcome(value: string): value is MatchOutcome {
  return matchOutcomes.some((outcome) => outcome === value);
}

function parseRequiredGoal(
  rawValue: string,
  label: string,
  validationMessages: string[]
): number | undefined {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    validationMessages.push(`${label} is required.`);
    return undefined;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue) || parsedValue < 0) {
    validationMessages.push(`${label} must be a whole number greater than or equal to 0.`);
    return undefined;
  }

  return parsedValue;
}

function parseScoreInputs(
  formState: SingleMatchReviewFormState,
  validationMessages: string[]
): ParsedScoreState {
  const hasAnyScoreInput =
    formState.homeGoals.trim().length > 0 || formState.awayGoals.trim().length > 0;

  if (!hasAnyScoreInput) {
    return { hasAnyScoreInput };
  }

  return {
    hasAnyScoreInput,
    homeGoals: parseRequiredGoal(formState.homeGoals, "Actual home goals", validationMessages),
    awayGoals: parseRequiredGoal(formState.awayGoals, "Actual away goals", validationMessages)
  };
}

function describeReviewError(error: unknown): string {
  if (error instanceof InvalidReviewInputError) {
    return error.message;
  }

  if (error instanceof Error) {
    return `Review validation failed: ${error.message}`;
  }

  return "Review validation failed for the provided inputs.";
}

function resolvePredictedOutcome(
  modelTopOutcome: MatchOutcome,
  selection: string,
  validationMessages: string[]
): MatchOutcome {
  if (selection === "modelTop") {
    return modelTopOutcome;
  }

  if (isMatchOutcome(selection)) {
    return selection;
  }

  validationMessages.push("Prediction direction must be home, draw, away, or highest probability.");
  return modelTopOutcome;
}

export function buildSingleMatchReview(
  formState: SingleMatchReviewFormState,
  probabilities: OutcomeProbabilities
): SingleMatchReviewViewModel {
  const validationMessages: string[] = [];

  try {
    const modelTopOutcome = getHighestProbabilityOutcome(probabilities);
    const predictedOutcome = resolvePredictedOutcome(
      modelTopOutcome,
      formState.predictedOutcome,
      validationMessages
    );
    const parsedScore = parseScoreInputs(formState, validationMessages);

    if (
      !parsedScore.hasAnyScoreInput ||
      validationMessages.length > 0 ||
      parsedScore.homeGoals === undefined ||
      parsedScore.awayGoals === undefined
    ) {
      return {
        modelTopOutcome,
        predictedOutcome,
        validationMessages
      };
    }

    return {
      modelTopOutcome,
      predictedOutcome,
      result: reviewPrediction({
        actualScore: {
          homeGoals: parsedScore.homeGoals,
          awayGoals: parsedScore.awayGoals
        },
        predictedOutcome,
        probabilities
      }),
      validationMessages
    };
  } catch (error: unknown) {
    return {
      modelTopOutcome: "home",
      predictedOutcome: "home",
      validationMessages: [describeReviewError(error)]
    };
  }
}
