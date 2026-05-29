-- ============================================================
-- VM 2026 – Komplett testdata
-- Kjør ETTER seed.sql i Supabase SQL Editor.
-- 12 brukere, alle kamper spilt, Argentina vinner VM!
-- Alle brukere logger inn med PIN: 1234
-- ============================================================

-- ── 1. BRUKERE ───────────────────────────────────────────────
-- SHA-256 av "1234" = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
INSERT INTO app_users (username, pin_hash) VALUES
('Gard',       '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Kristoffer', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Mathias',    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Andreas',    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Sondre',     '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Torben',     '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Magnus',     '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Stian',      '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Håkon',      '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Erlend',     '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Vegard',     '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Rune',       '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4')
ON CONFLICT (username) DO NOTHING;


-- ── 2. GRUPPESPILL-RESULTATER (kamper 1–72) ──────────────────
-- Grupperesultater produserer følgende plasseringer:
-- A: Mexico(1)>Sør-Afrika(2)>Sør-Korea(3)>Tsjekkia(4)
-- B: Sveits(8)>Canada(5)>Bosnia(6)>Qatar(7)
-- C: Brasil(9)>Marokko(10)>Skottland(12)>Haiti(11)
-- D: USA(13)>Paraguay(14)>Australia(15)>Tyrkia(16)
-- E: Tyskland(17)>Ecuador(20)>Elfenbenskysten(19)>Curaçao(18)
-- F: Nederland(21)>Sverige(23)>Japan(22)>Tunisia(24)
-- G: Belgia(25)>Egypt(26)>Iran(27)>New Zealand(28)
-- H: Spania(29)>Uruguay(32)>Kapp Verde(30)>Saudi-Arabia(31)
-- I: Frankrike(33)>Senegal(34)>Norge(36)>Irak(35)
-- J: Argentina(37)>Østerrike(39)>Algerie(38)>Jordan(40)
-- K: Portugal(41)>DR Kongo(42)>Colombia(44)>Usbekistan(43)
-- L: England(45)>Kroatia(46)>Ghana(47)>Panama(48)

UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=1;  -- Mexico-Sør-Afrika
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=2;  -- Sør-Korea-Tsjekkia
UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=3;  -- Mexico-Sør-Korea
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=4;  -- Sør-Afrika-Tsjekkia
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=5;  -- Tsjekkia-Mexico
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=6;  -- Sør-Afrika-Sør-Korea

UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=7;  -- Canada-Bosnia
UPDATE matches SET home_score=0, away_score=3, is_played=true WHERE match_number=8;  -- Qatar-Sveits
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=9;  -- Canada-Qatar
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=10; -- Sveits-Bosnia
UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=11; -- Sveits-Canada
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=12; -- Bosnia-Qatar

UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=13; -- Brasil-Marokko
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=14; -- Haiti-Skottland
UPDATE matches SET home_score=3, away_score=1, is_played=true WHERE match_number=15; -- Brasil-Haiti
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=16; -- Skottland-Marokko
UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=17; -- Marokko-Haiti
UPDATE matches SET home_score=0, away_score=1, is_played=true WHERE match_number=18; -- Skottland-Brasil

UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=19; -- USA-Paraguay
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=20; -- Australia-Tyrkia
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=21; -- USA-Australia
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=22; -- Tyrkia-Paraguay
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=23; -- Tyrkia-USA
UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=24; -- Paraguay-Australia

UPDATE matches SET home_score=4, away_score=0, is_played=true WHERE match_number=25; -- Tyskland-Curaçao
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=26; -- Elfenbenskysten-Ecuador
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=27; -- Tyskland-Elfenbenskysten
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=28; -- Ecuador-Curaçao
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=29; -- Tyskland-Ecuador
UPDATE matches SET home_score=0, away_score=1, is_played=true WHERE match_number=30; -- Curaçao-Elfenbenskysten

UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=31; -- Nederland-Japan
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=32; -- Sverige-Tunisia
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=33; -- Nederland-Sverige
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=34; -- Tunisia-Japan
UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=35; -- Nederland-Tunisia
UPDATE matches SET home_score=0, away_score=1, is_played=true WHERE match_number=36; -- Japan-Sverige

UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=37; -- Belgia-Egypt
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=38; -- Iran-New Zealand
UPDATE matches SET home_score=3, away_score=1, is_played=true WHERE match_number=39; -- Belgia-Iran
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=40; -- New Zealand-Egypt
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=41; -- Belgia-New Zealand
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=42; -- Egypt-Iran

UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=43; -- Spania-Kapp Verde
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=44; -- Saudi-Arabia-Uruguay
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=45; -- Spania-Saudi-Arabia
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=46; -- Uruguay-Kapp Verde
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=47; -- Uruguay-Spania
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=48; -- Kapp Verde-Saudi-Arabia

UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=49; -- Frankrike-Senegal
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=50; -- Irak-Norge
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=51; -- Frankrike-Irak
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=52; -- Norge-Senegal
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=53; -- Frankrike-Norge
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=54; -- Senegal-Irak

UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=55; -- Argentina-Algerie
UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=56; -- Østerrike-Jordan
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=57; -- Argentina-Østerrike
UPDATE matches SET home_score=1, away_score=3, is_played=true WHERE match_number=58; -- Jordan-Algerie
UPDATE matches SET home_score=4, away_score=0, is_played=true WHERE match_number=59; -- Argentina-Jordan
UPDATE matches SET home_score=1, away_score=2, is_played=true WHERE match_number=60; -- Algerie-Østerrike

UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=61; -- Portugal-DR Kongo
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=62; -- Usbekistan-Colombia
UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=63; -- Portugal-Usbekistan
UPDATE matches SET home_score=0, away_score=1, is_played=true WHERE match_number=64; -- Colombia-DR Kongo
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=65; -- Portugal-Colombia
UPDATE matches SET home_score=2, away_score=0, is_played=true WHERE match_number=66; -- DR Kongo-Usbekistan

UPDATE matches SET home_score=3, away_score=0, is_played=true WHERE match_number=67; -- England-Panama
UPDATE matches SET home_score=1, away_score=0, is_played=true WHERE match_number=68; -- Kroatia-Ghana
UPDATE matches SET home_score=1, away_score=1, is_played=true WHERE match_number=69; -- England-Kroatia
UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=70; -- Ghana-Panama
UPDATE matches SET home_score=2, away_score=1, is_played=true WHERE match_number=71; -- England-Ghana
UPDATE matches SET home_score=0, away_score=2, is_played=true WHERE match_number=72; -- Panama-Kroatia


-- ── 3. SLUTTSPILL: SETT LAG + RESULTATER ─────────────────────
-- Best 8 tredjeplass (rangert etter poeng/GD):
--   #1 Sør-Korea(3) 4p, #2 Norge(36) 4p,
--   #3 Skottland(12) 3p, #4 Elfenbenskysten(19) 3p,
--   #5 Japan(22) 3p,     #6 Algerie(38) 3p,
--   #7 Colombia(44) 3p,  #8 Ghana(47) 3p
-- Tildelt til 3T-plasser i THIRD_SLOTS_ORDER: [74,77,79,80,81,82,85,87]

-- 16-DELSFINALE (R32)
UPDATE matches SET home_team_id=2,  away_team_id=5,  home_score=2, away_score=1, is_played=true WHERE match_number=73;  -- Sør-Afrika-Canada
UPDATE matches SET home_team_id=17, away_team_id=3,  home_score=3, away_score=0, is_played=true WHERE match_number=74;  -- Tyskland-Sør-Korea
UPDATE matches SET home_team_id=21, away_team_id=10, home_score=2, away_score=0, is_played=true WHERE match_number=75;  -- Nederland-Marokko
UPDATE matches SET home_team_id=9,  away_team_id=23, home_score=2, away_score=1, is_played=true WHERE match_number=76;  -- Brasil-Sverige
UPDATE matches SET home_team_id=33, away_team_id=36, home_score=2, away_score=0, is_played=true WHERE match_number=77;  -- Frankrike-Norge
UPDATE matches SET home_team_id=20, away_team_id=34, home_score=0, away_score=1, is_played=true WHERE match_number=78;  -- Ecuador-Senegal
UPDATE matches SET home_team_id=1,  away_team_id=12, home_score=2, away_score=0, is_played=true WHERE match_number=79;  -- Mexico-Skottland
UPDATE matches SET home_team_id=45, away_team_id=19, home_score=3, away_score=1, is_played=true WHERE match_number=80;  -- England-Elfenbenskysten
UPDATE matches SET home_team_id=13, away_team_id=22, home_score=2, away_score=1, is_played=true WHERE match_number=81;  -- USA-Japan
UPDATE matches SET home_team_id=25, away_team_id=38, home_score=3, away_score=0, is_played=true WHERE match_number=82;  -- Belgia-Algerie
UPDATE matches SET home_team_id=42, away_team_id=46, home_score=1, away_score=2, is_played=true WHERE match_number=83;  -- DR Kongo-Kroatia
UPDATE matches SET home_team_id=29, away_team_id=39, home_score=3, away_score=0, is_played=true WHERE match_number=84;  -- Spania-Østerrike
UPDATE matches SET home_team_id=8,  away_team_id=44, home_score=2, away_score=0, is_played=true WHERE match_number=85;  -- Sveits-Colombia
UPDATE matches SET home_team_id=37, away_team_id=32, home_score=3, away_score=1, is_played=true WHERE match_number=86;  -- Argentina-Uruguay
UPDATE matches SET home_team_id=41, away_team_id=47, home_score=2, away_score=0, is_played=true WHERE match_number=87;  -- Portugal-Ghana
UPDATE matches SET home_team_id=14, away_team_id=26, home_score=1, away_score=0, is_played=true WHERE match_number=88;  -- Paraguay-Egypt

-- 8-DELSFINALE (R16)
UPDATE matches SET home_team_id=2,  away_team_id=17, home_score=0, away_score=3, is_played=true WHERE match_number=89;  -- Sør-Afrika-Tyskland
UPDATE matches SET home_team_id=21, away_team_id=9,  home_score=1, away_score=2, is_played=true WHERE match_number=90;  -- Nederland-Brasil
UPDATE matches SET home_team_id=33, away_team_id=34, home_score=2, away_score=0, is_played=true WHERE match_number=91;  -- Frankrike-Senegal
UPDATE matches SET home_team_id=1,  away_team_id=45, home_score=1, away_score=2, is_played=true WHERE match_number=92;  -- Mexico-England
UPDATE matches SET home_team_id=13, away_team_id=25, home_score=1, away_score=2, is_played=true WHERE match_number=93;  -- USA-Belgia
UPDATE matches SET home_team_id=46, away_team_id=29, home_score=0, away_score=2, is_played=true WHERE match_number=94;  -- Kroatia-Spania
UPDATE matches SET home_team_id=8,  away_team_id=37, home_score=1, away_score=2, is_played=true WHERE match_number=95;  -- Sveits-Argentina
UPDATE matches SET home_team_id=41, away_team_id=14, home_score=2, away_score=0, is_played=true WHERE match_number=96;  -- Portugal-Paraguay

-- KVARTFINALE
UPDATE matches SET home_team_id=17, away_team_id=9,  home_score=2, away_score=1, is_played=true WHERE match_number=97;  -- Tyskland-Brasil
UPDATE matches SET home_team_id=33, away_team_id=45, home_score=1, away_score=0, is_played=true WHERE match_number=98;  -- Frankrike-England
UPDATE matches SET home_team_id=25, away_team_id=29, home_score=1, away_score=2, is_played=true WHERE match_number=99;  -- Belgia-Spania
UPDATE matches SET home_team_id=37, away_team_id=41, home_score=3, away_score=1, is_played=true WHERE match_number=100; -- Argentina-Portugal

-- SEMIFINALE
UPDATE matches SET home_team_id=17, away_team_id=33, home_score=1, away_score=2, is_played=true WHERE match_number=101; -- Tyskland-Frankrike
UPDATE matches SET home_team_id=29, away_team_id=37, home_score=0, away_score=2, is_played=true WHERE match_number=102; -- Spania-Argentina

-- BRONSEFINALE
UPDATE matches SET home_team_id=17, away_team_id=29, home_score=1, away_score=3, is_played=true WHERE match_number=103; -- Tyskland-Spania

-- FINALE – Argentina vinner VM!
UPDATE matches SET home_team_id=33, away_team_id=37, home_score=2, away_score=3, is_played=true WHERE match_number=104; -- Frankrike-Argentina


-- ── 4. TILFELDIGE TIPSNINGER FOR ALLE BRUKERE ────────────────
-- Alle 12 brukere tipper alle 104 kamper med tilfeldige resultater (0–3 mål)
INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
SELECT
  u.id,
  m.id,
  floor(random() * 4)::int,
  floor(random() * 4)::int
FROM app_users u
CROSS JOIN matches m
ON CONFLICT (user_id, match_id) DO NOTHING;
