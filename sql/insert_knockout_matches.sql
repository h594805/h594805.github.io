-- ============================================================
-- VM 2026 – Insert sluttspill-kamper R16 → Final (89–104)
-- Kjør dette én gang i Supabase SQL Editor.
-- R32 (73–88) er allerede i databasen med ekte lag og datoer.
-- Denne SQL-en hopper over kamper som allerede finnes.
-- ============================================================

INSERT INTO matches (match_number, stage, home_slot_desc, away_slot_desc)
SELECT v.match_number, v.stage, v.home_slot_desc, v.away_slot_desc
FROM (VALUES
  -- ── ÅTTEDELSFINALE / RUNDE AV 16 (8 kamper) ─────────────
  (89,  'r16',   'Vinner kamp 73',       'Vinner kamp 74'),
  (90,  'r16',   'Vinner kamp 75',       'Vinner kamp 76'),
  (91,  'r16',   'Vinner kamp 77',       'Vinner kamp 78'),
  (92,  'r16',   'Vinner kamp 79',       'Vinner kamp 80'),
  (93,  'r16',   'Vinner kamp 81',       'Vinner kamp 82'),
  (94,  'r16',   'Vinner kamp 83',       'Vinner kamp 84'),
  (95,  'r16',   'Vinner kamp 85',       'Vinner kamp 86'),
  (96,  'r16',   'Vinner kamp 87',       'Vinner kamp 88'),

  -- ── KVARTFINALE (4 kamper) ───────────────────────────────
  (97,  'qf',    'Vinner kamp 89',       'Vinner kamp 90'),
  (98,  'qf',    'Vinner kamp 91',       'Vinner kamp 92'),
  (99,  'qf',    'Vinner kamp 93',       'Vinner kamp 94'),
  (100, 'qf',    'Vinner kamp 95',       'Vinner kamp 96'),

  -- ── SEMIFINALE (2 kamper) ────────────────────────────────
  (101, 'sf',    'Vinner kamp 97',       'Vinner kamp 98'),
  (102, 'sf',    'Vinner kamp 99',       'Vinner kamp 100'),

  -- ── BRONSEFINALE ─────────────────────────────────────────
  (103, '3rd',   'Taper semifinale 1',   'Taper semifinale 2'),

  -- ── FINALE ───────────────────────────────────────────────
  (104, 'final', 'Vinner semifinale 1',  'Vinner semifinale 2')

) AS v(match_number, stage, home_slot_desc, away_slot_desc)
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE match_number = v.match_number
);
