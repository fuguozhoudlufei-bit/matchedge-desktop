import type { WinDrawLoseProbabilities } from "../model";
import { EXPLANATION_CONSTRAINTS } from "./explanationPrompt";
import type {
  ExplanationAnalysisResult,
  ExplanationInput,
  ExplanationOptionalContext,
  ExplanationOutput,
  ExplanationRiskNote,
  ExplanationSection
} from "./explanationTypes";

const probabilityFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const signedProbabilityFormatter = new Intl.NumberFormat("en-US", {
  signDisplay: "exceptZero",
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

type Direction = keyof WinDrawLoseProbabilities;

const directionLabels: Record<Direction, string> = {
  home: "home",
  draw: "draw",
  away: "away"
};

export function buildExplanationInput(
  analysisResult: ExplanationAnalysisResult,
  optionalContext: ExplanationOptionalContext = {}
): ExplanationInput {
  return {
    source: "analyzeMatch",
    homeTeamLabel: optionalContext.homeTeamLabel ?? "Home",
    awayTeamLabel: optionalContext.awayTeamLabel ?? "Away",
    expectedGoals: analysisResult.expectedGoals,
    winDrawLoseProbabilities: analysisResult.winDrawLoseProbabilities,
    topScores: analysisResult.topScores,
    ...(analysisResult.overUnderProbabilities === undefined
      ? {}
      : { overUnderProbabilities: analysisResult.overUnderProbabilities }),
    ...(analysisResult.marketComparison === undefined
      ? {}
      : { marketComparison: analysisResult.marketComparison }),
    recommendation: analysisResult.recommendation,
    constraints: EXPLANATION_CONSTRAINTS
  };
}

function section(title: string, items: string[]): ExplanationSection {
  return { title, items };
}

function formatProbability(value: number): string {
  return probabilityFormatter.format(value);
}

function formatSignedProbability(value: number): string {
  return signedProbabilityFormatter.format(value);
}

function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

function getHighestModelDirection(probabilities: WinDrawLoseProbabilities): Direction {
  const directions: Direction[] = ["home", "draw", "away"];

  return directions.reduce((highestDirection, direction) =>
    probabilities[direction] > probabilities[highestDirection] ? direction : highestDirection
  );
}

function getLargestValueGapDirection(input: ExplanationInput): Direction | undefined {
  if (input.marketComparison === undefined) {
    return undefined;
  }

  const directions: Direction[] = ["home", "draw", "away"];
  const valueGap = input.marketComparison.valueGap;

  return directions.reduce((largestDirection, direction) =>
    Math.abs(valueGap[direction]) > Math.abs(valueGap[largestDirection])
      ? direction
      : largestDirection
  );
}

function formatDirection(input: ExplanationInput, direction: Direction): string {
  if (direction === "home") {
    return `${input.homeTeamLabel} home`;
  }

  if (direction === "away") {
    return `${input.awayTeamLabel} away`;
  }

  return "draw";
}

function buildSummary(input: ExplanationInput): ExplanationSection {
  const highestDirection = getHighestModelDirection(input.winDrawLoseProbabilities);

  return section("Summary", [
    `This local deterministic draft explains the supplied analyzeMatch output for ${input.homeTeamLabel} vs ${input.awayTeamLabel}.`,
    `The highest model probability is ${formatDirection(input, highestDirection)} at ${formatProbability(
      input.winDrawLoseProbabilities[highestDirection]
    )}.`,
    `The model recommendation is ${input.recommendation.action} with ${input.recommendation.riskLevel} risk.`
  ]);
}

function buildProbabilityExplanation(input: ExplanationInput): ExplanationSection {
  return section("Probability explanation", [
    `${input.homeTeamLabel} home probability is ${formatProbability(
      input.winDrawLoseProbabilities.home
    )}, draw is ${formatProbability(input.winDrawLoseProbabilities.draw)}, and ${
      input.awayTeamLabel
    } away probability is ${formatProbability(input.winDrawLoseProbabilities.away)}.`,
    `Expected goals are ${formatDecimal(input.expectedGoals.home)} for ${input.homeTeamLabel}, ${formatDecimal(
      input.expectedGoals.away
    )} for ${input.awayTeamLabel}, and ${formatDecimal(input.expectedGoals.total)} total.`,
    `Top score outputs are used as supporting model detail and do not replace the win/draw/lose probabilities.`
  ]);
}

function buildMarketExplanation(input: ExplanationInput): ExplanationSection {
  if (input.marketComparison === undefined) {
    return section("Market explanation", [
      "Market odds were not provided, so no model-market comparison is available.",
      "Market comparison requires home, draw, and away odds before normalized market probabilities and value gaps can be explained."
    ]);
  }

  const largestGapDirection = getLargestValueGapDirection(input) ?? "home";
  const largestGap = input.marketComparison.valueGap[largestGapDirection];

  return section("Market explanation", [
    `Market probabilities are home ${formatProbability(
      input.marketComparison.marketProbabilities.home
    )}, draw ${formatProbability(input.marketComparison.marketProbabilities.draw)}, and away ${formatProbability(
      input.marketComparison.marketProbabilities.away
    )}.`,
    `The largest absolute value gap is ${directionLabels[largestGapDirection]} at ${formatSignedProbability(
      largestGap
    )}. Positive gap means the model probability is above the market probability; negative gap means it is below.`,
    `Overround from the supplied market odds is ${formatSignedProbability(
      input.marketComparison.overround
    )}.`
  ]);
}

function buildRiskNotes(input: ExplanationInput): ExplanationRiskNote[] {
  const notes: ExplanationRiskNote[] = input.recommendation.reasons.map((reason) => ({
    level: "caution",
    message: reason
  }));

  notes.push({
    level: "info",
    message: "This explanation is decision support only and does not create automatic betting."
  });

  return notes;
}

function buildCounterArguments(input: ExplanationInput): ExplanationSection {
  const marketCounter =
    input.marketComparison === undefined
      ? "Without supplied market odds, the explanation cannot compare model probabilities with market probabilities."
      : "A value gap can come from market movement, input quality, or model assumptions; it is not a standalone conclusion.";

  return section("Counter arguments", [
    "The model is based on supplied local inputs, so weak or stale inputs can make the explanation less useful.",
    "Score probabilities and expected goals are model outputs, not certain match events.",
    marketCounter
  ]);
}

function buildDataLimitations(input: ExplanationInput): ExplanationSection {
  const limitations = [
    "No external football data, team news, or player availability data is included in this explanation input.",
    "The draft does not call an external AI API and does not fetch odds or match data.",
    "The model output remains the source of truth; this layer only summarizes and critiques it."
  ];

  if (input.marketComparison === undefined) {
    limitations.push("Missing market odds limit the explanation to model probabilities and recommendation reasons.");
  }

  return section("Data limitations", limitations);
}

function buildNextChecks(input: ExplanationInput): ExplanationSection {
  const nextChecks = [
    "Review the expected-goals inputs and maxGoals setting before relying on the analysis.",
    "Check whether the recommendation reasons match the intended review threshold.",
    "Use post-match review later to compare the selected direction with the 90-minute result."
  ];

  if (input.marketComparison === undefined) {
    nextChecks.unshift("Enter all three market odds if model-market comparison is needed.");
  }

  return section("Next checks", nextChecks);
}

export function buildLocalExplanationDraft(input: ExplanationInput): ExplanationOutput {
  return {
    source: "local-deterministic-draft",
    usesExternalApi: false,
    sourceModelProbabilities: { ...input.winDrawLoseProbabilities },
    ...(input.marketComparison === undefined
      ? {}
      : { sourceMarketProbabilities: { ...input.marketComparison.marketProbabilities } }),
    summary: buildSummary(input),
    probabilityExplanation: buildProbabilityExplanation(input),
    marketExplanation: buildMarketExplanation(input),
    riskNotes: buildRiskNotes(input),
    counterArguments: buildCounterArguments(input),
    dataLimitations: buildDataLimitations(input),
    nextChecks: buildNextChecks(input),
    constraints: input.constraints
  };
}
