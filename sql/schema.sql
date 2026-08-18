-- ============================================================
-- PL-Tipping (tabelltipping) – Databaseskjema
-- Køyr dette i Supabase SQL Editor, deretter sql/seed.sql
--
-- Merk: dette rører IKKJE dei gamle VM-tabellane (teams, matches,
-- app_users, predictions ...). Alt nytt har prefiks pl_.
-- ============================================================

-- ---- Lag ---------------------------------------------------
CREATE TABLE IF NOT EXISTS pl_teams (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(60) NOT NULL,
  short           VARCHAR(4)  NOT NULL,   -- ARS, MUN, ...
  color           VARCHAR(9)  NOT NULL,   -- primærfarge (hex)
  color2          VARCHAR(9),             -- sekundærfarge (hex)
  logo_url        TEXT,                   -- klubbmerke (tomt = fargemerke)
  actual_position INT,                    -- faktisk plassering (admin set)
  sort_order      INT
);

-- ---- Brukarar (eiga innlogging – IKKJE Supabase Auth) ------
CREATE TABLE IF NOT EXISTS pl_users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  pin_hash   VARCHAR(64) NOT NULL,        -- SHA-256 hex av PIN
  locked_at  TIMESTAMPTZ,                 -- sett når spelaren låser tabellen sin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Spådommar: éi rad per lag per spelar -----------------
CREATE TABLE IF NOT EXISTS pl_predictions (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES pl_users(id) ON DELETE CASCADE,
  team_id    INT REFERENCES pl_teams(id) ON DELETE CASCADE,
  position   INT NOT NULL CHECK (position BETWEEN 1 AND 20),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, team_id)
);

CREATE INDEX IF NOT EXISTS pl_predictions_user_idx ON pl_predictions (user_id);

-- ---- Innstillingar (éi rad) -------------------------------
CREATE TABLE IF NOT EXISTS pl_settings (
  id                  INT PRIMARY KEY DEFAULT 1,
  season              VARCHAR(20)  DEFAULT '2026/27',
  deadline            TIMESTAMPTZ,
  reveal_predictions  BOOLEAN DEFAULT FALSE,  -- vis tabellane til andre før fristen
  season_finished     BOOLEAN DEFAULT FALSE,  -- tabellen er endeleg
  table_updated_at    TIMESTAMPTZ
);

INSERT INTO pl_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- Tryggleik: RLS av + tilgang for anon-nøkkelen
-- (privat venneside – anon-nøkkelen er tilgangsporten)
-- ============================================================
ALTER TABLE pl_teams       DISABLE ROW LEVEL SECURITY;
ALTER TABLE pl_users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE pl_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE pl_settings    DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  pl_teams, pl_users, pl_predictions, pl_settings
TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
