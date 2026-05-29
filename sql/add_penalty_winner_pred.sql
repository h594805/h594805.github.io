-- Add penalty winner prediction for knockout draw scenarios
-- Run this once against the existing Supabase database
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS penalty_winner_pred VARCHAR(4)
    CHECK (penalty_winner_pred IN ('home', 'away'));
