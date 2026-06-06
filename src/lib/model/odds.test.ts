import { describe, expect, it } from "vitest";

import {
  calculateOverround,
  calculateValueGap,
  impliedProbability,
  InvalidOddsError,
  normalizeThreeWayMarket,
  type ThreeWayOdds,
  type ThreeWayProbabilities
} from "./odds";

describe("odds model functions", () => {
  it("calculates implied probability from decimal odds", () => {
    expect(impliedProbability(2)).toBe(0.5);
    expect(impliedProbability(4)).toBe(0.25);
  });

  it("normalizes a three-way market so probabilities sum to approximately 1", () => {
    const odds: ThreeWayOdds = { home: 2, draw: 3, away: 4 };

    const normalized = normalizeThreeWayMarket(odds);
    const total = normalized.home + normalized.draw + normalized.away;

    expect(total).toBeCloseTo(1);
    expect(normalized.home).toBeCloseTo(6 / 13);
    expect(normalized.draw).toBeCloseTo(4 / 13);
    expect(normalized.away).toBeCloseTo(3 / 13);
    expect(odds).toEqual({ home: 2, draw: 3, away: 4 });
  });

  it("calculates three-way overround from raw implied probabilities", () => {
    const odds: ThreeWayOdds = { home: 2, draw: 3, away: 4 };

    expect(calculateOverround(odds)).toBeCloseTo(1 / 12);
  });

  it("calculates value gaps as model probability minus market probability", () => {
    const modelProbabilities: ThreeWayProbabilities = {
      home: 0.48,
      draw: 0.28,
      away: 0.24
    };
    const marketProbabilities: ThreeWayProbabilities = {
      home: 0.45,
      draw: 0.3,
      away: 0.25
    };

    const valueGap = calculateValueGap(modelProbabilities, marketProbabilities);

    expect(valueGap.home).toBeCloseTo(0.03);
    expect(valueGap.draw).toBeCloseTo(-0.02);
    expect(valueGap.away).toBeCloseTo(-0.01);
  });

  it("throws InvalidOddsError for decimal odds less than or equal to 1", () => {
    for (const odds of [1, 0, -2]) {
      expect(() => impliedProbability(odds)).toThrow(InvalidOddsError);
    }
  });

  it("throws InvalidOddsError for non-finite decimal odds", () => {
    for (const odds of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => impliedProbability(odds)).toThrow(InvalidOddsError);
    }
  });

  it("validates all odds in three-way market calculations", () => {
    const invalidHome: ThreeWayOdds = { home: 1, draw: 3, away: 4 };
    const invalidDraw: ThreeWayOdds = { home: 2, draw: Number.NaN, away: 4 };
    const invalidAway: ThreeWayOdds = { home: 2, draw: 3, away: Number.POSITIVE_INFINITY };

    expect(() => normalizeThreeWayMarket(invalidHome)).toThrow(InvalidOddsError);
    expect(() => calculateOverround(invalidDraw)).toThrow(InvalidOddsError);
    expect(() => normalizeThreeWayMarket(invalidAway)).toThrow(InvalidOddsError);
  });
});
