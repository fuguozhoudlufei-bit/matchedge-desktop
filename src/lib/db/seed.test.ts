import { describe, expect, it } from "vitest";

import {
  createDevelopmentSeedData,
  developmentSeedDataUsesOnlyFictionalSamples,
  isFictionalSeedText
} from "./seed";

describe("development seed helpers", () => {
  it("uses only fictional or sample text values", () => {
    expect(developmentSeedDataUsesOnlyFictionalSamples()).toBe(true);
  });

  it("includes sample records for each database table", () => {
    const seedData = createDevelopmentSeedData();

    expect(seedData.leagues).toHaveLength(1);
    expect(seedData.teams).toHaveLength(2);
    expect(seedData.matches).toHaveLength(1);
    expect(seedData.odds).toHaveLength(1);
    expect(seedData.model_results).toHaveLength(1);
  });

  it("does not include real football data markers in sample display fields", () => {
    const seedData = createDevelopmentSeedData();
    const displayFields = [
      ...seedData.leagues.flatMap((league) => [league.name, league.country]),
      ...seedData.teams.flatMap((team) => [team.name, team.country]),
      ...seedData.matches.map((match) => match.stage),
      ...seedData.odds.map((odds) => odds.source),
      ...seedData.model_results.flatMap((modelResult) => [
        modelResult.model_version,
        modelResult.input_json,
        modelResult.result_json
      ])
    ];

    for (const field of displayFields) {
      expect(isFictionalSeedText(field)).toBe(true);
    }
  });
});

