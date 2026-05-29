-- =============================================================
-- Gard-prediksjoner: importer alle 104 kamper + priser + treere
-- Kjør i Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_uid  INT;
  v_apid INT;
BEGIN

  -- Finn brukeren via pin_hash
  SELECT id INTO v_uid
  FROM app_users
  WHERE pin_hash = 'e81d47bc1914daacdfe3670959ae7f749fd47976471fc68ed00041f6150c80b6';

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Fant ikke brukeren (feil pin_hash?)';
  END IF;

  -- Slett eksisterende kampspådommer
  DELETE FROM predictions WHERE user_id = v_uid;

  -- Sett inn 104 kampspådommer
  INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
  SELECT v_uid, m.id, p.h, p.a
  FROM (VALUES
    (1, 2, 1),
    (2, 1, 1),
    (3, 2, 1),
    (4, 2, 0),
    (5, 1, 2),
    (6, 1, 2),
    (7, 2, 1),
    (8, 0, 2),
    (9, 2, 0),
    (10, 1, 1),
    (11, 2, 1),
    (12, 2, 0),
    (13, 2, 1),
    (14, 0, 2),
    (15, 4, 0),
    (16, 0, 1),
    (17, 2, 0),
    (18, 0, 2),
    (19, 2, 1),
    (20, 1, 2),
    (21, 2, 0),
    (22, 1, 1),
    (23, 1, 1),
    (24, 2, 1),
    (25, 3, 0),
    (26, 1, 1),
    (27, 2, 1),
    (28, 2, 0),
    (29, 1, 3),
    (30, 0, 2),
    (31, 2, 1),
    (32, 1, 0),
    (33, 2, 1),
    (34, 1, 1),
    (35, 0, 2),
    (36, 2, 1),
    (37, 2, 1),
    (38, 1, 0),
    (39, 2, 1),
    (40, 1, 1),
    (41, 0, 3),
    (42, 2, 1),
    (43, 3, 0),
    (44, 0, 2),
    (45, 3, 0),
    (46, 2, 0),
    (47, 1, 2),
    (48, 1, 1),
    (49, 2, 1),
    (50, 0, 2),
    (51, 3, 0),
    (52, 2, 1),
    (53, 1, 2),
    (54, 2, 0),
    (55, 2, 0),
    (56, 2, 0),
    (57, 2, 1),
    (58, 0, 1),
    (59, 0, 3),
    (60, 1, 1),
    (61, 3, 0),
    (62, 1, 2),
    (63, 2, 0),
    (64, 2, 0),
    (65, 1, 2),
    (66, 1, 1),
    (67, 0, 4),
    (68, 1, 1),
    (69, 2, 1),
    (70, 2, 0),
    (71, 3, 1),
    (72, 0, 2),
    (73, 2, 1),
    (74, 2, 0),
    (75, 2, 1),
    (76, 2, 0),
    (77, 3, 0),
    (78, 1, 2),
    (79, 2, 1),
    (80, 2, 0),
    (81, 2, 1),
    (82, 2, 1),
    (83, 1, 2),
    (84, 3, 0),
    (85, 2, 0),
    (86, 2, 1),
    (87, 3, 1),
    (88, 1, 0),
    (89, 1, 2),
    (90, 0, 2),
    (91, 1, 2),
    (92, 1, 2),
    (93, 0, 2),
    (94, 1, 2),
    (95, 2, 0),
    (96, 0, 2),
    (97, 2, 1),
    (98, 2, 1),
    (99, 1, 2),
    (100, 2, 1),
    (101, 2, 1),
    (102, 1, 2),
    (103, 2, 1),
    (104, 2, 1)
  ) AS p(match_number, h, a)
  JOIN matches m ON m.match_number = p.match_number;

  -- Award-prediksjoner + tredjeplass-tiebreaker
  SELECT id INTO v_apid FROM award_predictions WHERE user_id = v_uid;

  IF v_apid IS NULL THEN
    INSERT INTO award_predictions (
      user_id,
      best_player_1, best_player_2, best_player_3,
      top_scorer_1,  top_scorer_2,  top_scorer_3,
      third_tiebreaker
    ) VALUES (
      v_uid,
      'Kylian Mbappe', 'Lionel Messi', 'Lamine Yamal',
      'Kylian Mbappe', 'Harry Kane',   'Erling Haaland',
      '[6,47,20,14,3,38,34,27]'
    );
  ELSE
    UPDATE award_predictions SET
      best_player_1    = 'Kylian Mbappe',
      best_player_2    = 'Lionel Messi',
      best_player_3    = 'Lamine Yamal',
      top_scorer_1     = 'Kylian Mbappe',
      top_scorer_2     = 'Harry Kane',
      top_scorer_3     = 'Erling Haaland',
      third_tiebreaker = '[6,47,20,14,3,38,34,27]',
      updated_at       = NOW()
    WHERE id = v_apid;
  END IF;

END $$;
