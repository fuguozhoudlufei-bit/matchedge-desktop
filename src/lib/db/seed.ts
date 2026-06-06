import type {
  LeagueRecord,
  MatchRecord,
  ModelResultRecord,
  OddsRecord,
  TeamRecord
} from "./records";

export interface DevelopmentSeedData {
  leagues: readonly LeagueRecord[];
  teams: readonly TeamRecord[];
  matches: readonly MatchRecord[];
  odds: readonly OddsRecord[];
  model_results: readonly ModelResultRecord[];
}

const sampleCreatedAt = "2026-01-01T00:00:00.000Z";
const sampleKickoffAt = "2026-01-15T12:00:00.000Z";
const sampleRecordedAt = "2026-01-01T12:00:00.000Z";

export const FICTIONAL_SEED_MARKERS = ["sample", "fictional", "example"] as const;

export function createDevelopmentSeedData(): DevelopmentSeedData {
  const leagues: readonly LeagueRecord[] = [
    {
      id: "league-sample-alpha",
      name: "Sample League Alpha",
      country: "Fictional Country",
      created_at: sampleCreatedAt,
      updated_at: sampleCreatedAt
    }
  ];

  const teams: readonly TeamRecord[] = [
    {
      id: "team-example-north",
      name: "Example North FC",
      country: "Fictional Country",
      created_at: sampleCreatedAt,
      updated_at: sampleCreatedAt
    },
    {
      id: "team-example-south",
      name: "Example South FC",
      country: "Fictional Country",
      created_at: sampleCreatedAt,
      updated_at: sampleCreatedAt
    }
  ];

  const matches: readonly MatchRecord[] = [
    {
      id: "match-sample-alpha",
      league_id: leagues[0].id,
      home_team_id: teams[0].id,
      away_team_id: teams[1].id,
      kickoff_at: sampleKickoffAt,
      stage: "Sample Stage",
      neutral_site: 0,
      status: "scheduled",
      created_at: sampleCreatedAt,
      updated_at: sampleCreatedAt
    }
  ];

  const odds: readonly OddsRecord[] = [
    {
      id: "odds-sample-alpha",
      match_id: matches[0].id,
      source: "Sample Odds Source",
      home: 2.4,
      draw: 3.1,
      away: 2.9,
      recorded_at: sampleRecordedAt,
      created_at: sampleCreatedAt
    }
  ];

  const model_results: readonly ModelResultRecord[] = [
    {
      id: "model-result-sample-alpha",
      match_id: matches[0].id,
      model_version: "sample-model-v0",
      input_json: JSON.stringify({
        sample: true,
        fictional: true,
        homeTeamName: teams[0].name,
        awayTeamName: teams[1].name
      }),
      result_json: JSON.stringify({
        sample: true,
        fictional: true,
        probabilities: {
          home: 0.42,
          draw: 0.28,
          away: 0.3
        }
      }),
      created_at: sampleCreatedAt
    }
  ];

  return {
    leagues,
    teams,
    matches,
    odds,
    model_results
  };
}

export function isFictionalSeedText(value: string): boolean {
  const normalized = value.toLowerCase();

  return FICTIONAL_SEED_MARKERS.some((marker) => normalized.includes(marker));
}

export function developmentSeedDataUsesOnlyFictionalSamples(
  seedData: DevelopmentSeedData = createDevelopmentSeedData()
): boolean {
  const leagueTextValues = seedData.leagues.flatMap((league) => [league.name, league.country]);
  const teamTextValues = seedData.teams.flatMap((team) => [team.name, team.country]);
  const matchTextValues = seedData.matches.map((match) => match.stage);
  const oddsTextValues = seedData.odds.map((odds) => odds.source);
  const modelTextValues = seedData.model_results.flatMap((modelResult) => [
    modelResult.model_version,
    modelResult.input_json,
    modelResult.result_json
  ]);

  return [
    ...leagueTextValues,
    ...teamTextValues,
    ...matchTextValues,
    ...oddsTextValues,
    ...modelTextValues
  ].every(isFictionalSeedText);
}

