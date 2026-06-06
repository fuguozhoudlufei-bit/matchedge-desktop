import { describe, expect, it } from "vitest";

import {
  buildSingleMatchReview,
  defaultSingleMatchReviewFormState,
  type SingleMatchReviewFormState
} from "./singleMatchReviewForm";

const probabilities = {
  home: 0.6,
  draw: 0.25,
  away: 0.15
};

function formWith(overrides: Partial<SingleMatchReviewFormState>): SingleMatchReviewFormState {
  return {
    ...defaultSingleMatchReviewFormState,
    ...overrides
  };
}

describe("single-match review form parsing", () => {
  it("waits for actual score input while exposing the model-top prediction direction", () => {
    const review = buildSingleMatchReview(defaultSingleMatchReviewFormState, probabilities);

    expect(review.modelTopOutcome).toBe("home");
    expect(review.predictedOutcome).toBe("home");
    expect(review.result).toBeUndefined();
    expect(review.validationMessages).toEqual([]);
  });

  it("builds a deterministic review result from valid score input", () => {
    const review = buildSingleMatchReview(
      formWith({
        homeGoals: "2",
        awayGoals: "1"
      }),
      probabilities
    );

    expect(review.validationMessages).toEqual([]);
    expect(review.result?.actualOutcome).toBe("home");
    expect(review.result?.predictionHit).toBe(true);
    expect(review.result?.brierScore).toBeCloseTo(0.245);
  });

  it("returns validation messages for invalid review score input", () => {
    const review = buildSingleMatchReview(
      formWith({
        homeGoals: "-1",
        awayGoals: "1.5"
      }),
      probabilities
    );

    expect(review.result).toBeUndefined();
    expect(review.validationMessages).toContain(
      "Actual home goals must be a whole number greater than or equal to 0."
    );
    expect(review.validationMessages).toContain(
      "Actual away goals must be a whole number greater than or equal to 0."
    );
  });
});
