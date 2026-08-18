// ============================================================
// PL-Tipping – Oppsett
// Sjå README.md for instruksjonar.
// ============================================================

const CONFIG = {
  // --- Supabase (prosjekt: pl-tipping, org: Rekegutta) ---
  SUPABASE_URL:      'https://fhlkpbtznkgrkmwdjmyr.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_JVsRztHtcgfZHdwnWvxLoA_fg93037r',

  // Ikkje noko nettstadpassord – kven som helst med lenkja kjem inn
  ADMIN_PASSWORD_HASH: '6d9ea5efaf7a7db5f966c4587ae0639d0fa12a80f658a69725df7411e6427fa8',

  // --- Sesong ---
  // Desse er berre reserve. Dei verkelege verdiane ligg i tabellen
  // pl_settings og kan endrast i admin-panelet.
  SEASON:   '2026/27',
  DEADLINE: new Date('2026-08-21T17:30:00Z'),   // fredag 21. aug 2026, 19:30 norsk tid

  // --- Tabellsoner (plassering → farge/etikett) ---
  ZONES: [
    { from: 1,  to: 4,  cls: 'zone-ucl', label: 'Meisterligaen' },
    { from: 5,  to: 5,  cls: 'zone-uel', label: 'Europaligaen'  },
    { from: 6,  to: 6,  cls: 'zone-uec', label: 'Conference'    },
    { from: 18, to: 20, cls: 'zone-rel', label: 'Nedrykk'       },
  ],

  TEAM_COUNT: 20,

  // --- Premiering ---
  PRIZES: [
    ['1. plass', '70%'],
    ['2. plass', '20%'],
    ['3. plass', '10%'],
  ],
};

function zoneFor(pos) {
  const z = CONFIG.ZONES.find(z => pos >= z.from && pos <= z.to);
  return z ? z.cls : '';
}
