-- ============================================================
-- Legg til tiebreaker-kolonne for tredjeplass-rekkefølge
-- Kjør én gang i Supabase SQL Editor
-- ============================================================
ALTER TABLE award_predictions
  ADD COLUMN IF NOT EXISTS third_tiebreaker TEXT;
