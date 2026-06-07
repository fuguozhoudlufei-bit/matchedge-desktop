import type {
  AnalyzeMatchResult,
  ExpectedGoals,
  MarketComparison,
  MatchRecommendation,
  OverUnderProbabilities,
  ScoreProbability,
  WinDrawLoseProbabilities
} from "../model";

export type ExplanationConstraintId =
  | "preserve-model-probabilities"
  | "no-invented-odds"
  | "no-invented-team-news"
  | "no-invented-injuries"
  | "no-certainty-claims"
  | "no-profit-promises"
  | "separate-model-and-market"
  | "not-automatic-betting";

export type ExplanationRiskLevel = "info" | "caution";

export interface ExplanationConstraint {
  id: ExplanationConstraintId;
  title: string;
  description: string;
}

export interface ExplanationSection {
  title: string;
  items: string[];
}

export interface ExplanationRiskNote {
  level: ExplanationRiskLevel;
  message: string;
}

export interface ExplanationOptionalContext {
  homeTeamLabel?: string;
  awayTeamLabel?: string;
}

export interface ExplanationInput {
  source: "analyzeMatch";
  homeTeamLabel: string;
  awayTeamLabel: string;
  expectedGoals: ExpectedGoals;
  winDrawLoseProbabilities: WinDrawLoseProbabilities;
  topScores: ScoreProbability[];
  overUnderProbabilities?: OverUnderProbabilities;
  marketComparison?: MarketComparison;
  recommendation: MatchRecommendation;
  constraints: ExplanationConstraint[];
}

export interface ExplanationOutput {
  source: "local-deterministic-draft";
  usesExternalApi: false;
  sourceModelProbabilities: WinDrawLoseProbabilities;
  sourceMarketProbabilities?: MarketComparison["marketProbabilities"];
  summary: ExplanationSection;
  probabilityExplanation: ExplanationSection;
  marketExplanation: ExplanationSection;
  riskNotes: ExplanationRiskNote[];
  counterArguments: ExplanationSection;
  dataLimitations: ExplanationSection;
  nextChecks: ExplanationSection;
  constraints: ExplanationConstraint[];
}

export type ExplanationAnalysisResult = Pick<
  AnalyzeMatchResult,
  | "expectedGoals"
  | "winDrawLoseProbabilities"
  | "topScores"
  | "overUnderProbabilities"
  | "marketComparison"
  | "recommendation"
>;
