-- ============================================================
-- VM 2026 – Full database reset
-- Sletter all data og resetter alle sekvenser (ID-tellere).
-- Kjør dette i Supabase SQL Editor, deretter kjør seed.sql.
-- ============================================================

TRUNCATE
  predictions,
  award_predictions,
  match_goalscorers,
  award_results,
  matches,
  app_users,
  teams
RESTART IDENTITY CASCADE;

-- Gjenopprett den ene nødvendige raden i award_results
INSERT INTO award_results (id) VALUES (1) ON CONFLICT DO NOTHING;
