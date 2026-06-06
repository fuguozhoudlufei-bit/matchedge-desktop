export interface ThreeWayOdds {
  home: number;
  draw: number;
  away: number;
}

export interface ThreeWayProbabilities {
  home: number;
  draw: number;
  away: number;
}

export interface ValueGap {
  home: number;
  draw: number;
  away: number;
}

export class InvalidOddsError extends Error {
  readonly odds: number;

  constructor(odds: number) {
    super(`Invalid decimal odds: ${String(odds)}`);
    this.name = "InvalidOddsError";
    this.odds = odds;
  }
}

function assertValidDecimalOdds(decimalOdds: number): void {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) {
    throw new InvalidOddsError(decimalOdds);
  }
}

export function impliedProbability(decimalOdds: number): number {
  assertValidDecimalOdds(decimalOdds);

  return 1 / decimalOdds;
}

export function calculateOverround(odds: ThreeWayOdds): number {
  return (
    impliedProbability(odds.home) +
    impliedProbability(odds.draw) +
    impliedProbability(odds.away) -
    1
  );
}

export function normalizeThreeWayMarket(odds: ThreeWayOdds): ThreeWayProbabilities {
  const home = impliedProbability(odds.home);
  const draw = impliedProbability(odds.draw);
  const away = impliedProbability(odds.away);
  const total = home + draw + away;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total
  };
}

export function calculateValueGap(
  modelProbabilities: ThreeWayProbabilities,
  marketProbabilities: ThreeWayProbabilities
): ValueGap {
  return {
    home: modelProbabilities.home - marketProbabilities.home,
    draw: modelProbabilities.draw - marketProbabilities.draw,
    away: modelProbabilities.away - marketProbabilities.away
  };
}
