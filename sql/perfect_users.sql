-- ============================================================
-- VM 2026 – To perfekte testbrukere
-- Kjør ETTER test_data.sql (som setter is_played=true på alle kamper).
-- Begge logger inn med PIN: 1234
-- ============================================================

-- Slett gamle perfekt-brukere hvis de finnes fra en tidligere kjøring
DELETE FROM app_users WHERE username IN ('Perfekt Utfall', 'Perfekt Eksakt');

INSERT INTO app_users (username, pin_hash) VALUES
('Perfekt Utfall', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
('Perfekt Eksakt', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');

-- ── PERFEKT UTFALL ────────────────────────────────────────────
-- Riktig 1X2 på alle 104 kamper, men aldri eksakt resultat.
-- Metode: legg +1 på begge mål for uavgjort, +1 på vinnerlaget ellers.
-- Eksempel: faktisk 2-1 → tipper 3-1 (riktig utfall, feil score)
-- Eksempel: faktisk 1-1 → tipper 2-2 (riktig utfall, feil score)
INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
SELECT
  (SELECT id FROM app_users WHERE username = 'Perfekt Utfall'),
  m.id,
  CASE
    WHEN m.home_score > m.away_score THEN m.home_score + 1
    WHEN m.home_score = m.away_score THEN m.home_score + 1
    ELSE m.home_score
  END,
  CASE
    WHEN m.home_score > m.away_score THEN m.away_score
    WHEN m.home_score = m.away_score THEN m.away_score + 1
    ELSE m.away_score + 1
  END
FROM matches m
WHERE m.is_played = true
ON CONFLICT (user_id, match_id) DO NOTHING;

-- ── PERFEKT EKSAKT ────────────────────────────────────────────
-- Riktig eksakt resultat på alle 104 kamper.
-- Gir maksimal poengsum: utfall + eksakt bonus på hver kamp.
INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
SELECT
  (SELECT id FROM app_users WHERE username = 'Perfekt Eksakt'),
  m.id,
  m.home_score,
  m.away_score
FROM matches m
WHERE m.is_played = true
ON CONFLICT (user_id, match_id) DO NOTHING;
