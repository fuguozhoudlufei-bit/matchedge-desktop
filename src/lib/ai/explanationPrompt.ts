import type { ExplanationConstraint, ExplanationInput } from "./explanationTypes";

export const EXPLANATION_CONSTRAINTS: ExplanationConstraint[] = [
  {
    id: "preserve-model-probabilities",
    title: "Do not change model probabilities.",
    description: "Use the supplied model probabilities exactly as source facts."
  },
  {
    id: "no-invented-odds",
    title: "Do not invent odds.",
    description: "Only discuss market probabilities when market odds were supplied to the model."
  },
  {
    id: "no-invented-team-news",
    title: "Do not invent team news.",
    description: "Do not add unavailable lineup, tactical, weather, or schedule details."
  },
  {
    id: "no-invented-injuries",
    title: "Do not invent injuries.",
    description: "Do not mention player availability unless it is supplied as explicit context."
  },
  {
    id: "no-certainty-claims",
    title: "Do not claim certainty.",
    description: "Explain the probabilities as model estimates, not certain outcomes."
  },
  {
    id: "no-profit-promises",
    title: "Do not promise profit.",
    description: "Do not frame the explanation as a financial outcome or return forecast."
  },
  {
    id: "separate-model-and-market",
    title: "Distinguish model probability from market probability.",
    description: "Keep model output and normalized market output clearly separated."
  },
  {
    id: "not-automatic-betting",
    title: "Mention that this is not automatic betting.",
    description: "The explanation is decision support only and must not create any action."
  }
];

const probabilityFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatProbability(value: number): string {
  return `${value.toFixed(4)} (${probabilityFormatter.format(value)})`;
}

function formatSignedProbability(value: number): string {
  const sign = value > 0 ? "+" : "";

  return `${sign}${formatProbability(value)}`;
}

function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

function formatConstraintList(constraints: ExplanationConstraint[]): string {
  return constraints.map((constraint) => `- ${constraint.title} ${constraint.description}`).join("\n");
}

function formatMarketBlock(input: ExplanationInput): string {
  if (input.marketComparison === undefined) {
    return "Market comparison: not available because home/draw/away market odds were not supplied.";
  }

  return [
    "Market comparison:",
    `- Market home probability: ${formatProbability(input.marketComparison.marketProbabilities.home)}`,
    `- Market draw probability: ${formatProbability(input.marketComparison.marketProbabilities.draw)}`,
    `- Market away probability: ${formatProbability(input.marketComparison.marketProbabilities.away)}`,
    `- Home value gap: ${formatSignedProbability(input.marketComparison.valueGap.home)}`,
    `- Draw value gap: ${formatSignedProbability(input.marketComparison.valueGap.draw)}`,
    `- Away value gap: ${formatSignedProbability(input.marketComparison.valueGap.away)}`,
    `- Overround: ${formatSignedProbability(input.marketComparison.overround)}`
  ].join("\n");
}

function formatOverUnderBlock(input: ExplanationInput): string {
  if (input.overUnderProbabilities === undefined) {
    return "Over/under output: not supplied.";
  }

  return [
    "Over/under output:",
    `- Over probability: ${formatProbability(input.overUnderProbabilities.over)}`,
    `- Under probability: ${formatProbability(input.overUnderProbabilities.under)}`
  ].join("\n");
}

function formatTopScores(input: ExplanationInput): string {
  return input.topScores
    .map(
      (score) =>
        `- ${String(score.homeGoals)}-${String(score.awayGoals)}: ${formatProbability(score.probability)}`
    )
    .join("\n");
}

export function buildExplanationPrompt(input: ExplanationInput): string {
  return [
    "You are writing a safe explanation for MatchEdge Desktop.",
    "Use only the supplied local model output. Do not calculate, modify, override, or invent model data.",
    "",
    "Hard constraints:",
    formatConstraintList(input.constraints),
    "",
    "Source model output:",
    `- Match labels: ${input.homeTeamLabel} vs ${input.awayTeamLabel}`,
    `- Expected goals: home ${formatDecimal(input.expectedGoals.home)}, away ${formatDecimal(
      input.expectedGoals.away
    )}, total ${formatDecimal(input.expectedGoals.total)}`,
    `- Model home probability: ${formatProbability(input.winDrawLoseProbabilities.home)}`,
    `- Model draw probability: ${formatProbability(input.winDrawLoseProbabilities.draw)}`,
    `- Model away probability: ${formatProbability(input.winDrawLoseProbabilities.away)}`,
    formatMarketBlock(input),
    formatOverUnderBlock(input),
    "Top score probabilities:",
    formatTopScores(input),
    `Recommendation action: ${input.recommendation.action}`,
    `Recommendation risk level: ${input.recommendation.riskLevel}`,
    `Recommendation reasons: ${input.recommendation.reasons.join(" | ")}`,
    "",
    "Return an explanation with these fields: summary, probabilityExplanation, marketExplanation, riskNotes, counterArguments, dataLimitations, nextChecks.",
    "Every section must stay tied to the supplied source model output."
  ].join("\n");
}
