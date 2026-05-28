-- ============================================================
-- VM 2026 Tipping – Seed Data
-- Kjør ETTER schema.sql i Supabase SQL Editor
-- ============================================================

-- ---- TEAMS (48 lag, Gruppe A–L) ----
INSERT INTO teams (id, name, name_no, country_code, group_letter) VALUES
-- Gruppe A
(1,  'Mexico',             'Mexico',           'mx',     'A'),
(2,  'South Africa',       'Sør-Afrika',        'za',     'A'),
(3,  'South Korea',        'Sør-Korea',         'kr',     'A'),
(4,  'Czech Republic',     'Tsjekkia',          'cz',     'A'),
-- Gruppe B
(5,  'Canada',             'Canada',            'ca',     'B'),
(6,  'Bosnia-Herzegovina', 'Bosnia-Hercegovina','ba',     'B'),
(7,  'Qatar',              'Qatar',             'qa',     'B'),
(8,  'Switzerland',        'Sveits',            'ch',     'B'),
-- Gruppe C
(9,  'Brazil',             'Brasil',            'br',     'C'),
(10, 'Morocco',            'Marokko',           'ma',     'C'),
(11, 'Haiti',              'Haiti',             'ht',     'C'),
(12, 'Scotland',           'Skottland',         'gb-sct', 'C'),
-- Gruppe D
(13, 'United States',      'USA',               'us',     'D'),
(14, 'Paraguay',           'Paraguay',          'py',     'D'),
(15, 'Australia',          'Australia',         'au',     'D'),
(16, 'Türkiye',            'Tyrkia',            'tr',     'D'),
-- Gruppe E
(17, 'Germany',            'Tyskland',          'de',     'E'),
(18, 'Curaçao',            'Curaçao',           'cw',     'E'),
(19, 'Ivory Coast',        'Elfenbenskysten',   'ci',     'E'),
(20, 'Ecuador',            'Ecuador',           'ec',     'E'),
-- Gruppe F
(21, 'Netherlands',        'Nederland',         'nl',     'F'),
(22, 'Japan',              'Japan',             'jp',     'F'),
(23, 'Sweden',             'Sverige',           'se',     'F'),
(24, 'Tunisia',            'Tunisia',           'tn',     'F'),
-- Gruppe G
(25, 'Belgium',            'Belgia',            'be',     'G'),
(26, 'Egypt',              'Egypt',             'eg',     'G'),
(27, 'Iran',               'Iran',              'ir',     'G'),
(28, 'New Zealand',        'New Zealand',       'nz',     'G'),
-- Gruppe H
(29, 'Spain',              'Spania',            'es',     'H'),
(30, 'Cape Verde',         'Kapp Verde',        'cv',     'H'),
(31, 'Saudi Arabia',       'Saudi-Arabia',      'sa',     'H'),
(32, 'Uruguay',            'Uruguay',           'uy',     'H'),
-- Gruppe I
(33, 'France',             'Frankrike',         'fr',     'I'),
(34, 'Senegal',            'Senegal',           'sn',     'I'),
(35, 'Iraq',               'Irak',              'iq',     'I'),
(36, 'Norway',             'Norge',             'no',     'I'),
-- Gruppe J
(37, 'Argentina',          'Argentina',         'ar',     'J'),
(38, 'Algeria',            'Algerie',           'dz',     'J'),
(39, 'Austria',            'Østerrike',         'at',     'J'),
(40, 'Jordan',             'Jordan',            'jo',     'J'),
-- Gruppe K
(41, 'Portugal',           'Portugal',          'pt',     'K'),
(42, 'DR Congo',           'DR Kongo',          'cd',     'K'),
(43, 'Uzbekistan',         'Usbekistan',        'uz',     'K'),
(44, 'Colombia',           'Colombia',          'co',     'K'),
-- Gruppe L
(45, 'England',            'England',           'gb-eng', 'L'),
(46, 'Croatia',            'Kroatia',           'hr',     'L'),
(47, 'Ghana',              'Ghana',             'gh',     'L'),
(48, 'Panama',             'Panama',            'pa',     'L');

SELECT setval('teams_id_seq', 48);


-- ---- KAMPER – GRUPPESPILL (72 kamper) ----
-- Datoer i UTC. Juster gjerne klokkeslett via Admin-panelet.

INSERT INTO matches (match_number, home_team_id, away_team_id, stage, group_letter, match_date, venue) VALUES

-- === GRUPPE A ===
-- Dag 1
(1,  1, 2, 'group','A','2026-06-11 21:00:00+00','Estadio Azteca, Mexico City'),
(2,  3, 4, 'group','A','2026-06-12 00:00:00+00','Estadio Akron, Guadalajara'),
-- Dag 2
(3,  1, 3, 'group','A','2026-06-18 21:00:00+00','Estadio Akron, Guadalajara'),
(4,  2, 4, 'group','A','2026-06-19 00:00:00+00','Mercedes-Benz Stadium, Atlanta'),
-- Dag 3 (simultane)
(5,  4, 1, 'group','A','2026-06-24 21:00:00+00','Estadio Azteca, Mexico City'),
(6,  2, 3, 'group','A','2026-06-24 21:00:00+00','Estadio BBVA, Monterrey'),

-- === GRUPPE B ===
(7,  5, 6, 'group','B','2026-06-12 21:00:00+00','BMO Field, Toronto'),
(8,  7, 8, 'group','B','2026-06-13 21:00:00+00','Levi''s Stadium, San Francisco Bay Area'),
(9,  5, 7, 'group','B','2026-06-18 23:00:00+00','BC Place, Vancouver'),
(10, 8, 6, 'group','B','2026-06-19 02:00:00+00','SoFi Stadium, Los Angeles'),
(11, 8, 5, 'group','B','2026-06-24 23:00:00+00','BC Place, Vancouver'),
(12, 6, 7, 'group','B','2026-06-24 23:00:00+00','Lumen Field, Seattle'),

-- === GRUPPE C ===
(13, 9,10, 'group','C','2026-06-13 23:00:00+00','MetLife Stadium, New York/New Jersey'),
(14,11,12, 'group','C','2026-06-14 02:00:00+00','Gillette Stadium, Boston'),
(15, 9,11, 'group','C','2026-06-19 23:00:00+00','Lincoln Financial Field, Philadelphia'),
(16,12,10, 'group','C','2026-06-20 02:00:00+00','Gillette Stadium, Boston'),
(17,10,11, 'group','C','2026-06-25 01:00:00+00','Mercedes-Benz Stadium, Atlanta'),
(18,12, 9, 'group','C','2026-06-25 01:00:00+00','Hard Rock Stadium, Miami'),

-- === GRUPPE D ===
(19,13,14, 'group','D','2026-06-12 23:00:00+00','SoFi Stadium, Los Angeles'),
(20,15,16, 'group','D','2026-06-13 01:00:00+00','Arrowhead Stadium, Kansas City'),
(21,13,15, 'group','D','2026-06-19 21:00:00+00','Lumen Field, Seattle'),
(22,16,14, 'group','D','2026-06-20 00:00:00+00','AT&T Stadium, Dallas'),
(23,16,13, 'group','D','2026-06-25 23:00:00+00','SoFi Stadium, Los Angeles'),
(24,14,15, 'group','D','2026-06-25 23:00:00+00','NRG Stadium, Houston'),

-- === GRUPPE E ===
(25,17,18, 'group','E','2026-06-14 21:00:00+00','NRG Stadium, Houston'),
(26,19,20, 'group','E','2026-06-15 00:00:00+00','Lincoln Financial Field, Philadelphia'),
(27,17,19, 'group','E','2026-06-20 21:00:00+00','AT&T Stadium, Dallas'),
(28,20,18, 'group','E','2026-06-21 00:00:00+00','Arrowhead Stadium, Kansas City'),
(29,17,20, 'group','E','2026-06-26 01:00:00+00','MetLife Stadium, New York/New Jersey'),
(30,18,19, 'group','E','2026-06-26 01:00:00+00','Hard Rock Stadium, Miami'),

-- === GRUPPE F ===
(31,21,22, 'group','F','2026-06-15 21:00:00+00','AT&T Stadium, Dallas'),
(32,23,24, 'group','F','2026-06-16 00:00:00+00','NRG Stadium, Houston'),
(33,21,23, 'group','F','2026-06-21 21:00:00+00','MetLife Stadium, New York/New Jersey'),
(34,24,22, 'group','F','2026-06-22 00:00:00+00','Gillette Stadium, Boston'),
(35,21,24, 'group','F','2026-06-26 23:00:00+00','SoFi Stadium, Los Angeles'),
(36,22,23, 'group','F','2026-06-26 23:00:00+00','BC Place, Vancouver'),

-- === GRUPPE G ===
(37,25,26, 'group','G','2026-06-15 23:00:00+00','Hard Rock Stadium, Miami'),
(38,27,28, 'group','G','2026-06-16 02:00:00+00','Arrowhead Stadium, Kansas City'),
(39,25,27, 'group','G','2026-06-21 23:00:00+00','Levi''s Stadium, San Francisco Bay Area'),
(40,28,26, 'group','G','2026-06-22 02:00:00+00','Gillette Stadium, Boston'),
(41,25,28, 'group','G','2026-06-27 01:00:00+00','BMO Field, Toronto'),
(42,26,27, 'group','G','2026-06-27 01:00:00+00','AT&T Stadium, Dallas'),

-- === GRUPPE H ===
(43,29,30, 'group','H','2026-06-16 01:00:00+00','Lumen Field, Seattle'),
(44,31,32, 'group','H','2026-06-16 23:00:00+00','MetLife Stadium, New York/New Jersey'),
(45,29,31, 'group','H','2026-06-22 21:00:00+00','Hard Rock Stadium, Miami'),
(46,32,30, 'group','H','2026-06-23 00:00:00+00','Lincoln Financial Field, Philadelphia'),
(47,32,29, 'group','H','2026-06-27 21:00:00+00','Estadio Azteca, Mexico City'),
(48,30,31, 'group','H','2026-06-27 21:00:00+00','Estadio BBVA, Monterrey'),

-- === GRUPPE I ===
(49,33,34, 'group','I','2026-06-16 21:00:00+00','Mercedes-Benz Stadium, Atlanta'),
(50,35,36, 'group','I','2026-06-17 00:00:00+00','Gillette Stadium, Boston'),
(51,33,35, 'group','I','2026-06-22 23:00:00+00','SoFi Stadium, Los Angeles'),
(52,36,34, 'group','I','2026-06-23 02:00:00+00','MetLife Stadium, New York/New Jersey'),
(53,33,36, 'group','I','2026-06-27 23:00:00+00','AT&T Stadium, Dallas'),
(54,34,35, 'group','I','2026-06-27 23:00:00+00','NRG Stadium, Houston'),

-- === GRUPPE J ===
(55,37,38, 'group','J','2026-06-17 01:00:00+00','MetLife Stadium, New York/New Jersey'),
(56,39,40, 'group','J','2026-06-17 23:00:00+00','Lumen Field, Seattle'),
(57,37,39, 'group','J','2026-06-23 21:00:00+00','Hard Rock Stadium, Miami'),
(58,40,38, 'group','J','2026-06-24 00:00:00+00','Estadio Akron, Guadalajara'),
(59,37,40, 'group','J','2026-06-28 01:00:00+00','SoFi Stadium, Los Angeles'),
(60,38,39, 'group','J','2026-06-28 01:00:00+00','Arrowhead Stadium, Kansas City'),

-- === GRUPPE K ===
(61,41,42, 'group','K','2026-06-17 21:00:00+00','NRG Stadium, Houston'),
(62,43,44, 'group','K','2026-06-18 00:00:00+00','Gillette Stadium, Boston'),
(63,41,43, 'group','K','2026-06-23 23:00:00+00','MetLife Stadium, New York/New Jersey'),
(64,44,42, 'group','K','2026-06-24 02:00:00+00','AT&T Stadium, Dallas'),
(65,41,44, 'group','K','2026-06-28 23:00:00+00','Levi''s Stadium, San Francisco Bay Area'),
(66,42,43, 'group','K','2026-06-28 23:00:00+00','BMO Field, Toronto'),

-- === GRUPPE L ===
(67,45,48, 'group','L','2026-06-18 01:00:00+00','Lincoln Financial Field, Philadelphia'),
(68,46,47, 'group','L','2026-06-18 21:00:00+00','Arrowhead Stadium, Kansas City'),
(69,45,46, 'group','L','2026-06-24 21:00:00+00','Lincoln Financial Field, Philadelphia'),
(70,47,48, 'group','L','2026-06-25 00:00:00+00','BC Place, Vancouver'),
(71,45,47, 'group','L','2026-06-29 01:00:00+00','Lumen Field, Seattle'),
(72,48,46, 'group','L','2026-06-29 01:00:00+00','Mercedes-Benz Stadium, Atlanta');


-- ---- KAMPER – SLUTTSPILL (32 kamper, lag TBD) ----

-- === RUNDE AV 32 (16 kamper, 28. jun – 2. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(73,  'r32','2026-06-28 21:00:00+00','Estadio Azteca, Mexico City',     'Nr. 2 Gruppe A',    'Nr. 2 Gruppe B'),
(74,  'r32','2026-06-28 23:00:00+00','MetLife Stadium, New York/NJ',    'Nr. 1 Gruppe E',    'Best tredjalag'),
(75,  'r32','2026-06-29 21:00:00+00','SoFi Stadium, Los Angeles',       'Nr. 1 Gruppe F',    'Nr. 2 Gruppe C'),
(76,  'r32','2026-06-29 23:00:00+00','AT&T Stadium, Dallas',            'Nr. 1 Gruppe C',    'Nr. 2 Gruppe F'),
(77,  'r32','2026-06-30 21:00:00+00','Hard Rock Stadium, Miami',        'Nr. 1 Gruppe I',    'Best tredjalag'),
(78,  'r32','2026-06-30 23:00:00+00','Lumen Field, Seattle',            'Nr. 2 Gruppe E',    'Nr. 2 Gruppe I'),
(79,  'r32','2026-07-01 21:00:00+00','Estadio BBVA, Monterrey',         'Nr. 1 Gruppe A',    'Best tredjalag'),
(80,  'r32','2026-07-01 23:00:00+00','NRG Stadium, Houston',            'Nr. 1 Gruppe L',    'Best tredjalag'),
(81,  'r32','2026-07-02 01:00:00+00','BMO Field, Toronto',              'Nr. 1 Gruppe D',    'Best tredjalag'),
(82,  'r32','2026-07-02 21:00:00+00','Gillette Stadium, Boston',        'Nr. 1 Gruppe G',    'Best tredjalag'),
(83,  'r32','2026-07-02 23:00:00+00','Levi''s Stadium, San Francisco',  'Nr. 2 Gruppe K',    'Nr. 2 Gruppe L'),
(84,  'r32','2026-07-03 01:00:00+00','Lincoln Financial, Philadelphia',  'Nr. 1 Gruppe H',    'Nr. 2 Gruppe J'),
(85,  'r32','2026-07-03 21:00:00+00','BC Place, Vancouver',             'Nr. 1 Gruppe B',    'Best tredjalag'),
(86,  'r32','2026-07-03 23:00:00+00','Arrowhead Stadium, Kansas City',  'Nr. 1 Gruppe J',    'Nr. 2 Gruppe H'),
(87,  'r32','2026-07-04 01:00:00+00','Mercedes-Benz Stadium, Atlanta',  'Nr. 1 Gruppe K',    'Best tredjalag'),
(88,  'r32','2026-07-04 21:00:00+00','Estadio Akron, Guadalajara',      'Nr. 2 Gruppe D',    'Nr. 2 Gruppe G');

-- === RUNDE AV 16 (8 kamper, 5.–8. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(89,  'r16','2026-07-05 21:00:00+00','MetLife Stadium, New York/NJ',    'Vinner kamp 73', 'Vinner kamp 74'),
(90,  'r16','2026-07-05 23:00:00+00','SoFi Stadium, Los Angeles',       'Vinner kamp 75', 'Vinner kamp 76'),
(91,  'r16','2026-07-06 21:00:00+00','AT&T Stadium, Dallas',            'Vinner kamp 77', 'Vinner kamp 78'),
(92,  'r16','2026-07-06 23:00:00+00','Hard Rock Stadium, Miami',        'Vinner kamp 79', 'Vinner kamp 80'),
(93,  'r16','2026-07-07 21:00:00+00','Estadio Azteca, Mexico City',     'Vinner kamp 81', 'Vinner kamp 82'),
(94,  'r16','2026-07-07 23:00:00+00','NRG Stadium, Houston',            'Vinner kamp 83', 'Vinner kamp 84'),
(95,  'r16','2026-07-08 21:00:00+00','Lumen Field, Seattle',            'Vinner kamp 85', 'Vinner kamp 86'),
(96,  'r16','2026-07-08 23:00:00+00','BC Place, Vancouver',             'Vinner kamp 87', 'Vinner kamp 88');

-- === KVARTFINALER (4 kamper, 10.–12. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(97,  'qf','2026-07-10 21:00:00+00','MetLife Stadium, New York/NJ',    'Vinner kamp 89', 'Vinner kamp 90'),
(98,  'qf','2026-07-10 23:00:00+00','AT&T Stadium, Dallas',            'Vinner kamp 91', 'Vinner kamp 92'),
(99,  'qf','2026-07-11 21:00:00+00','SoFi Stadium, Los Angeles',       'Vinner kamp 93', 'Vinner kamp 94'),
(100, 'qf','2026-07-11 23:00:00+00','Hard Rock Stadium, Miami',        'Vinner kamp 95', 'Vinner kamp 96');

-- === SEMIFINALER (2 kamper, 14.–15. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(101, 'sf','2026-07-14 21:00:00+00','MetLife Stadium, New York/NJ',    'Vinner kamp 97', 'Vinner kamp 98'),
(102, 'sf','2026-07-15 21:00:00+00','AT&T Stadium, Dallas',            'Vinner kamp 99', 'Vinner kamp 100');

-- === TREDJEPLASS (1 kamp, 18. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(103, '3rd','2026-07-18 21:00:00+00','Hard Rock Stadium, Miami',       'Taper kamp 101', 'Taper kamp 102');

-- === FINALE (1 kamp, 19. jul) ===
INSERT INTO matches (match_number, stage, match_date, venue, home_slot_desc, away_slot_desc) VALUES
(104, 'final','2026-07-19 21:00:00+00','MetLife Stadium, New York/NJ', 'Vinner kamp 101', 'Vinner kamp 102');

SELECT setval('matches_id_seq', 104);
