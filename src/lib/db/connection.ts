import Database from "@tauri-apps/plugin-sql";

export const MATCHEDGE_DATABASE_URL = "sqlite:matchedge.db" as const;

export type MatchEdgeDatabase = Database;

export function getMatchEdgeDatabase(databaseUrl = MATCHEDGE_DATABASE_URL): MatchEdgeDatabase {
  return Database.get(databaseUrl);
}

export async function loadMatchEdgeDatabase(
  databaseUrl = MATCHEDGE_DATABASE_URL
): Promise<MatchEdgeDatabase> {
  return Database.load(databaseUrl);
}

