import {
  analyzeMatch,
  type AnalyzeMatchInput,
  type AnalyzeMatchResult,
  type ThreeWayOdds
} from "../lib/model";

export interface SingleMatchFormState {
  homeTeam: string;
  awayTeam: string;
  homeLambda: string;
  awayLambda: string;
  maxGoals: string;
  marketHomeOdds: string;
  marketDrawOdds: string;
  marketAwayOdds: string;
  overUnderLine: string;
  topScoreLimit: string;
}

export interface SingleMatchAnalysisViewModel {
  homeTeam: string;
  awayTeam: string;
  input?: AnalyzeMatchInput;
  result?: AnalyzeMatchResult;
  validationMessages: string[];
}

interface NumericFieldOptions {
  integer?: boolean;
  min?: number;
  exclusiveMin?: number;
}

export const defaultSingleMatchFormState: SingleMatchFormState = {
  homeTeam: "Home FC",
  awayTeam: "Away FC",
  homeLambda: "1.35",
  awayLambda: "1.05",
  maxGoals: "6",
  marketHomeOdds: "",
  marketDrawOdds: "",
  marketAwayOdds: "",
  overUnderLine: "2.5",
  topScoreLimit: "5"
};

function parseRequiredNumber(
  rawValue: string,
  label: string,
  validationMessages: string[],
  options: NumericFieldOptions = {}
): number | undefined {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    validationMessages.push(`${label} is required.`);
    return undefined;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    validationMessages.push(`${label} must be a valid number.`);
    return undefined;
  }

  if (options.integer === true && !Number.isInteger(parsedValue)) {
    validationMessages.push(`${label} must be a whole number.`);
    return undefined;
  }

  if (options.min !== undefined && parsedValue < options.min) {
    validationMessages.push(`${label} must be at least ${String(options.min)}.`);
    return undefined;
  }

  if (options.exclusiveMin !== undefined && parsedValue <= options.exclusiveMin) {
    validationMessages.push(`${label} must be greater than ${String(options.exclusiveMin)}.`);
    return undefined;
  }

  return parsedValue;
}

function parseOptionalNumber(
  rawValue: string,
  label: string,
  validationMessages: string[],
  options: NumericFieldOptions = {}
): number | undefined {
  if (rawValue.trim().length === 0) {
    return undefined;
  }

  return parseRequiredNumber(rawValue, label, validationMessages, options);
}

function parseMarketOdds(
  formState: SingleMatchFormState,
  validationMessages: string[]
): ThreeWayOdds | undefined {
  const rawOdds = [
    formState.marketHomeOdds,
    formState.marketDrawOdds,
    formState.marketAwayOdds
  ];
  const hasAnyMarketOdds = rawOdds.some((rawOdd) => rawOdd.trim().length > 0);
  const hasAllMarketOdds = rawOdds.every((rawOdd) => rawOdd.trim().length > 0);

  if (!hasAnyMarketOdds) {
    return undefined;
  }

  if (!hasAllMarketOdds) {
    validationMessages.push("Enter all three market odds, or leave all three odds blank.");
    return undefined;
  }

  const home = parseRequiredNumber(formState.marketHomeOdds, "Home market odds", validationMessages, {
    exclusiveMin: 1
  });
  const draw = parseRequiredNumber(formState.marketDrawOdds, "Draw market odds", validationMessages, {
    exclusiveMin: 1
  });
  const away = parseRequiredNumber(formState.marketAwayOdds, "Away market odds", validationMessages, {
    exclusiveMin: 1
  });

  if (home === undefined || draw === undefined || away === undefined) {
    return undefined;
  }

  return { home, draw, away };
}

function describeModelError(error: unknown): string {
  if (error instanceof Error) {
    return `Model validation failed: ${error.message}`;
  }

  return "Model validation failed for the provided inputs.";
}

export function buildSingleMatchAnalysis(
  formState: SingleMatchFormState
): SingleMatchAnalysisViewModel {
  const validationMessages: string[] = [];
  const homeTeam = formState.homeTeam.trim();
  const awayTeam = formState.awayTeam.trim();

  if (homeTeam.length === 0) {
    validationMessages.push("Home team name is required.");
  }

  if (awayTeam.length === 0) {
    validationMessages.push("Away team name is required.");
  }

  const homeLambda = parseRequiredNumber(
    formState.homeLambda,
    "Home expected goals lambda",
    validationMessages,
    { min: 0 }
  );
  const awayLambda = parseRequiredNumber(
    formState.awayLambda,
    "Away expected goals lambda",
    validationMessages,
    { min: 0 }
  );
  const maxGoals = parseRequiredNumber(formState.maxGoals, "maxGoals", validationMessages, {
    integer: true,
    min: 0
  });
  const topScoreLimit = parseRequiredNumber(
    formState.topScoreLimit,
    "Top score limit",
    validationMessages,
    { integer: true, exclusiveMin: 0 }
  );
  const overUnderLine = parseOptionalNumber(
    formState.overUnderLine,
    "Over/under line",
    validationMessages,
    { exclusiveMin: 0 }
  );
  const marketOdds = parseMarketOdds(formState, validationMessages);

  if (
    validationMessages.length > 0 ||
    homeLambda === undefined ||
    awayLambda === undefined ||
    maxGoals === undefined ||
    topScoreLimit === undefined
  ) {
    return {
      homeTeam,
      awayTeam,
      validationMessages
    };
  }

  const input: AnalyzeMatchInput = {
    homeLambda,
    awayLambda,
    maxGoals,
    topScoreLimit,
    ...(marketOdds === undefined ? {} : { marketOdds }),
    ...(overUnderLine === undefined ? {} : { overUnderLine })
  };

  try {
    return {
      homeTeam,
      awayTeam,
      input,
      result: analyzeMatch(input),
      validationMessages
    };
  } catch (error: unknown) {
    return {
      homeTeam,
      awayTeam,
      input,
      validationMessages: [describeModelError(error)]
    };
  }
}
