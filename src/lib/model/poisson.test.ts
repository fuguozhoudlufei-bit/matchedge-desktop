import { describe, expect, it } from "vitest";

import {
  aggregateWinDrawLose,
  factorial,
  generateScoreMatrix,
  InvalidPoissonInputError,
  mostLikelyScores,
  overUnderProbabilities,
  poissonProbability,
  type ScoreMatrixInput,
  type ScoreProbability
} from "./poisson";

function sumScoreMatrix(scoreMatrix: ScoreProbability[][]): number {
  return scoreMatrix.reduce(
    (matrixTotal, row) =>
      matrixTotal + row.reduce((rowTotal, score) => rowTotal + score.probability, 0),
    0
  );
}

describe("Poisson score matrix model functions", () => {
  it("calculates factorial values", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
  });

  it("throws InvalidPoissonInputError for invalid factorial inputs", () => {
    for (const value of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => factorial(value)).toThrow(InvalidPoissonInputError);
    }
  });

  it("calculates Poisson probabilities", () => {
    expect(poissonProbability(0, 0)).toBe(1);
    expect(poissonProbability(0, 1)).toBe(0);
    expect(poissonProbability(2, 3)).toBeCloseTo((Math.exp(-2) * 8) / 6);
  });

  it("throws InvalidPoissonInputError for invalid lambdas and goals", () => {
    for (const lambda of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => poissonProbability(lambda, 0)).toThrow(InvalidPoissonInputError);
    }

    for (const goals of [-1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => poissonProbability(1, goals)).toThrow(InvalidPoissonInputError);
    }
  });

  it("generates a normalized score matrix for the requested goal range", () => {
    const input: ScoreMatrixInput = { homeLambda: 1.2, awayLambda: 0.9, maxGoals: 5 };

    const scoreMatrix = generateScoreMatrix(input);

    expect(scoreMatrix).toHaveLength(6);
    expect(scoreMatrix.every((row) => row.length === 6)).toBe(true);
    expect(scoreMatrix[0]?.[0]).toMatchObject({ homeGoals: 0, awayGoals: 0 });
    expect(scoreMatrix[5]?.[5]).toMatchObject({ homeGoals: 5, awayGoals: 5 });
    expect(sumScoreMatrix(scoreMatrix)).toBeCloseTo(1);
    expect(input).toEqual({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 5 });
  });

  it("normalizes the truncated 0..maxGoals matrix", () => {
    const scoreMatrix = generateScoreMatrix({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 0 });

    expect(scoreMatrix).toEqual([[{ homeGoals: 0, awayGoals: 0, probability: 1 }]]);
  });

  it("throws InvalidPoissonInputError for invalid score matrix inputs", () => {
    expect(() =>
      generateScoreMatrix({ homeLambda: -1, awayLambda: 0.9, maxGoals: 5 })
    ).toThrow(InvalidPoissonInputError);
    expect(() =>
      generateScoreMatrix({ homeLambda: 1.2, awayLambda: Number.NaN, maxGoals: 5 })
    ).toThrow(InvalidPoissonInputError);
    expect(() =>
      generateScoreMatrix({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 2.5 })
    ).toThrow(InvalidPoissonInputError);
  });

  it("aggregates score probabilities into home, draw, and away probabilities", () => {
    const scoreMatrix: ScoreProbability[][] = [
      [
        { homeGoals: 0, awayGoals: 0, probability: 0.1 },
        { homeGoals: 0, awayGoals: 1, probability: 0.2 }
      ],
      [
        { homeGoals: 1, awayGoals: 0, probability: 0.3 },
        { homeGoals: 1, awayGoals: 1, probability: 0.4 }
      ]
    ];

    const result = aggregateWinDrawLose(scoreMatrix);

    expect(result.home).toBeCloseTo(0.3);
    expect(result.draw).toBeCloseTo(0.5);
    expect(result.away).toBeCloseTo(0.2);
    expect(result.home + result.draw + result.away).toBeCloseTo(1);
  });

  it("sorts most likely scores by probability descending", () => {
    const scoreMatrix: ScoreProbability[][] = [
      [
        { homeGoals: 0, awayGoals: 0, probability: 0.25 },
        { homeGoals: 0, awayGoals: 1, probability: 0.2 }
      ],
      [
        { homeGoals: 1, awayGoals: 0, probability: 0.3 },
        { homeGoals: 1, awayGoals: 1, probability: 0.25 }
      ]
    ];

    const result = mostLikelyScores(scoreMatrix, 3);

    expect(result).toEqual([
      { homeGoals: 1, awayGoals: 0, probability: 0.3 },
      { homeGoals: 0, awayGoals: 0, probability: 0.25 },
      { homeGoals: 1, awayGoals: 1, probability: 0.25 }
    ]);
  });

  it("throws InvalidPoissonInputError for invalid most likely score limits", () => {
    const scoreMatrix = generateScoreMatrix({ homeLambda: 1, awayLambda: 1, maxGoals: 1 });

    for (const limit of [0, -1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => mostLikelyScores(scoreMatrix, limit)).toThrow(InvalidPoissonInputError);
    }
  });

  it("aggregates over and under probabilities for a line", () => {
    const scoreMatrix = generateScoreMatrix({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 5 });

    const result = overUnderProbabilities(scoreMatrix, 2.5);

    expect(result.over).toBeGreaterThan(0);
    expect(result.under).toBeGreaterThan(0);
    expect(result.over + result.under).toBeCloseTo(1);
  });

  it("treats totals equal to an integer line as under", () => {
    const scoreMatrix: ScoreProbability[][] = [
      [{ homeGoals: 1, awayGoals: 1, probability: 0.4 }],
      [{ homeGoals: 2, awayGoals: 1, probability: 0.6 }]
    ];

    const result = overUnderProbabilities(scoreMatrix, 2);

    expect(result).toEqual({ over: 0.6, under: 0.4 });
  });

  it("throws InvalidPoissonInputError for invalid over and under lines", () => {
    const scoreMatrix = generateScoreMatrix({ homeLambda: 1, awayLambda: 1, maxGoals: 1 });

    for (const line of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => overUnderProbabilities(scoreMatrix, line)).toThrow(InvalidPoissonInputError);
    }
  });

  it("returns deterministic results without mutating the score matrix", () => {
    const scoreMatrix = generateScoreMatrix({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 2 });
    const snapshot = structuredClone(scoreMatrix);

    expect(generateScoreMatrix({ homeLambda: 1.2, awayLambda: 0.9, maxGoals: 2 })).toEqual(
      scoreMatrix
    );
    expect(mostLikelyScores(scoreMatrix, 2)).toEqual(mostLikelyScores(scoreMatrix, 2));
    expect(scoreMatrix).toEqual(snapshot);
  });
});
