// ============================================================
// VM 2026 Tipping – Konfigurasjon
// Fyll inn dine Supabase-nøkler og passord-hasher.
// Se README.md for instruksjoner.
// ============================================================

const CONFIG = {
  // --- Supabase ---
  SUPABASE_URL:      'https://kblsizgfnvedyxwbhdos.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibHNpemdmbnZlZHl4d2JoZG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA1MDAsImV4cCI6MjA5NTU0NjUwMH0.McaWy1ogj_jWDaTQFYwMb1nnsdACYs8k-wx3sDBqSqU',

  // Ingen nettstedspassord – hvem som helst med linken kan gå inn
  ADMIN_PASSWORD_HASH: '6d9ea5efaf7a7db5f966c4587ae0639d0fa12a80f658a69725df7411e6427fa8',

  // Tippefrist: 7. juni 2026 kl. 20:00 norsk tid (CEST = UTC+2)
  DEADLINE: new Date('2026-06-07T18:00:00Z'),

  // --- Poengsystem ---
  SCORING: {
    group: { exact: 3, outcome: 1 },
    r32:   { exact: 4, outcome: 2 },
    r16:   { exact: 5, outcome: 2 },
    qf:    { exact: 6, outcome: 3 },
    sf:    { exact: 7, outcome: 3 },
    '3rd': { exact: 8, outcome: 4 },
    final: { exact: 10, outcome: 5 },
  },

  // --- Prisprediksjon-poeng ---
  AWARD_SCORING: {
    exact:         10,  // Riktig spiller, riktig plassering
    wrong_position: 5, // Riktig spiller, feil plassering (innen topp 3)
  },

  // --- Runde-navn (norsk) ---
  STAGE_NAMES: {
    group: 'Gruppespill',
    r32:   'Runde av 32',
    r16:   'Runde av 16',
    qf:    'Kvartfinale',
    sf:    'Semifinale',
    '3rd': 'Bronsefinale',
    final: 'FINALE',
  },
};
