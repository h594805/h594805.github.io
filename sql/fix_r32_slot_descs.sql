-- =============================================================
-- Oppdater slot-beskrivelser for 16-delsfinalen
-- slik at de matcher VG Live sin offisielle beskrivelse.
-- Kjør i Supabase SQL Editor.
-- =============================================================

UPDATE matches SET home_slot_desc='Nr. 2 Gruppe A', away_slot_desc='Nr. 2 Gruppe B'           WHERE match_number=73;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe E', away_slot_desc='3A/3B/3C/3D/3F'           WHERE match_number=74;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe F', away_slot_desc='Nr. 2 Gruppe C'            WHERE match_number=75;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe C', away_slot_desc='Nr. 2 Gruppe F'            WHERE match_number=76;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe I', away_slot_desc='3C/3D/3F/3G/3H'           WHERE match_number=77;
UPDATE matches SET home_slot_desc='Nr. 2 Gruppe E', away_slot_desc='Nr. 2 Gruppe I'            WHERE match_number=78;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe A', away_slot_desc='3C/3E/3F/3H/3I'           WHERE match_number=79;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe L', away_slot_desc='3E/3H/3I/3J/3K'           WHERE match_number=80;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe D', away_slot_desc='3B/3E/3F/3I/3J'           WHERE match_number=81;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe G', away_slot_desc='3A/3E/3H/3I/3J'           WHERE match_number=82;
UPDATE matches SET home_slot_desc='Nr. 2 Gruppe K', away_slot_desc='Nr. 2 Gruppe L'            WHERE match_number=83;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe H', away_slot_desc='Nr. 2 Gruppe J'            WHERE match_number=84;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe B', away_slot_desc='3E/3F/3G/3I/3J'           WHERE match_number=85;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe J', away_slot_desc='Nr. 2 Gruppe H'            WHERE match_number=86;
UPDATE matches SET home_slot_desc='Nr. 1 Gruppe K', away_slot_desc='3D/3E/3I/3J/3L'           WHERE match_number=87;
UPDATE matches SET home_slot_desc='Nr. 2 Gruppe D', away_slot_desc='Nr. 2 Gruppe G'            WHERE match_number=88;
