import { describe, expect, it } from "vitest";

import {
  calculateBrierScore,
  calculatePredictionHit,
  formatReviewSummary,
  getHighestProbabilityOutcome,
  getMatchOutcome,
  InvalidReviewInputError,
  reviewPrediction,
  type MatchOutcome,
  type OutcomeProbabilities
} from "./review";

const probabilities: OutcomeProbabilities = {
  home: 0.6,
  draw: 0.25,
  away: 0.15
};

describe("review utility functions", () => {
  it("determines home win, draw, and away win outcomes from 90-minute goals", () => {
    expect(getMatchOutcome({ homeGoals: 2, awayGoals: 1 })).toBe("home");
    expect(getMatchOutcome({ homeGoals: 1, awayGoals: 1 })).toBe("draw");
    expect(getMatchOutcome({ homeGoals: 0, awayGoals: 1 })).toBe("away");
  });

  it("calculates multiclass Brier score for home, draw, and away probabilities", () => {
    expect(calculateBrierScore(probabilities, "home")).toBeCloseTo(0.245);
    expect(calculateBrierScore(probabilities, "draw")).toBeCloseTo(0.945);
  });

  it("calculates prediction hit and miss correctly", () => {
    expect(calculatePredictionHit("home", "home")).toBe(true);
    expect(calculatePredictionHit("home", "draw")).toBe(false);
  });

  it("uses highest model probability as a deterministic default direction", () => {
    expect(getHighestProbabilityOutcome(probabilities)).toBe("home");
    expect(getHighestProbabilityOutcome({ home: 0.4, draw: 0.4, away: 0.2 })).toBe("home");
  });

  it("formats a short deterministic review summary", () => {
    const summary = formatReviewSummary({
      actualOutcome: "home",
      brierScore: 0.245,
      predictedOutcome: "home",
      predictionHit: true
    });

    expect(summary).toBe(
      "Prediction matched: predicted home win, actual 90-minute outcome was home win. Brier score 0.245."
    );
  });

  it("builds a complete review result without mutating inputs", () => {
    const input = {
      actualScore: { homeGoals: 2, awayGoals: 1 },
      probabilities,
      predictedOutcome: "home" as MatchOutcome
    };

    const result = reviewPrediction(input);

    expect(result.actualOutcome).toBe("home");
    expect(result.predictionHit).toBe(true);
    expect(result.brierScore).toBeCloseTo(0.245);
    expect(result.summary).toContain("Prediction matched");
    expect(result.actualScore).not.toBe(input.actualScore);
    expect(result.probabilities).not.toBe(input.probabilities);
    expect(input).toEqual({
      actualScore: { homeGoals: 2, awayGoals: 1 },
      probabilities,
      predictedOutcome: "home"
    });
  });

  it("throws InvalidReviewInputError for invalid goals", () => {
    for (const homeGoals of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => getMatchOutcome({ homeGoals, awayGoals: 0 })).toThrow(
        InvalidReviewInputError
      );
    }

    for (const awayGoals of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => getMatchOutcome({ homeGoals: 0, awayGoals })).toThrow(
        InvalidReviewInputError
      );
    }
  });

  it("throws InvalidReviewInputError for invalid probabilities", () => {
    expect(() => calculateBrierScore({ home: -0.1, draw: 0.6, away: 0.5 }, "home")).toThrow(
      InvalidReviewInputError
    );
    expect(() =>
      calculateBrierScore({ home: Number.NaN, draw: 0.5, away: 0.5 }, "home")
    ).toThrow(InvalidReviewInputError);
    expect(() => calculateBrierScore({ home: 0.5, draw: 0.4, away: 0.2 }, "home")).toThrow(
      InvalidReviewInputError
    );
  });
});
