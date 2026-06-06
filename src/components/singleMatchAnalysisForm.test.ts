import { describe, expect, it } from "vitest";

import {
  buildSingleMatchAnalysis,
  defaultSingleMatchFormState,
  type SingleMatchFormState
} from "./singleMatchAnalysisForm";

function formWith(overrides: Partial<SingleMatchFormState>): SingleMatchFormState {
  return {
    ...defaultSingleMatchFormState,
    ...overrides
  };
}

describe("single-match analysis form parsing", () => {
  it("builds deterministic analysis input and result from valid form state", () => {
    const analysis = buildSingleMatchAnalysis(
      formWith({
        marketHomeOdds: "2.20",
        marketDrawOdds: "3.40",
        marketAwayOdds: "3.30"
      })
    );

    expect(analysis.validationMessages).toEqual([]);
    expect(analysis.input).toMatchObject({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6,
      topScoreLimit: 5,
      overUnderLine: 2.5,
      marketOdds: {
        home: 2.2,
        draw: 3.4,
        away: 3.3
      }
    });
    expect(analysis.result?.marketComparison).toBeDefined();
    expect(analysis.result?.overUnderProbabilities).toBeDefined();
  });

  it("returns validation messages instead of calling the model with invalid input", () => {
    const analysis = buildSingleMatchAnalysis(
      formWith({
        homeLambda: "-1",
        maxGoals: "4.5",
        marketHomeOdds: "2.10",
        marketDrawOdds: "",
        marketAwayOdds: "3.80"
      })
    );

    expect(analysis.result).toBeUndefined();
    expect(analysis.validationMessages).toContain(
      "Home expected goals lambda must be at least 0."
    );
    expect(analysis.validationMessages).toContain("maxGoals must be a whole number.");
    expect(analysis.validationMessages).toContain(
      "Enter all three market odds, or leave all three odds blank."
    );
  });
});
