export type SqliteBoolean = 0 | 1;
export type ISODateTimeString = string;

export type MatchStatus =
  | "scheduled"
  | "postponed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface LeagueRecord {
  id: string;
  name: string;
  country: string;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface TeamRecord {
  id: string;
  name: string;
  country: string;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface MatchRecord {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_at: ISODateTimeString;
  stage: string;
  neutral_site: SqliteBoolean;
  status: MatchStatus;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface OddsRecord {
  id: string;
  match_id: string;
  source: string;
  home: number;
  draw: number;
  away: number;
  recorded_at: ISODateTimeString;
  created_at: ISODateTimeString;
}

export interface ModelResultRecord {
  id: string;
  match_id: string;
  model_version: string;
  input_json: string;
  result_json: string;
  created_at: ISODateTimeString;
}

