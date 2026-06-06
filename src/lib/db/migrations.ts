export const DATABASE_TABLE_NAMES = [
  "leagues",
  "teams",
  "matches",
  "odds",
  "model_results"
] as const;

export type DatabaseTableName = (typeof DATABASE_TABLE_NAMES)[number];

export interface DatabaseMigration {
  version: number;
  name: string;
  sql: string;
}

export interface DatabaseIndexDefinition {
  name: string;
  tableName: DatabaseTableName;
  columns: readonly string[];
  sql: string;
}

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`,
  `CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`,
  `CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  kickoff_at TEXT NOT NULL,
  stage TEXT NOT NULL,
  neutral_site INTEGER NOT NULL CHECK (neutral_site IN (0, 1)),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'postponed', 'in_progress', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE RESTRICT,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  CHECK (home_team_id <> away_team_id)
);`,
  `CREATE TABLE IF NOT EXISTS odds (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  source TEXT NOT NULL,
  home REAL NOT NULL CHECK (home > 1),
  draw REAL NOT NULL CHECK (draw > 1),
  away REAL NOT NULL CHECK (away > 1),
  recorded_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);`,
  `CREATE TABLE IF NOT EXISTS model_results (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  model_version TEXT NOT NULL,
  input_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);`
] as const;

export const DATABASE_INDEXES: readonly DatabaseIndexDefinition[] = [
  {
    name: "idx_matches_kickoff_at",
    tableName: "matches",
    columns: ["kickoff_at"],
    sql: "CREATE INDEX IF NOT EXISTS idx_matches_kickoff_at ON matches(kickoff_at);"
  },
  {
    name: "idx_matches_league_id",
    tableName: "matches",
    columns: ["league_id"],
    sql: "CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);"
  },
  {
    name: "idx_matches_home_team_id",
    tableName: "matches",
    columns: ["home_team_id"],
    sql: "CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches(home_team_id);"
  },
  {
    name: "idx_matches_away_team_id",
    tableName: "matches",
    columns: ["away_team_id"],
    sql: "CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches(away_team_id);"
  },
  {
    name: "idx_odds_match_id",
    tableName: "odds",
    columns: ["match_id"],
    sql: "CREATE INDEX IF NOT EXISTS idx_odds_match_id ON odds(match_id);"
  },
  {
    name: "idx_odds_source",
    tableName: "odds",
    columns: ["source"],
    sql: "CREATE INDEX IF NOT EXISTS idx_odds_source ON odds(source);"
  },
  {
    name: "idx_odds_recorded_at",
    tableName: "odds",
    columns: ["recorded_at"],
    sql: "CREATE INDEX IF NOT EXISTS idx_odds_recorded_at ON odds(recorded_at);"
  },
  {
    name: "idx_model_results_match_id",
    tableName: "model_results",
    columns: ["match_id"],
    sql: "CREATE INDEX IF NOT EXISTS idx_model_results_match_id ON model_results(match_id);"
  },
  {
    name: "idx_model_results_model_version",
    tableName: "model_results",
    columns: ["model_version"],
    sql: "CREATE INDEX IF NOT EXISTS idx_model_results_model_version ON model_results(model_version);"
  }
] as const;

export const INITIAL_SCHEMA_MIGRATION: DatabaseMigration = {
  version: 1,
  name: "create_initial_sqlite_schema",
  sql: [...createTableStatements, ...DATABASE_INDEXES.map((index) => index.sql)].join("\n\n")
};

export const DATABASE_MIGRATIONS: readonly DatabaseMigration[] = [INITIAL_SCHEMA_MIGRATION] as const;

export function getMigrationSql(migrations: readonly DatabaseMigration[] = DATABASE_MIGRATIONS): string {
  return migrations.map((migration) => migration.sql).join("\n\n");
}

export function getMigrationStatements(
  migrations: readonly DatabaseMigration[] = DATABASE_MIGRATIONS
): readonly string[] {
  return migrations.map((migration) => migration.sql);
}

