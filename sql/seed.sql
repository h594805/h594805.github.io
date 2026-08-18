-- ============================================================
-- PL-Tipping – Lag, sesongen 2026/27
-- Køyr etter sql/schema.sql
--
-- logo_url peikar på klubbmerka. Manglar eitt merke, kan du lime
-- inn ei ny bilet-URL under «Lag» i admin-panelet – elles fell
-- appen tilbake på eit fargemerke med lagkoden.
-- ============================================================

INSERT INTO pl_teams (id, name, short, color, color2, logo_url, sort_order) VALUES
  ( 1, 'Arsenal',                'ARS', '#EF0107', '#FFFFFF', 'https://media.api-sports.io/football/teams/42.png',   1),
  ( 2, 'Aston Villa',            'AVL', '#670E36', '#95BFE5', 'https://media.api-sports.io/football/teams/66.png',   2),
  ( 3, 'Bournemouth',            'BOU', '#DA291C', '#000000', 'https://media.api-sports.io/football/teams/35.png',   3),
  ( 4, 'Brentford',              'BRE', '#E30613', '#FFFFFF', 'https://media.api-sports.io/football/teams/55.png',   4),
  ( 5, 'Brighton & Hove Albion', 'BHA', '#0057B8', '#FFFFFF', 'https://media.api-sports.io/football/teams/51.png',   5),
  ( 6, 'Chelsea',                'CHE', '#034694', '#FFFFFF', 'https://media.api-sports.io/football/teams/49.png',   6),
  ( 7, 'Coventry City',          'COV', '#5BC2E7', '#003049', 'https://media.api-sports.io/football/teams/1350.png', 7),
  ( 8, 'Crystal Palace',         'CRY', '#1B458F', '#C4122E', 'https://media.api-sports.io/football/teams/52.png',   8),
  ( 9, 'Everton',                'EVE', '#003399', '#FFFFFF', 'https://media.api-sports.io/football/teams/45.png',   9),
  (10, 'Fulham',                 'FUL', '#1B1B1B', '#CC0000', 'https://media.api-sports.io/football/teams/36.png',  10),
  (11, 'Hull City',              'HUL', '#F18A00', '#000000', 'https://media.api-sports.io/football/teams/64.png',  11),
  (12, 'Ipswich Town',           'IPS', '#0044A9', '#FFFFFF', 'https://media.api-sports.io/football/teams/57.png',  12),
  (13, 'Leeds United',           'LEE', '#1D428A', '#FFCD00', 'https://media.api-sports.io/football/teams/63.png',  13),
  (14, 'Liverpool',              'LIV', '#C8102E', '#00B2A9', 'https://media.api-sports.io/football/teams/40.png',  14),
  (15, 'Manchester City',        'MCI', '#6CABDD', '#1C2C5B', 'https://media.api-sports.io/football/teams/50.png',  15),
  (16, 'Manchester United',      'MUN', '#DA291C', '#FBE122', 'https://media.api-sports.io/football/teams/33.png',  16),
  (17, 'Newcastle United',       'NEW', '#241F20', '#FFFFFF', 'https://media.api-sports.io/football/teams/34.png',  17),
  (18, 'Nottingham Forest',      'NFO', '#DD0000', '#FFFFFF', 'https://media.api-sports.io/football/teams/65.png',  18),
  (19, 'Sunderland',             'SUN', '#EB172B', '#FFFFFF', 'https://media.api-sports.io/football/teams/746.png', 19),
  (20, 'Tottenham Hotspur',      'TOT', '#132257', '#FFFFFF', 'https://media.api-sports.io/football/teams/47.png',  20)
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  short      = EXCLUDED.short,
  color      = EXCLUDED.color,
  color2     = EXCLUDED.color2,
  logo_url   = EXCLUDED.logo_url,
  sort_order = EXCLUDED.sort_order;

-- Hald sekvensen i takt med dei manuelle id-ane
SELECT setval('pl_teams_id_seq', (SELECT MAX(id) FROM pl_teams));

-- Set tippefristen (kan endrast i admin-panelet etterpå)
UPDATE pl_settings
   SET season   = '2026/27',
       deadline = '2026-08-21 19:30:00+02'
 WHERE id = 1;
