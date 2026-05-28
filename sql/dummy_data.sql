-- ============================================================
-- VM 2026 – Dummy / Test Data
-- Kjør i Supabase SQL Editor etter schema.sql + seed.sql
-- PIN for alle testbrukere: 1234
-- ============================================================


-- ============================================================
-- 1. TEST-BRUKERE  (PIN: 1234)
-- SHA-256("1234") = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
-- ============================================================
INSERT INTO app_users (username, pin_hash) VALUES
  ('Eirik',  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('Vegard', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('Silje',  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('Magnus', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('Ingrid', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('Tor',    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4')
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- 2. SPILTE KAMPER MED RESULTATER
-- Gruppe A: alle 6 ferdig. Gruppe B/C/D: 2 av 6 ferdig.
-- ============================================================

-- Gruppe A (match_number 1–6)
UPDATE matches SET home_score=2, away_score=0, is_played=TRUE WHERE match_number=1;   -- Mexico 2-0 Sør-Afrika
UPDATE matches SET home_score=1, away_score=1, is_played=TRUE WHERE match_number=2;   -- Sør-Korea 1-1 Tsjekkia
UPDATE matches SET home_score=3, away_score=1, is_played=TRUE WHERE match_number=3;   -- Mexico 3-1 Sør-Korea
UPDATE matches SET home_score=0, away_score=2, is_played=TRUE WHERE match_number=4;   -- Sør-Afrika 0-2 Tsjekkia
UPDATE matches SET home_score=1, away_score=3, is_played=TRUE WHERE match_number=5;   -- Tsjekkia 1-3 Mexico
UPDATE matches SET home_score=1, away_score=0, is_played=TRUE WHERE match_number=6;   -- Sør-Afrika 1-0 Sør-Korea

-- Gruppe B (kamp 1–2)
UPDATE matches SET home_score=2, away_score=1, is_played=TRUE WHERE match_number=7;   -- Canada 2-1 Bosnia
UPDATE matches SET home_score=0, away_score=3, is_played=TRUE WHERE match_number=8;   -- Qatar 0-3 Sveits

-- Gruppe C (kamp 1–2)
UPDATE matches SET home_score=3, away_score=0, is_played=TRUE WHERE match_number=13;  -- Brasil 3-0 Marokko
UPDATE matches SET home_score=0, away_score=1, is_played=TRUE WHERE match_number=14;  -- Haiti 0-1 Skottland

-- Gruppe D (kamp 1–2)
UPDATE matches SET home_score=1, away_score=0, is_played=TRUE WHERE match_number=19;  -- USA 1-0 Paraguay
UPDATE matches SET home_score=2, away_score=2, is_played=TRUE WHERE match_number=20;  -- Australia 2-2 Tyrkia


-- ============================================================
-- 3. TIPSNINGER – SPILTE KAMPER
-- Format: (match_number, brukernavn, hjemme_tip, borte_tip)
-- ============================================================
INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
SELECT u.id, m.id, v.h::int, v.a::int
FROM (VALUES
  -- Kamp 1: Mexico 2-0 Sør-Afrika
  (1, 'Eirik',  2, 0),   -- eksakt 3p
  (1, 'Vegard', 1, 0),   -- riktig 1p
  (1, 'Silje',  2, 1),   -- riktig 1p
  (1, 'Magnus', 0, 2),   -- feil   0p
  (1, 'Ingrid', 2, 0),   -- eksakt 3p
  (1, 'Tor',    1, 1),   -- feil   0p
  -- Kamp 2: Sør-Korea 1-1 Tsjekkia
  (2, 'Eirik',  1, 1),   -- eksakt 3p
  (2, 'Vegard', 2, 1),   -- feil   0p
  (2, 'Silje',  1, 1),   -- eksakt 3p
  (2, 'Magnus', 0, 0),   -- riktig 1p
  (2, 'Ingrid', 1, 2),   -- feil   0p
  (2, 'Tor',    1, 1),   -- eksakt 3p
  -- Kamp 3: Mexico 3-1 Sør-Korea
  (3, 'Eirik',  2, 0),   -- riktig 1p
  (3, 'Vegard', 3, 1),   -- eksakt 3p
  (3, 'Silje',  2, 1),   -- riktig 1p
  (3, 'Magnus', 1, 2),   -- feil   0p
  (3, 'Ingrid', 3, 1),   -- eksakt 3p
  (3, 'Tor',    2, 0),   -- riktig 1p
  -- Kamp 4: Sør-Afrika 0-2 Tsjekkia
  (4, 'Eirik',  0, 2),   -- eksakt 3p
  (4, 'Vegard', 0, 1),   -- riktig 1p
  (4, 'Silje',  1, 2),   -- riktig 1p
  (4, 'Magnus', 0, 2),   -- eksakt 3p
  (4, 'Ingrid', 0, 1),   -- riktig 1p
  (4, 'Tor',    1, 0),   -- feil   0p
  -- Kamp 5: Tsjekkia 1-3 Mexico
  (5, 'Eirik',  0, 3),   -- riktig 1p
  (5, 'Vegard', 1, 3),   -- eksakt 3p
  (5, 'Silje',  0, 2),   -- riktig 1p
  (5, 'Magnus', 1, 2),   -- riktig 1p
  (5, 'Ingrid', 1, 3),   -- eksakt 3p
  (5, 'Tor',    2, 1),   -- feil   0p
  -- Kamp 6: Sør-Afrika 1-0 Sør-Korea
  (6, 'Eirik',  1, 0),   -- eksakt 3p
  (6, 'Vegard', 0, 0),   -- feil   0p
  (6, 'Silje',  2, 0),   -- riktig 1p
  (6, 'Magnus', 1, 1),   -- feil   0p
  (6, 'Ingrid', 1, 0),   -- eksakt 3p
  (6, 'Tor',    0, 1),   -- feil   0p
  -- Kamp 7: Canada 2-1 Bosnia
  (7, 'Eirik',  2, 1),   -- eksakt 3p
  (7, 'Vegard', 1, 0),   -- riktig 1p
  (7, 'Silje',  2, 0),   -- riktig 1p
  (7, 'Magnus', 1, 1),   -- feil   0p
  (7, 'Ingrid', 3, 1),   -- riktig 1p
  (7, 'Tor',    2, 1),   -- eksakt 3p
  -- Kamp 8: Qatar 0-3 Sveits
  (8, 'Eirik',  0, 2),   -- riktig 1p
  (8, 'Vegard', 1, 2),   -- riktig 1p
  (8, 'Silje',  0, 3),   -- eksakt 3p
  (8, 'Magnus', 0, 1),   -- riktig 1p
  (8, 'Ingrid', 0, 2),   -- riktig 1p
  (8, 'Tor',    1, 1),   -- feil   0p
  -- Kamp 13: Brasil 3-0 Marokko
  (13,'Eirik',  3, 0),   -- eksakt 3p
  (13,'Vegard', 2, 0),   -- riktig 1p
  (13,'Silje',  2, 1),   -- riktig 1p
  (13,'Magnus', 1, 0),   -- riktig 1p
  (13,'Ingrid', 3, 0),   -- eksakt 3p
  (13,'Tor',    1, 1),   -- feil   0p
  -- Kamp 14: Haiti 0-1 Skottland
  (14,'Eirik',  0, 1),   -- eksakt 3p
  (14,'Vegard', 0, 0),   -- feil   0p
  (14,'Silje',  0, 2),   -- riktig 1p
  (14,'Magnus', 1, 0),   -- feil   0p
  (14,'Ingrid', 0, 1),   -- eksakt 3p
  (14,'Tor',    0, 1),   -- eksakt 3p
  -- Kamp 19: USA 1-0 Paraguay
  (19,'Eirik',  1, 0),   -- eksakt 3p
  (19,'Vegard', 2, 0),   -- riktig 1p
  (19,'Silje',  1, 1),   -- feil   0p
  (19,'Magnus', 1, 0),   -- eksakt 3p
  (19,'Ingrid', 2, 1),   -- riktig 1p
  (19,'Tor',    0, 1),   -- feil   0p
  -- Kamp 20: Australia 2-2 Tyrkia
  (20,'Eirik',  1, 1),   -- riktig 1p
  (20,'Vegard', 2, 2),   -- eksakt 3p
  (20,'Silje',  1, 1),   -- riktig 1p
  (20,'Magnus', 2, 2),   -- eksakt 3p
  (20,'Ingrid', 0, 0),   -- riktig 1p
  (20,'Tor',    2, 1)    -- feil   0p
) AS v(mn, uname, h, a)
JOIN app_users u ON u.username = v.uname
JOIN matches m ON m.match_number = v.mn::int
ON CONFLICT (user_id, match_id) DO NOTHING;


-- ============================================================
-- 4. TIPSNINGER – KOMMENDE KAMPER (ikke spilt ennå)
-- Viser varierte "Tippet"-tall på tabellen
-- ============================================================
INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
SELECT u.id, m.id, v.h::int, v.a::int
FROM (VALUES
  -- Gruppe B gjenstående (9–12): alle 6 brukere
  (9,  'Eirik',  2, 0), (9,  'Vegard', 1, 0), (9,  'Silje',  1, 0),
  (9,  'Magnus', 2, 1), (9,  'Ingrid', 2, 0), (9,  'Tor',    1, 1),
  (10, 'Eirik',  2, 1), (10, 'Vegard', 2, 0), (10, 'Silje',  1, 0),
  (10, 'Magnus', 1, 1), (10, 'Ingrid', 1, 0), (10, 'Tor',    2, 1),
  (11, 'Eirik',  1, 2), (11, 'Vegard', 1, 1), (11, 'Silje',  0, 1),
  (11, 'Magnus', 1, 1), (11, 'Ingrid', 0, 2), (11, 'Tor',    0, 1),
  (12, 'Eirik',  2, 0), (12, 'Vegard', 1, 0), (12, 'Silje',  2, 1),
  (12, 'Magnus', 2, 0), (12, 'Ingrid', 3, 0), (12, 'Tor',    1, 0),
  -- Gruppe C gjenstående (15–18): Eirik, Vegard, Silje, Ingrid
  (15, 'Eirik',  4, 0), (15, 'Vegard', 3, 0), (15, 'Silje',  3, 1), (15, 'Ingrid', 4, 0),
  (16, 'Eirik',  1, 1), (16, 'Vegard', 0, 1), (16, 'Silje',  0, 1), (16, 'Ingrid', 1, 2),
  (17, 'Eirik',  2, 0), (17, 'Vegard', 2, 0), (17, 'Silje',  3, 0), (17, 'Ingrid', 2, 1),
  (18, 'Eirik',  0, 2), (18, 'Vegard', 0, 3), (18, 'Silje',  0, 2), (18, 'Ingrid', 0, 3),
  -- Gruppe D gjenstående (21–24): Eirik, Vegard, Silje
  (21, 'Eirik',  2, 1), (21, 'Vegard', 1, 0), (21, 'Silje',  2, 0),
  (22, 'Eirik',  2, 0), (22, 'Vegard', 1, 0), (22, 'Silje',  2, 1),
  (23, 'Eirik',  0, 2), (23, 'Vegard', 1, 2), (23, 'Silje',  0, 1),
  (24, 'Eirik',  1, 2), (24, 'Vegard', 0, 1), (24, 'Silje',  0, 2),
  -- Gruppe E–F (25–26, 31–32): Eirik + Ingrid
  (25, 'Eirik',  4, 0), (25, 'Ingrid', 3, 0),
  (26, 'Eirik',  1, 1), (26, 'Ingrid', 2, 1),
  (27, 'Eirik',  3, 0), (27, 'Ingrid', 2, 0),
  (28, 'Eirik',  0, 2), (28, 'Ingrid', 1, 2),
  (31, 'Eirik',  2, 1),
  (32, 'Eirik',  2, 0),
  (33, 'Eirik',  2, 0),
  (34, 'Eirik',  1, 2),
  -- Gruppe I: Frankrike/Norge-kampen – Eirik, Ingrid, Vegard tipper (morsomt)
  (49, 'Eirik',  1, 2), (49, 'Ingrid', 0, 3), (49, 'Vegard', 1, 1),
  (50, 'Eirik',  0, 2), (50, 'Ingrid', 1, 2), (50, 'Vegard', 1, 1),
  (52, 'Eirik',  2, 1), (52, 'Ingrid', 1, 1), (52, 'Vegard', 2, 0)
) AS v(mn, uname, h, a)
JOIN app_users u ON u.username = v.uname
JOIN matches m ON m.match_number = v.mn::int
ON CONFLICT (user_id, match_id) DO NOTHING;


-- ============================================================
-- 5. PRISPREDIKSJONER
-- ============================================================
INSERT INTO award_predictions (user_id, best_player_1, best_player_2, best_player_3,
                               top_scorer_1, top_scorer_2, top_scorer_3)
SELECT u.id, v.bp1, v.bp2, v.bp3, v.ts1, v.ts2, v.ts3
FROM (VALUES
  ('Eirik',  'Kylian Mbappe',   'Vinicius Junior', 'Jude Bellingham',
             'Kylian Mbappe',   'Harry Kane',      'Lamine Yamal'),
  ('Vegard', 'Vinicius Junior', 'Kylian Mbappe',   'Pedri',
             'Vinicius Junior', 'Kylian Mbappe',   'Harry Kane'),
  ('Silje',  'Jude Bellingham', 'Bukayo Saka',     'Kylian Mbappe',
             'Kylian Mbappe',   'Jude Bellingham', 'Vinicius Junior'),
  ('Magnus', 'Kylian Mbappe',   'Pedri',           'Kevin De Bruyne',
             'Harry Kane',      'Kylian Mbappe',   'Lautaro Martinez'),
  ('Ingrid', 'Pedri',           'Jude Bellingham', 'Lamine Yamal',
             'Kylian Mbappe',   'Pedri',           'Vinicius Junior'),
  ('Tor',    'Kevin De Bruyne', 'Kylian Mbappe',   'Vinicius Junior',
             'Kylian Mbappe',   'Harry Kane',      'Vinicius Junior')
) AS v(uname, bp1, bp2, bp3, ts1, ts2, ts3)
JOIN app_users u ON u.username = v.uname
ON CONFLICT (user_id) DO UPDATE SET
  best_player_1 = EXCLUDED.best_player_1,
  best_player_2 = EXCLUDED.best_player_2,
  best_player_3 = EXCLUDED.best_player_3,
  top_scorer_1  = EXCLUDED.top_scorer_1,
  top_scorer_2  = EXCLUDED.top_scorer_2,
  top_scorer_3  = EXCLUDED.top_scorer_3;


-- ============================================================
-- 6. MÅL-DATA (visning i admin-panelet)
-- ============================================================
INSERT INTO match_goalscorers (match_id, player_name, team_id, goal_minute) VALUES
((SELECT id FROM matches WHERE match_number=1), 'Hirving Lozano',    1, 23),
((SELECT id FROM matches WHERE match_number=1), 'Henry Martin',      1, 67),
((SELECT id FROM matches WHERE match_number=2), 'Hwang Hee-chan',    3, 44),
((SELECT id FROM matches WHERE match_number=2), 'Tomas Soucek',      4, 78),
((SELECT id FROM matches WHERE match_number=3), 'Hirving Lozano',    1, 12),
((SELECT id FROM matches WHERE match_number=3), 'Henry Martin',      1, 51),
((SELECT id FROM matches WHERE match_number=3), 'Alexis Vega',       1, 88),
((SELECT id FROM matches WHERE match_number=3), 'Son Heung-min',     3, 34),
((SELECT id FROM matches WHERE match_number=4), 'Tomas Soucek',      4, 30),
((SELECT id FROM matches WHERE match_number=4), 'Patrik Schick',     4, 71),
((SELECT id FROM matches WHERE match_number=5), 'Tomas Soucek',      4, 55),
((SELECT id FROM matches WHERE match_number=5), 'Hirving Lozano',    1, 18),
((SELECT id FROM matches WHERE match_number=5), 'Henry Martin',      1, 62),
((SELECT id FROM matches WHERE match_number=5), 'Alexis Vega',       1, 83),
((SELECT id FROM matches WHERE match_number=6), 'Bongani Zungu',     2, 45),
((SELECT id FROM matches WHERE match_number=7), 'Alphonso Davies',   5, 38),
((SELECT id FROM matches WHERE match_number=7), 'Jonathan David',    5, 72),
((SELECT id FROM matches WHERE match_number=7), 'Edin Dzeko',        6, 59),
((SELECT id FROM matches WHERE match_number=8), 'Granit Xhaka',      8, 14),
((SELECT id FROM matches WHERE match_number=8), 'Xherdan Shaqiri',   8, 49),
((SELECT id FROM matches WHERE match_number=8), 'Breel Embolo',      8, 88),
((SELECT id FROM matches WHERE match_number=13),'Vinicius Junior',   9, 7),
((SELECT id FROM matches WHERE match_number=13),'Rodrygo',           9, 33),
((SELECT id FROM matches WHERE match_number=13),'Richarlison',       9, 79),
((SELECT id FROM matches WHERE match_number=14),'Andrew Robertson',  12,61),
((SELECT id FROM matches WHERE match_number=19),'Christian Pulisic', 13,45),
((SELECT id FROM matches WHERE match_number=20),'Mathew Leckie',     15,28),
((SELECT id FROM matches WHERE match_number=20),'Martin Boyle',      15,67),
((SELECT id FROM matches WHERE match_number=20),'Arda Guler',        16,55),
((SELECT id FROM matches WHERE match_number=20),'Kenan Yildiz',      16,90);
