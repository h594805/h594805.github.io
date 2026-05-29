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
    group: { outcome: 3, exact: 3  },
    r32:   { outcome: 3, exact: 4  },
    r16:   { outcome: 3, exact: 5  },
    qf:    { outcome: 3, exact: 6  },
    sf:    { outcome: 3, exact: 7  },
    '3rd': { outcome: 3, exact: 8  },
    final: { outcome: 5, exact: 10 },
  },

  // --- Prisprediksjon-poeng ---
  AWARD_SCORING: {
    exact:         10,  // Riktig spiller, riktig plassering
    wrong_position: 5, // Riktig spiller, feil plassering (innen topp 3)
  },

  // --- Runde-navn (norsk) ---
  STAGE_NAMES: {
    group:  'Gruppespill',
    thirds: 'Beste treere',
    r32:    '16-delsfinale',
    r16:   '8-delsfinale',
    qf:    'Kvartfinale',
    sf:    'Semifinale',
    '3rd': 'Bronsefinale',
    final: 'FINALE',
  },
};
