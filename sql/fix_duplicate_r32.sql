-- ============================================================
-- Fix: remove the blank R32 duplicates added by insert_knockout_matches.sql
-- The real R32 matches (with team IDs and dates) are kept.
-- ============================================================

DELETE FROM matches
WHERE stage = 'r32'
  AND home_team_id IS NULL
  AND away_team_id IS NULL;
