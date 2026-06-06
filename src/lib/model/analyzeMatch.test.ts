import { describe, expect, it } from "vitest";

import { analyzeMatch, type AnalyzeMatchInput } from "./analyzeMatch";
import { InvalidOddsError, type ThreeWayOdds, type ThreeWayProbabilities } from "./odds";
import { InvalidPoissonInputError } from "./poisson";

function sumThreeWay(probabilities: ThreeWayProbabilities): number {
  return probabilities.home + probabilities.draw + probabilities.away;
}

function oddsFromProbabilities(probabilities: ThreeWayProbabilities): ThreeWayOdds {
  return {
    home: 1 / probabilities.home,
    draw: 1 / probabilities.draw,
    away: 1 / probabilities.away
  };
}

function marketOddsWithHomeGap(
  modelProbabilities: ThreeWayProbabilities,
  homeGap: number
): ThreeWayOdds {
  return oddsFromProbabilities({
    home: modelProbabilities.home - homeGap,
    draw: modelProbabilities.draw,
    away: modelProbabilities.away + homeGap
  });
}

function baseInput(): AnalyzeMatchInput {
  return {
    homeLambda: 1.2,
    awayLambda: 0.9,
    maxGoals: 5
  };
}

describe("analyzeMatch", () => {
  it("aggregates deterministic model output without market odds", () => {
    const result = analyzeMatch(baseInput());

    expect(result.expectedGoals).toEqual({
      home: 1.2,
      away: 0.9,
      total: 2.1
    });
    expect(result.scoreMatrix).toHaveLength(6);
    expect(result.scoreMatrix.every((row) => row.length === 6)).toBe(true);
    expect(sumThreeWay(result.winDrawLoseProbabilities)).toBeCloseTo(1);
    expect(result.topScores).toHaveLength(5);
    expect(result.marketComparison).toBeUndefined();
    expect(result.overUnderProbabilities).toBeUndefined();
    expect(result.recommendation.action).toBe("observe");
    expect(result.recommendation.riskLevel).toBe("high");
    expect(result.recommendation.reasons.some((reason) => reason.includes("missing"))).toBe(true);
  });

  it("includes market comparison and over/under output only when inputs are provided", () => {
    const baseline = analyzeMatch(baseInput());
    const marketOdds = oddsFromProbabilities(baseline.winDrawLoseProbabilities);

    const result = analyzeMatch({
      ...baseInput(),
      marketOdds,
      overUnderLine: 2.5,
      topScoreLimit: 3
    });

    expect(result.topScores).toHaveLength(3);
    expect(result.overUnderProbabilities).toBeDefined();
    expect(
      (result.overUnderProbabilities?.over ?? 0) + (result.overUnderProbabilities?.under ?? 0)
    ).toBeCloseTo(1);
    expect(result.marketComparison).toBeDefined();
    expect(
      sumThreeWay(result.marketComparison?.marketProbabilities ?? baseline.winDrawLoseProbabilities)
    ).toBeCloseTo(1);
    expect(result.marketComparison?.overround).toBeCloseTo(0);
    expect(result.marketComparison?.valueGap.home).toBeCloseTo(0);
    expect(result.marketComparison?.valueGap.draw).toBeCloseTo(0);
    expect(result.marketComparison?.valueGap.away).toBeCloseTo(0);
    expect(result.recommendation.action).toBe("skip");
    expect(result.recommendation.riskLevel).toBe("medium");
  });

  it("returns skip when all absolute value gaps are below 0.03", () => {
    const baseline = analyzeMatch(baseInput());
    const marketOdds = marketOddsWithHomeGap(baseline.winDrawLoseProbabilities, 0.02);

    const result = analyzeMatch({ ...baseInput(), marketOdds });

    expect(result.marketComparison?.valueGap.home).toBeCloseTo(0.02);
    expect(result.marketComparison?.valueGap.away).toBeCloseTo(-0.02);
    expect(result.recommendation.action).toBe("skip");
  });

  it("returns observe when the largest absolute value gap is at least 0.03 and below 0.06", () => {
    const baseline = analyzeMatch(baseInput());
    const marketOdds = marketOddsWithHomeGap(baseline.winDrawLoseProbabilities, 0.04);

    const result = analyzeMatch({ ...baseInput(), marketOdds });

    expect(result.marketComparison?.valueGap.home).toBeCloseTo(0.04);
    expect(result.recommendation.action).toBe("observe");
  });

  it("returns small when the largest absolute value gap is at least 0.06 and below 0.10", () => {
    const baseline = analyzeMatch(baseInput());
    const marketOdds = marketOddsWithHomeGap(baseline.winDrawLoseProbabilities, 0.08);

    const result = analyzeMatch({ ...baseInput(), marketOdds });

    expect(result.marketComparison?.valueGap.home).toBeCloseTo(0.08);
    expect(result.recommendation.action).toBe("small");
  });

  it("can return playable for value gaps at least 0.10, with non-low risk", () => {
    const baseline = analyzeMatch(baseInput());
    const marketOdds = marketOddsWithHomeGap(baseline.winDrawLoseProbabilities, 0.11);

    const result = analyzeMatch({ ...baseInput(), marketOdds });

    expect(result.marketComparison?.valueGap.home).toBeCloseTo(0.11);
    expect(result.recommendation.action).toBe("playable");
    expect(result.recommendation.riskLevel).not.toBe("low");
  });

  it("keeps risk high when maxGoals is below 5 even with market odds", () => {
    const shallowInput: AnalyzeMatchInput = {
      homeLambda: 1.2,
      awayLambda: 0.9,
      maxGoals: 4
    };
    const baseline = analyzeMatch(shallowInput);
    const marketOdds = oddsFromProbabilities(baseline.winDrawLoseProbabilities);

    const result = analyzeMatch({ ...shallowInput, marketOdds });

    expect(result.recommendation.action).toBe("skip");
    expect(result.recommendation.riskLevel).toBe("high");
    expect(result.recommendation.reasons.some((reason) => reason.includes("maxGoals"))).toBe(true);
  });

  it("limits top scores to available scores and remains deterministic", () => {
    const input: AnalyzeMatchInput = {
      homeLambda: 0,
      awayLambda: 0,
      maxGoals: 0,
      topScoreLimit: 5
    };

    const firstResult = analyzeMatch(input);
    const secondResult = analyzeMatch(input);

    expect(firstResult.topScores).toHaveLength(1);
    expect(firstResult.topScores[0]).toEqual({ homeGoals: 0, awayGoals: 0, probability: 1 });
    expect(secondResult).toEqual(firstResult);
    expect(input).toEqual({
      homeLambda: 0,
      awayLambda: 0,
      maxGoals: 0,
      topScoreLimit: 5
    });
  });

  it("uses existing validation from odds and Poisson functions", () => {
    expect(() => analyzeMatch({ ...baseInput(), marketOdds: { home: 1, draw: 3, away: 4 } }))
      .toThrow(InvalidOddsError);
    expect(() => analyzeMatch({ ...baseInput(), topScoreLimit: 0 })).toThrow(
      InvalidPoissonInputError
    );
    expect(() => analyzeMatch({ ...baseInput(), overUnderLine: 0 })).toThrow(
      InvalidPoissonInputError
    );
  });
});
