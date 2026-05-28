-- ============================================================
-- VM 2026 Tipping – Database Schema
-- Kjør dette i Supabase SQL Editor
-- ============================================================

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  name_no   VARCHAR(100),
  country_code VARCHAR(10) NOT NULL,
  group_letter CHAR(1) NOT NULL
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id                SERIAL PRIMARY KEY,
  match_number      INT,
  home_team_id      INT REFERENCES teams(id),
  away_team_id      INT REFERENCES teams(id),
  stage             VARCHAR(10) NOT NULL DEFAULT 'group',
  -- 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
  group_letter      CHAR(1),
  match_date        TIMESTAMPTZ,
  venue             VARCHAR(200),
  -- For knockout rounds before bracket is set
  home_slot_desc    VARCHAR(120),
  away_slot_desc    VARCHAR(120),
  -- Actual results (null until played)
  home_score        INT,
  away_score        INT,
  went_to_aet       BOOLEAN DEFAULT FALSE,
  home_score_aet    INT,
  away_score_aet    INT,
  went_to_penalties BOOLEAN DEFAULT FALSE,
  home_penalties    INT,
  away_penalties    INT,
  is_played         BOOLEAN DEFAULT FALSE
);

-- App users (custom auth – NOT Supabase Auth)
CREATE TABLE IF NOT EXISTS app_users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  pin_hash   VARCHAR(64) NOT NULL,   -- SHA-256 hex of PIN
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id              SERIAL PRIMARY KEY,
  user_id         INT REFERENCES app_users(id) ON DELETE CASCADE,
  match_id        INT REFERENCES matches(id)    ON DELETE CASCADE,
  home_score_pred INT NOT NULL CHECK (home_score_pred >= 0),
  away_score_pred INT NOT NULL CHECK (away_score_pred >= 0),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Award predictions
CREATE TABLE IF NOT EXISTS award_predictions (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES app_users(id) ON DELETE CASCADE UNIQUE,
  best_player_1 VARCHAR(100),
  best_player_2 VARCHAR(100),
  best_player_3 VARCHAR(100),
  top_scorer_1  VARCHAR(100),
  top_scorer_2  VARCHAR(100),
  top_scorer_3  VARCHAR(100),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Actual award results (admin sets after tournament)
CREATE TABLE IF NOT EXISTS award_results (
  id            INT PRIMARY KEY DEFAULT 1,
  best_player_1 VARCHAR(100),
  best_player_2 VARCHAR(100),
  best_player_3 VARCHAR(100),
  top_scorer_1  VARCHAR(100),
  top_scorer_2  VARCHAR(100),
  top_scorer_3  VARCHAR(100),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO award_results (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Match goalscorers (filled in by admin after each match)
CREATE TABLE IF NOT EXISTS match_goalscorers (
  id          SERIAL PRIMARY KEY,
  match_id    INT REFERENCES matches(id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  team_id     INT REFERENCES teams(id),
  is_own_goal BOOLEAN DEFAULT FALSE,
  goal_minute INT
);

-- ============================================================
-- Security: disable RLS + grant anon access
-- (private friend-group app — anon key is the access gate)
-- ============================================================
ALTER TABLE teams              DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches            DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions        DISABLE ROW LEVEL SECURITY;
ALTER TABLE award_predictions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE award_results      DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_goalscorers  DISABLE ROW LEVEL SECURITY;

-- Allow the anon key (used by the website) to read/write all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  teams, matches, app_users, predictions,
  award_predictions, award_results, match_goalscorers
TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
