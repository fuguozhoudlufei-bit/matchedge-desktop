import { describe, expect, it } from "vitest";

import { DATABASE_INDEXES, getMigrationSql } from "./migrations";

function extractCreateTableSql(schemaSql: string, tableName: string): string {
  const tableStart = schemaSql.indexOf(`CREATE TABLE IF NOT EXISTS ${tableName}`);

  if (tableStart === -1) {
    return "";
  }

  const tableEnd = schemaSql.indexOf(");", tableStart);

  if (tableEnd === -1) {
    return "";
  }

  return schemaSql.slice(tableStart, tableEnd + 2);
}

describe("SQLite schema migrations", () => {
  const migrationSql = getMigrationSql();

  it("includes all expected table names", () => {
    for (const tableName of ["leagues", "teams", "matches", "odds", "model_results"]) {
      expect(migrationSql).toContain(`CREATE TABLE IF NOT EXISTS ${tableName}`);
    }
  });

  it("includes all expected index definitions", () => {
    const expectedIndexes = [
      "idx_matches_kickoff_at",
      "idx_matches_league_id",
      "idx_matches_home_team_id",
      "idx_matches_away_team_id",
      "idx_odds_match_id",
      "idx_odds_source",
      "idx_odds_recorded_at",
      "idx_model_results_match_id",
      "idx_model_results_model_version"
    ];

    for (const indexName of expectedIndexes) {
      expect(migrationSql).toContain(`CREATE INDEX IF NOT EXISTS ${indexName}`);
    }

    for (const index of DATABASE_INDEXES) {
      expect(migrationSql).toContain(
        `ON ${index.tableName}(${index.columns.join(", ")})`
      );
    }
  });

  it("includes required league columns", () => {
    const tableSql = extractCreateTableSql(migrationSql, "leagues");

    for (const columnName of ["id", "name", "country", "created_at", "updated_at"]) {
      expect(tableSql).toMatch(new RegExp(`\\b${columnName}\\b`));
    }
  });

  it("includes required team columns", () => {
    const tableSql = extractCreateTableSql(migrationSql, "teams");

    for (const columnName of ["id", "name", "country", "created_at", "updated_at"]) {
      expect(tableSql).toMatch(new RegExp(`\\b${columnName}\\b`));
    }
  });

  it("includes required match columns", () => {
    const tableSql = extractCreateTableSql(migrationSql, "matches");

    for (const columnName of [
      "id",
      "league_id",
      "home_team_id",
      "away_team_id",
      "kickoff_at",
      "stage",
      "neutral_site",
      "status",
      "created_at",
      "updated_at"
    ]) {
      expect(tableSql).toMatch(new RegExp(`\\b${columnName}\\b`));
    }
  });

  it("includes required odds columns", () => {
    const tableSql = extractCreateTableSql(migrationSql, "odds");

    for (const columnName of [
      "id",
      "match_id",
      "source",
      "home",
      "draw",
      "away",
      "recorded_at",
      "created_at"
    ]) {
      expect(tableSql).toMatch(new RegExp(`\\b${columnName}\\b`));
    }
  });

  it("includes required model result columns", () => {
    const tableSql = extractCreateTableSql(migrationSql, "model_results");

    for (const columnName of [
      "id",
      "match_id",
      "model_version",
      "input_json",
      "result_json",
      "created_at"
    ]) {
      expect(tableSql).toMatch(new RegExp(`\\b${columnName}\\b`));
    }
  });
});

