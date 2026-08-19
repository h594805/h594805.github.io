-- ============================================================
-- PL-Tipping – Bonusspørsmål (prisar + ville tips)
-- Køyr denne i Supabase SQL Editor FØR du pusher ny kode.
--
-- Legg til tre nye tabellar. Rører ikkje pl_teams eller
-- pl_predictions. Einaste endringa på eksisterande data er at
-- locked_at blir nullstilt (lås-inn-knappen er fjerna).
-- ============================================================

-- ---- Spørsmåla ---------------------------------------------
CREATE TABLE IF NOT EXISTS pl_bonus (
  key         VARCHAR(30) PRIMARY KEY,
  label       VARCHAR(100) NOT NULL,
  hint        TEXT,
  points      INT NOT NULL DEFAULT 2,      -- poengtrekk ved rett svar
  kind        VARCHAR(10) NOT NULL DEFAULT 'player',  -- 'player' | 'team'
  category    VARCHAR(10) NOT NULL DEFAULT 'vill',    -- 'pris' | 'vill'
  sort_order  INT,
  active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---- Svara til spelarane: éi rad per spelar per spørsmål ----
CREATE TABLE IF NOT EXISTS pl_bonus_picks (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES pl_users(id) ON DELETE CASCADE,
  q_key       VARCHAR(30) REFERENCES pl_bonus(key) ON DELETE CASCADE,
  answer      TEXT NOT NULL,              -- slik spelaren skreiv det
  answer_norm TEXT NOT NULL,              -- normalisert, brukt til gruppering
  team_id     INT REFERENCES pl_teams(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, q_key)
);

CREATE INDEX IF NOT EXISTS pl_bonus_picks_user_idx ON pl_bonus_picks (user_id);
CREATE INDEX IF NOT EXISTS pl_bonus_picks_q_idx    ON pl_bonus_picks (q_key);

-- ---- Fasit: kva svar tel som rette ------------------------
-- Fleire rader per spørsmål, så «Haaland» og «Erling Haaland»
-- kan begge godkjennast. Admin kryssar av i panelet.
CREATE TABLE IF NOT EXISTS pl_bonus_correct (
  id          SERIAL PRIMARY KEY,
  q_key       VARCHAR(30) REFERENCES pl_bonus(key) ON DELETE CASCADE,
  answer_norm TEXT NOT NULL,
  label       TEXT,                       -- lesbar versjon, til visning
  UNIQUE (q_key, answer_norm)
);

-- ============================================================
-- Spørsmåla
-- points: 2 = lett/vill, 3 = vanskeleg men mogleg å rekne ut
-- ============================================================
INSERT INTO pl_bonus (key, label, hint, points, kind, category, sort_order) VALUES
  ('toppskaarar',   'Gullstøvelen',                 'Flest mål i Premier League',            2, 'player', 'pris',  1),
  ('aarets_spelar', 'Årets spelar',                 'Premier League Player of the Season',   2, 'player', 'pris',  2),
  ('maalgjevande',  'Flest målgjevande',            'Playmaker-prisen',                      3, 'player', 'pris',  3),
  ('gullhansken',   'Gullhansken',                  'Keeperen med flest nullar',             3, 'player', 'pris',  4),
  ('ung_spelar',    'Årets unge spelar',            'Young Player of the Season (U23)',      3, 'player', 'pris',  5),

  ('frisparkmaal',  'Flest frisparkmål',            'Direkte frisparkmål',                   2, 'player', 'vill',  6),
  ('straffemaal',   'Flest straffemål',             'Scora straffer i ligaen',               2, 'player', 'vill',  7),
  ('hattrick',      'Første hattrick',              'Første spelar med hattrick i sesongen',  2, 'player', 'vill',  8),
  ('opprykk_topp',  'Toppskårar blant opprykkslaga','Beste målskårar frå Coventry, Hull eller Ipswich', 2, 'player', 'vill', 9),
  ('sparka',        'Første manager sparka',        'Namnet på manageren',                   2, 'player', 'vill', 10),

  ('raude_kort',    'Lag med flest raude kort',     NULL,                                    2, 'team',   'vill', 11),
  ('gule_kort',     'Lag med flest gule kort',      NULL,                                    2, 'team',   'vill', 12),
  ('nullar',        'Lag med flest nullar',         'Flest kampar utan å sleppe inn mål',    2, 'team',   'vill', 13),
  ('sjolvmaal',     'Lag med flest sjølvmål',       NULL,                                    2, 'team',   'vill', 14),
  ('uavgjort',      'Lag med flest uavgjorte',      NULL,                                    2, 'team',   'vill', 15)
ON CONFLICT (key) DO UPDATE SET
  label      = EXCLUDED.label,
  hint       = EXCLUDED.hint,
  points     = EXCLUDED.points,
  kind       = EXCLUDED.kind,
  category   = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- Lås-inn er fjerna – alt blir autolagra fram til fristen.
-- Nullstiller dei som allereie hadde låst.
-- ============================================================
UPDATE pl_users SET locked_at = NULL WHERE locked_at IS NOT NULL;

-- ============================================================
-- Tryggleik: same modell som resten av appen
-- ============================================================
ALTER TABLE pl_bonus         DISABLE ROW LEVEL SECURITY;
ALTER TABLE pl_bonus_picks   DISABLE ROW LEVEL SECURITY;
ALTER TABLE pl_bonus_correct DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  pl_bonus, pl_bonus_picks, pl_bonus_correct
TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
