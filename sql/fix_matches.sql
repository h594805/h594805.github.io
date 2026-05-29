-- =============================================================================
-- fix_matches.sql
-- Fixes all 104 match records for the 2026 FIFA World Cup tipping website.
-- All match_date values are stored as UTC (timestamptz).
-- =============================================================================

-- =============================================================================
-- CORRECTED bracket.js FEEDERS OBJECT (for R16 slot descriptions)
--
-- const FEEDERS = {
--   // Round of 32 (73-88)
--   73:  { home: '2. plass Gruppe A',  away: '2. plass Gruppe B' },
--   74:  { home: '1. plass Gruppe E',  away: '3. plass Gruppe T' },
--   75:  { home: '1. plass Gruppe F',  away: '2. plass Gruppe C' },
--   76:  { home: '1. plass Gruppe C',  away: '2. plass Gruppe F' },
--   77:  { home: '1. plass Gruppe I',  away: '3. plass Gruppe T' },
--   78:  { home: '2. plass Gruppe E',  away: '2. plass Gruppe I' },
--   79:  { home: '1. plass Gruppe A',  away: '3. plass Gruppe T' },
--   80:  { home: '1. plass Gruppe L',  away: '3. plass Gruppe T' },
--   81:  { home: '1. plass Gruppe D',  away: '3. plass Gruppe T' },
--   82:  { home: '1. plass Gruppe G',  away: '3. plass Gruppe T' },
--   83:  { home: '2. plass Gruppe K',  away: '2. plass Gruppe L' },
--   84:  { home: '1. plass Gruppe H',  away: '2. plass Gruppe J' },
--   85:  { home: '1. plass Gruppe B',  away: '3. plass Gruppe T' },
--   86:  { home: '1. plass Gruppe J',  away: '2. plass Gruppe H' },
--   87:  { home: '1. plass Gruppe K',  away: '3. plass Gruppe T' },
--   88:  { home: '2. plass Gruppe D',  away: '2. plass Gruppe G' },
--   // Round of 16 (89-96)
--   89:  { home: 'Vinner kamp 74',  away: 'Vinner kamp 77' },
--   90:  { home: 'Vinner kamp 73',  away: 'Vinner kamp 75' },
--   91:  { home: 'Vinner kamp 76',  away: 'Vinner kamp 78' },
--   92:  { home: 'Vinner kamp 79',  away: 'Vinner kamp 80' },
--   93:  { home: 'Vinner kamp 83',  away: 'Vinner kamp 84' },
--   94:  { home: 'Vinner kamp 81',  away: 'Vinner kamp 82' },
--   95:  { home: 'Vinner kamp 86',  away: 'Vinner kamp 88' },
--   96:  { home: 'Vinner kamp 85',  away: 'Vinner kamp 87' },
--   // Quarterfinals (97-100)
--   97:  { home: 'Vinner kamp 89',  away: 'Vinner kamp 90' },
--   98:  { home: 'Vinner kamp 93',  away: 'Vinner kamp 94' },
--   99:  { home: 'Vinner kamp 91',  away: 'Vinner kamp 92' },
--   100: { home: 'Vinner kamp 95',  away: 'Vinner kamp 96' },
--   // Semifinals (101-102)
--   101: { home: 'Vinner kamp 97',  away: 'Vinner kamp 98' },
--   102: { home: 'Vinner kamp 99',  away: 'Vinner kamp 100' },
--   // Third place (103)
--   103: { home: 'Taper kamp 101', away: 'Taper kamp 102' },
--   // Final (104)
--   104: { home: 'Vinner kamp 101', away: 'Vinner kamp 102' },
-- };
-- =============================================================================

BEGIN;

-- =============================================================================
-- GROUP STAGE — matches 1-72
-- Fixes: home_team_id, away_team_id, match_date (UTC), venue
-- =============================================================================

-- -------------------------
-- GROUP A  (seed matches 1-6)
-- Teams: Mexico=1, Sør-Afrika=2, Sør-Korea=3, Tsjekkia=4
-- -------------------------

-- Seed 1: (1,2) Mexico vs South Africa → Wikipedia Match 1
UPDATE matches SET home_team_id=1, away_team_id=2, match_date='2026-06-11 19:00:00+00', venue='Estadio Azteca, Mexico City' WHERE match_number=1;

-- Seed 2: (3,4) South Korea vs Czech Republic → Wikipedia Match 2
UPDATE matches SET home_team_id=3, away_team_id=4, match_date='2026-06-12 02:00:00+00', venue='Estadio Akron, Zapopan' WHERE match_number=2;

-- Seed 3: (1,3) Mexico vs South Korea → Wikipedia Match 28
UPDATE matches SET home_team_id=1, away_team_id=3, match_date='2026-06-19 01:00:00+00', venue='Estadio Akron, Zapopan' WHERE match_number=3;

-- Seed 4: (2,4) South Africa vs Czech Republic → Wikipedia Match 25 (Czech Republic=home, South Africa=away)
UPDATE matches SET home_team_id=4, away_team_id=2, match_date='2026-06-18 16:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=4;

-- Seed 5: (4,1) Czech Republic vs Mexico → Wikipedia Match 53
UPDATE matches SET home_team_id=4, away_team_id=1, match_date='2026-06-25 01:00:00+00', venue='Estadio Azteca, Mexico City' WHERE match_number=5;

-- Seed 6: (2,3) South Africa vs South Korea → Wikipedia Match 54
UPDATE matches SET home_team_id=2, away_team_id=3, match_date='2026-06-25 01:00:00+00', venue='Estadio BBVA, Guadalupe' WHERE match_number=6;

-- -------------------------
-- GROUP B  (seed matches 7-12)
-- Teams: Canada=5, Bosnia-Herzegovina=6, Qatar=7, Sveits=8
-- -------------------------

-- Seed 7: (5,6) Canada vs Bosnia-Herzegovina → Wikipedia Match 3
UPDATE matches SET home_team_id=5, away_team_id=6, match_date='2026-06-12 19:00:00+00', venue='BMO Field, Toronto' WHERE match_number=7;

-- Seed 8: (7,8) Qatar vs Switzerland → Wikipedia Match 8
UPDATE matches SET home_team_id=7, away_team_id=8, match_date='2026-06-13 19:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=8;

-- Seed 9: (5,7) Canada vs Qatar → Wikipedia Match 27
UPDATE matches SET home_team_id=5, away_team_id=7, match_date='2026-06-18 22:00:00+00', venue='BC Place, Vancouver' WHERE match_number=9;

-- Seed 10: (8,6) Switzerland vs Bosnia-Herzegovina → Wikipedia Match 26
UPDATE matches SET home_team_id=8, away_team_id=6, match_date='2026-06-18 19:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=10;

-- Seed 11: (8,5) Switzerland vs Canada → Wikipedia Match 51
UPDATE matches SET home_team_id=8, away_team_id=5, match_date='2026-06-24 19:00:00+00', venue='BC Place, Vancouver' WHERE match_number=11;

-- Seed 12: (6,7) Bosnia-Herzegovina vs Qatar → Wikipedia Match 52
UPDATE matches SET home_team_id=6, away_team_id=7, match_date='2026-06-24 19:00:00+00', venue='Lumen Field, Seattle' WHERE match_number=12;

-- -------------------------
-- GROUP C  (seed matches 13-18)
-- Teams: Brasil=9, Marokko=10, Haiti=11, Skottland=12
-- -------------------------

-- Seed 13: (9,10) Brazil vs Morocco → Wikipedia Match 7
UPDATE matches SET home_team_id=9, away_team_id=10, match_date='2026-06-13 22:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=13;

-- Seed 14: (11,12) Haiti vs Scotland → Wikipedia Match 5
UPDATE matches SET home_team_id=11, away_team_id=12, match_date='2026-06-14 01:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=14;

-- Seed 15: (9,11) Brazil vs Haiti → Wikipedia Match 29
UPDATE matches SET home_team_id=9, away_team_id=11, match_date='2026-06-20 00:30:00+00', venue='Lincoln Financial Field, Philadelphia' WHERE match_number=15;

-- Seed 16: (12,10) Scotland vs Morocco → Wikipedia Match 30
UPDATE matches SET home_team_id=12, away_team_id=10, match_date='2026-06-19 22:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=16;

-- Seed 17: (10,11) Morocco vs Haiti → Wikipedia Match 50
UPDATE matches SET home_team_id=10, away_team_id=11, match_date='2026-06-24 22:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=17;

-- Seed 18: (12,9) Scotland vs Brazil → Wikipedia Match 49
UPDATE matches SET home_team_id=12, away_team_id=9, match_date='2026-06-24 22:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=18;

-- -------------------------
-- GROUP D  (seed matches 19-24)
-- Teams: USA=13, Paraguay=14, Australia=15, Tyrkia=16
-- -------------------------

-- Seed 19: (13,14) USA vs Paraguay → Wikipedia Match 4
UPDATE matches SET home_team_id=13, away_team_id=14, match_date='2026-06-13 01:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=19;

-- Seed 20: (15,16) Australia vs Turkey → Wikipedia Match 6
UPDATE matches SET home_team_id=15, away_team_id=16, match_date='2026-06-14 04:00:00+00', venue='BC Place, Vancouver' WHERE match_number=20;

-- Seed 21: (13,15) USA vs Australia → Wikipedia Match 32
UPDATE matches SET home_team_id=13, away_team_id=15, match_date='2026-06-19 19:00:00+00', venue='Lumen Field, Seattle' WHERE match_number=21;

-- Seed 22: (16,14) Turkey vs Paraguay → Wikipedia Match 31
UPDATE matches SET home_team_id=16, away_team_id=14, match_date='2026-06-20 03:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=22;

-- Seed 23: (16,13) Turkey vs USA → Wikipedia Match 59
UPDATE matches SET home_team_id=16, away_team_id=13, match_date='2026-06-26 02:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=23;

-- Seed 24: (14,15) Paraguay vs Australia → Wikipedia Match 60
UPDATE matches SET home_team_id=14, away_team_id=15, match_date='2026-06-26 02:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=24;

-- -------------------------
-- GROUP E  (seed matches 25-30)
-- Teams: Tyskland=17, Curaçao=18, Elfenbenskysten=19, Ecuador=20
-- -------------------------

-- Seed 25: (17,18) Germany vs Curaçao → Wikipedia Match 10
UPDATE matches SET home_team_id=17, away_team_id=18, match_date='2026-06-14 17:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=25;

-- Seed 26: (19,20) Ivory Coast vs Ecuador → Wikipedia Match 9
UPDATE matches SET home_team_id=19, away_team_id=20, match_date='2026-06-14 23:00:00+00', venue='Lincoln Financial Field, Philadelphia' WHERE match_number=26;

-- Seed 27: (17,19) Germany vs Ivory Coast → Wikipedia Match 33
UPDATE matches SET home_team_id=17, away_team_id=19, match_date='2026-06-20 20:00:00+00', venue='BMO Field, Toronto' WHERE match_number=27;

-- Seed 28: (20,18) Ecuador vs Curaçao → Wikipedia Match 34
UPDATE matches SET home_team_id=20, away_team_id=18, match_date='2026-06-21 00:00:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=28;

-- Seed 29: (17,20) Germany vs Ecuador → Wikipedia Match 56 (Ecuador=home, Germany=away)
UPDATE matches SET home_team_id=20, away_team_id=17, match_date='2026-06-25 20:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=29;

-- Seed 30: (18,19) Curaçao vs Ivory Coast → Wikipedia Match 55
UPDATE matches SET home_team_id=18, away_team_id=19, match_date='2026-06-25 20:00:00+00', venue='Lincoln Financial Field, Philadelphia' WHERE match_number=30;

-- -------------------------
-- GROUP F  (seed matches 31-36)
-- Teams: Nederland=21, Japan=22, Sverige=23, Tunisia=24
-- -------------------------

-- Seed 31: (21,22) Netherlands vs Japan → Wikipedia Match 11
UPDATE matches SET home_team_id=21, away_team_id=22, match_date='2026-06-14 20:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=31;

-- Seed 32: (23,24) Sweden vs Tunisia → Wikipedia Match 12
UPDATE matches SET home_team_id=23, away_team_id=24, match_date='2026-06-15 02:00:00+00', venue='Estadio BBVA, Guadalupe' WHERE match_number=32;

-- Seed 33: (21,23) Netherlands vs Sweden → Wikipedia Match 35
UPDATE matches SET home_team_id=21, away_team_id=23, match_date='2026-06-20 17:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=33;

-- Seed 34: (24,22) Tunisia vs Japan → Wikipedia Match 36
UPDATE matches SET home_team_id=24, away_team_id=22, match_date='2026-06-21 04:00:00+00', venue='Estadio BBVA, Guadalupe' WHERE match_number=34;

-- Seed 35: (21,24) Netherlands vs Tunisia → Wikipedia Match 58 (Tunisia=home, Netherlands=away)
UPDATE matches SET home_team_id=24, away_team_id=21, match_date='2026-06-25 23:00:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=35;

-- Seed 36: (22,23) Japan vs Sweden → Wikipedia Match 57
UPDATE matches SET home_team_id=22, away_team_id=23, match_date='2026-06-25 23:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=36;

-- -------------------------
-- GROUP G  (seed matches 37-42)
-- Teams: Belgia=25, Egypt=26, Iran=27, New Zealand=28
-- -------------------------

-- Seed 37: (25,26) Belgium vs Egypt → Wikipedia Match 16
UPDATE matches SET home_team_id=25, away_team_id=26, match_date='2026-06-15 19:00:00+00', venue='Lumen Field, Seattle' WHERE match_number=37;

-- Seed 38: (27,28) Iran vs New Zealand → Wikipedia Match 15
UPDATE matches SET home_team_id=27, away_team_id=28, match_date='2026-06-16 01:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=38;

-- Seed 39: (25,27) Belgium vs Iran → Wikipedia Match 39
UPDATE matches SET home_team_id=25, away_team_id=27, match_date='2026-06-21 19:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=39;

-- Seed 40: (28,26) New Zealand vs Egypt → Wikipedia Match 40
UPDATE matches SET home_team_id=28, away_team_id=26, match_date='2026-06-22 01:00:00+00', venue='BC Place, Vancouver' WHERE match_number=40;

-- Seed 41: (25,28) Belgium vs New Zealand → Wikipedia Match 64 (New Zealand=home, Belgium=away)
UPDATE matches SET home_team_id=28, away_team_id=25, match_date='2026-06-27 03:00:00+00', venue='BC Place, Vancouver' WHERE match_number=41;

-- Seed 42: (26,27) Egypt vs Iran → Wikipedia Match 63
UPDATE matches SET home_team_id=26, away_team_id=27, match_date='2026-06-27 03:00:00+00', venue='Lumen Field, Seattle' WHERE match_number=42;

-- -------------------------
-- GROUP H  (seed matches 43-48)
-- Teams: Spania=29, Kapp Verde=30, Saudi-Arabia=31, Uruguay=32
-- -------------------------

-- Seed 43: (29,30) Spain vs Cape Verde → Wikipedia Match 14
UPDATE matches SET home_team_id=29, away_team_id=30, match_date='2026-06-15 16:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=43;

-- Seed 44: (31,32) Saudi Arabia vs Uruguay → Wikipedia Match 13
UPDATE matches SET home_team_id=31, away_team_id=32, match_date='2026-06-15 22:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=44;

-- Seed 45: (29,31) Spain vs Saudi Arabia → Wikipedia Match 38
UPDATE matches SET home_team_id=29, away_team_id=31, match_date='2026-06-21 16:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=45;

-- Seed 46: (32,30) Uruguay vs Cape Verde → Wikipedia Match 37
UPDATE matches SET home_team_id=32, away_team_id=30, match_date='2026-06-21 22:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=46;

-- Seed 47: (32,29) Uruguay vs Spain → Wikipedia Match 66
UPDATE matches SET home_team_id=32, away_team_id=29, match_date='2026-06-27 00:00:00+00', venue='Estadio Akron, Zapopan' WHERE match_number=47;

-- Seed 48: (30,31) Cape Verde vs Saudi Arabia → Wikipedia Match 65
UPDATE matches SET home_team_id=30, away_team_id=31, match_date='2026-06-27 00:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=48;

-- -------------------------
-- GROUP I  (seed matches 49-54)
-- Teams: Frankrike=33, Senegal=34, Irak=35, Norge=36
-- -------------------------

-- Seed 49: (33,34) France vs Senegal → Wikipedia Match 17
UPDATE matches SET home_team_id=33, away_team_id=34, match_date='2026-06-16 19:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=49;

-- Seed 50: (35,36) Iraq vs Norway → Wikipedia Match 18
UPDATE matches SET home_team_id=35, away_team_id=36, match_date='2026-06-16 22:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=50;

-- Seed 51: (33,35) France vs Iraq → Wikipedia Match 42
UPDATE matches SET home_team_id=33, away_team_id=35, match_date='2026-06-22 21:00:00+00', venue='Lincoln Financial Field, Philadelphia' WHERE match_number=51;

-- Seed 52: (36,34) Norway vs Senegal → Wikipedia Match 41
UPDATE matches SET home_team_id=36, away_team_id=34, match_date='2026-06-23 00:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=52;

-- Seed 53: (33,36) France vs Norway → Wikipedia Match 61 (Norway=home, France=away)
UPDATE matches SET home_team_id=36, away_team_id=33, match_date='2026-06-26 19:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=53;

-- Seed 54: (34,35) Senegal vs Iraq → Wikipedia Match 62
UPDATE matches SET home_team_id=34, away_team_id=35, match_date='2026-06-26 19:00:00+00', venue='BMO Field, Toronto' WHERE match_number=54;

-- -------------------------
-- GROUP J  (seed matches 55-60)
-- Teams: Argentina=37, Algerie=38, Østerrike=39, Jordan=40
-- -------------------------

-- Seed 55: (37,38) Argentina vs Algeria → Wikipedia Match 19
UPDATE matches SET home_team_id=37, away_team_id=38, match_date='2026-06-17 01:00:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=55;

-- Seed 56: (39,40) Austria vs Jordan → Wikipedia Match 20
UPDATE matches SET home_team_id=39, away_team_id=40, match_date='2026-06-17 04:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=56;

-- Seed 57: (37,39) Argentina vs Austria → Wikipedia Match 43
UPDATE matches SET home_team_id=37, away_team_id=39, match_date='2026-06-22 17:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=57;

-- Seed 58: (40,38) Jordan vs Algeria → Wikipedia Match 44
UPDATE matches SET home_team_id=40, away_team_id=38, match_date='2026-06-23 03:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=58;

-- Seed 59: (37,40) Argentina vs Jordan → Wikipedia Match 70 (Jordan=home, Argentina=away)
UPDATE matches SET home_team_id=40, away_team_id=37, match_date='2026-06-28 02:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=59;

-- Seed 60: (38,39) Algeria vs Austria → Wikipedia Match 69
UPDATE matches SET home_team_id=38, away_team_id=39, match_date='2026-06-28 02:00:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=60;

-- -------------------------
-- GROUP K  (seed matches 61-66)
-- Teams: Portugal=41, DR Kongo=42, Usbekistan=43, Colombia=44
-- -------------------------

-- Seed 61: (41,42) Portugal vs DR Congo → Wikipedia Match 23
UPDATE matches SET home_team_id=41, away_team_id=42, match_date='2026-06-17 17:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=61;

-- Seed 62: (43,44) Uzbekistan vs Colombia → Wikipedia Match 24
UPDATE matches SET home_team_id=43, away_team_id=44, match_date='2026-06-18 02:00:00+00', venue='Estadio Azteca, Mexico City' WHERE match_number=62;

-- Seed 63: (41,43) Portugal vs Uzbekistan → Wikipedia Match 47
UPDATE matches SET home_team_id=41, away_team_id=43, match_date='2026-06-23 17:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=63;

-- Seed 64: (44,42) Colombia vs DR Congo → Wikipedia Match 48
UPDATE matches SET home_team_id=44, away_team_id=42, match_date='2026-06-24 02:00:00+00', venue='Estadio Akron, Zapopan' WHERE match_number=64;

-- Seed 65: (41,44) Portugal vs Colombia → Wikipedia Match 71 (Colombia=home, Portugal=away)
UPDATE matches SET home_team_id=44, away_team_id=41, match_date='2026-06-27 23:30:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=65;

-- Seed 66: (42,43) DR Congo vs Uzbekistan → Wikipedia Match 72
UPDATE matches SET home_team_id=42, away_team_id=43, match_date='2026-06-27 23:30:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=66;

-- -------------------------
-- GROUP L  (seed matches 67-72)
-- Teams: England=45, Kroatia=46, Ghana=47, Panama=48
-- -------------------------

-- Seed 67: (45,48) England vs Panama → Wikipedia Match 67 (Panama=home, England=away)
UPDATE matches SET home_team_id=48, away_team_id=45, match_date='2026-06-27 21:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=67;

-- Seed 68: (46,47) Croatia vs Ghana → Wikipedia Match 68
UPDATE matches SET home_team_id=46, away_team_id=47, match_date='2026-06-27 21:00:00+00', venue='Lincoln Financial Field, Philadelphia' WHERE match_number=68;

-- Seed 69: (45,46) England vs Croatia → Wikipedia Match 22
UPDATE matches SET home_team_id=45, away_team_id=46, match_date='2026-06-17 20:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=69;

-- Seed 70: (47,48) Ghana vs Panama → Wikipedia Match 21
UPDATE matches SET home_team_id=47, away_team_id=48, match_date='2026-06-17 23:00:00+00', venue='BMO Field, Toronto' WHERE match_number=70;

-- Seed 71: (45,47) England vs Ghana → Wikipedia Match 45
UPDATE matches SET home_team_id=45, away_team_id=47, match_date='2026-06-23 20:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=71;

-- Seed 72: (48,46) Panama vs Croatia → Wikipedia Match 46
UPDATE matches SET home_team_id=48, away_team_id=46, match_date='2026-06-23 23:00:00+00', venue='BMO Field, Toronto' WHERE match_number=72;

-- =============================================================================
-- KNOCKOUT STAGE — matches 73-104
-- Fixes: match_date (UTC), venue only (slot_descs preserved except R16 below)
-- =============================================================================

-- -------------------------
-- ROUND OF 32  (matches 73-88)
-- -------------------------

-- Match 73: 2A vs 2B — June 28, 12:00 PM UTC-7
UPDATE matches SET match_date='2026-06-28 19:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=73;

-- Match 74: 1E vs 3T — June 29, 4:30 PM UTC-4
UPDATE matches SET match_date='2026-06-29 20:30:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=74;

-- Match 75: 1F vs 2C — June 29, 7:00 PM UTC-6
UPDATE matches SET match_date='2026-06-30 01:00:00+00', venue='Estadio BBVA, Guadalupe' WHERE match_number=75;

-- Match 76: 1C vs 2F — June 29, 12:00 PM UTC-5
UPDATE matches SET match_date='2026-06-29 17:00:00+00', venue='NRG Stadium, Houston' WHERE match_number=76;

-- Match 77: 1I vs 3T — June 30, 5:00 PM UTC-4
UPDATE matches SET match_date='2026-06-30 21:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=77;

-- Match 78: 2E vs 2I — June 30, 12:00 PM UTC-5
UPDATE matches SET match_date='2026-06-30 17:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=78;

-- Match 79: 1A vs 3T — June 30, 7:00 PM UTC-6
UPDATE matches SET match_date='2026-07-01 01:00:00+00', venue='Estadio Azteca, Mexico City' WHERE match_number=79;

-- Match 80: 1L vs 3T — July 1, 12:00 PM UTC-4
UPDATE matches SET match_date='2026-07-01 16:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=80;

-- Match 81: 1D vs 3T — July 1, 5:00 PM UTC-7
UPDATE matches SET match_date='2026-07-02 00:00:00+00', venue='Levi''s Stadium, Santa Clara' WHERE match_number=81;

-- Match 82: 1G vs 3T — July 1, 1:00 PM UTC-7
UPDATE matches SET match_date='2026-07-01 20:00:00+00', venue='Lumen Field, Seattle' WHERE match_number=82;

-- Match 83: 2K vs 2L — July 2, 7:00 PM UTC-4
UPDATE matches SET match_date='2026-07-02 23:00:00+00', venue='BMO Field, Toronto' WHERE match_number=83;

-- Match 84: 1H vs 2J — July 2, 12:00 PM UTC-7
UPDATE matches SET match_date='2026-07-02 19:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=84;

-- Match 85: 1B vs 3T — July 2, 8:00 PM UTC-7
UPDATE matches SET match_date='2026-07-03 03:00:00+00', venue='BC Place, Vancouver' WHERE match_number=85;

-- Match 86: 1J vs 2H — July 3, 6:00 PM UTC-4
UPDATE matches SET match_date='2026-07-03 22:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=86;

-- Match 87: 1K vs 3T — July 3, 8:30 PM UTC-5
UPDATE matches SET match_date='2026-07-04 01:30:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=87;

-- Match 88: 2D vs 2G — July 3, 1:00 PM UTC-5
UPDATE matches SET match_date='2026-07-03 18:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=88;

-- -------------------------
-- ROUND OF 16  (matches 89-96)
-- Also updating slot_desc to reflect correct Wikipedia bracket pairings
-- -------------------------

-- Match 89: W74 vs W77 — July 4, 5:00 PM UTC-4
UPDATE matches SET match_date='2026-07-04 21:00:00+00', venue='Lincoln Financial Field, Philadelphia', home_slot_desc='Vinner kamp 74', away_slot_desc='Vinner kamp 77' WHERE match_number=89;

-- Match 90: W73 vs W75 — July 4, 12:00 PM UTC-5
UPDATE matches SET match_date='2026-07-04 17:00:00+00', venue='NRG Stadium, Houston', home_slot_desc='Vinner kamp 73', away_slot_desc='Vinner kamp 75' WHERE match_number=90;

-- Match 91: W76 vs W78 — July 5, 4:00 PM UTC-4
UPDATE matches SET match_date='2026-07-05 20:00:00+00', venue='MetLife Stadium, East Rutherford', home_slot_desc='Vinner kamp 76', away_slot_desc='Vinner kamp 78' WHERE match_number=91;

-- Match 92: W79 vs W80 — July 5, 6:00 PM UTC-6
UPDATE matches SET match_date='2026-07-06 00:00:00+00', venue='Estadio Azteca, Mexico City', home_slot_desc='Vinner kamp 79', away_slot_desc='Vinner kamp 80' WHERE match_number=92;

-- Match 93: W83 vs W84 — July 6, 2:00 PM UTC-5
UPDATE matches SET match_date='2026-07-06 19:00:00+00', venue='AT&T Stadium, Arlington', home_slot_desc='Vinner kamp 83', away_slot_desc='Vinner kamp 84' WHERE match_number=93;

-- Match 94: W81 vs W82 — July 6, 5:00 PM UTC-7
UPDATE matches SET match_date='2026-07-07 00:00:00+00', venue='Lumen Field, Seattle', home_slot_desc='Vinner kamp 81', away_slot_desc='Vinner kamp 82' WHERE match_number=94;

-- Match 95: W86 vs W88 — July 7, 12:00 PM UTC-4
UPDATE matches SET match_date='2026-07-07 16:00:00+00', venue='Mercedes-Benz Stadium, Atlanta', home_slot_desc='Vinner kamp 86', away_slot_desc='Vinner kamp 88' WHERE match_number=95;

-- Match 96: W85 vs W87 — July 7, 1:00 PM UTC-7
UPDATE matches SET match_date='2026-07-07 20:00:00+00', venue='BC Place, Vancouver', home_slot_desc='Vinner kamp 85', away_slot_desc='Vinner kamp 87' WHERE match_number=96;

-- -------------------------
-- QUARTERFINALS  (matches 97-100)
-- -------------------------

-- Match 97: W89 vs W90 — July 9, 4:00 PM UTC-4
UPDATE matches SET match_date='2026-07-09 20:00:00+00', venue='Gillette Stadium, Foxborough' WHERE match_number=97;

-- Match 98: W93 vs W94 — July 10, 12:00 PM UTC-7
UPDATE matches SET match_date='2026-07-10 19:00:00+00', venue='SoFi Stadium, Inglewood' WHERE match_number=98;

-- Match 99: W91 vs W92 — July 11, 5:00 PM UTC-4
UPDATE matches SET match_date='2026-07-11 21:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=99;

-- Match 100: W95 vs W96 — July 11, 8:00 PM UTC-5
UPDATE matches SET match_date='2026-07-12 01:00:00+00', venue='Arrowhead Stadium, Kansas City' WHERE match_number=100;

-- -------------------------
-- SEMIFINALS  (matches 101-102)
-- -------------------------

-- Match 101: W97 vs W98 — July 14, 2:00 PM UTC-5
UPDATE matches SET match_date='2026-07-14 19:00:00+00', venue='AT&T Stadium, Arlington' WHERE match_number=101;

-- Match 102: W99 vs W100 — July 15, 3:00 PM UTC-4
UPDATE matches SET match_date='2026-07-15 19:00:00+00', venue='Mercedes-Benz Stadium, Atlanta' WHERE match_number=102;

-- -------------------------
-- THIRD PLACE  (match 103)
-- -------------------------

-- Match 103: L101 vs L102 — July 18, 5:00 PM UTC-4
UPDATE matches SET match_date='2026-07-18 21:00:00+00', venue='Hard Rock Stadium, Miami Gardens' WHERE match_number=103;

-- -------------------------
-- FINAL  (match 104)
-- -------------------------

-- Match 104: W101 vs W102 — July 19, 3:00 PM UTC-4
UPDATE matches SET match_date='2026-07-19 19:00:00+00', venue='MetLife Stadium, East Rutherford' WHERE match_number=104;

-- =============================================================================
-- FIX EXISTING PREDICTIONS for the 8 matches where home/away teams were swapped.
-- Swaps home_score_pred ↔ away_score_pred so predictions still reflect the
-- user's original intent (same winner, same scoreline, correct team on each side).
-- Affected match_numbers: 4, 29, 35, 41, 53, 59, 65, 67
-- =============================================================================
UPDATE predictions
SET home_score_pred = away_score_pred,
    away_score_pred = home_score_pred
WHERE match_id IN (
  SELECT id FROM matches WHERE match_number IN (4, 29, 35, 41, 53, 59, 65, 67)
);

COMMIT;
