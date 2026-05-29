// ============================================================
// VM 2026 – Bracket-beregning
// Beregner forventet sluttspill basert på brukerens tipsninger.
// ============================================================

const Bracket = {
  GROUPS: 'ABCDEFGHIJKL'.split(''),

  // R32: [homeSlot, awaySlot].  '3T' = best third-place team.
  R32_SLOTS: {
    73: ['2A','2B'], 74: ['1E','3T'], 75: ['1F','2C'], 76: ['1C','2F'],
    77: ['1I','3T'], 78: ['2E','2I'], 79: ['1A','3T'], 80: ['1L','3T'],
    81: ['1D','3T'], 82: ['1G','3T'], 83: ['2K','2L'], 84: ['1H','2J'],
    85: ['1B','3T'], 86: ['1J','2H'], 87: ['1K','3T'], 88: ['2D','2G'],
  },

  // Match slots that receive a 3rd-place team, ordered as [1A,1B,1D,1E,1G,1I,1K,1L]
  THIRD_MATCH_SLOTS: [79, 85, 81, 74, 82, 77, 87, 80],

  // FIFA 2026 lookup table: sorted 8-group combination -> [slot_1A,slot_1B,slot_1D,slot_1E,slot_1G,slot_1I,slot_1K,slot_1L]
  THIRD_PLACE_LOOKUP: {
    'EFGHIJKL': ['3E','3J','3I','3F','3H','3G','3L','3K'],
    'DFGHIJKL': ['3H','3G','3I','3D','3J','3F','3L','3K'],
    'DEGHIJKL': ['3E','3J','3I','3D','3H','3G','3L','3K'],
    'DEFHIJKL': ['3E','3J','3I','3D','3H','3F','3L','3K'],
    'DEFGIJKL': ['3E','3G','3I','3D','3J','3F','3L','3K'],
    'DEFGHJKL': ['3E','3G','3J','3D','3H','3F','3L','3K'],
    'DEFGHIKL': ['3E','3G','3I','3D','3H','3F','3L','3K'],
    'DEFGHIJL': ['3E','3G','3J','3D','3H','3F','3L','3I'],
    'DEFGHIJK': ['3E','3G','3J','3D','3H','3F','3I','3K'],
    'CFGHIJKL': ['3H','3G','3I','3C','3J','3F','3L','3K'],
    'CEGHIJKL': ['3E','3J','3I','3C','3H','3G','3L','3K'],
    'CEFHIJKL': ['3E','3J','3I','3C','3H','3F','3L','3K'],
    'CEFGIJKL': ['3E','3G','3I','3C','3J','3F','3L','3K'],
    'CEFGHJKL': ['3E','3G','3J','3C','3H','3F','3L','3K'],
    'CEFGHIKL': ['3E','3G','3I','3C','3H','3F','3L','3K'],
    'CEFGHIJL': ['3E','3G','3J','3C','3H','3F','3L','3I'],
    'CEFGHIJK': ['3E','3G','3J','3C','3H','3F','3I','3K'],
    'CDGHIJKL': ['3H','3G','3I','3C','3J','3D','3L','3K'],
    'CDFHIJKL': ['3C','3J','3I','3D','3H','3F','3L','3K'],
    'CDFGIJKL': ['3C','3G','3I','3D','3J','3F','3L','3K'],
    'CDFGHJKL': ['3C','3G','3J','3D','3H','3F','3L','3K'],
    'CDFGHIKL': ['3C','3G','3I','3D','3H','3F','3L','3K'],
    'CDFGHIJL': ['3C','3G','3J','3D','3H','3F','3L','3I'],
    'CDFGHIJK': ['3C','3G','3J','3D','3H','3F','3I','3K'],
    'CDEHIJKL': ['3E','3J','3I','3C','3H','3D','3L','3K'],
    'CDEGIJKL': ['3E','3G','3I','3C','3J','3D','3L','3K'],
    'CDEGHJKL': ['3E','3G','3J','3C','3H','3D','3L','3K'],
    'CDEGHIKL': ['3E','3G','3I','3C','3H','3D','3L','3K'],
    'CDEGHIJL': ['3E','3G','3J','3C','3H','3D','3L','3I'],
    'CDEGHIJK': ['3E','3G','3J','3C','3H','3D','3I','3K'],
    'CDEFIJKL': ['3C','3J','3E','3D','3I','3F','3L','3K'],
    'CDEFHJKL': ['3C','3J','3E','3D','3H','3F','3L','3K'],
    'CDEFHIKL': ['3C','3E','3I','3D','3H','3F','3L','3K'],
    'CDEFHIJL': ['3C','3J','3E','3D','3H','3F','3L','3I'],
    'CDEFHIJK': ['3C','3J','3E','3D','3H','3F','3I','3K'],
    'CDEFGJKL': ['3C','3G','3E','3D','3J','3F','3L','3K'],
    'CDEFGIKL': ['3C','3G','3E','3D','3I','3F','3L','3K'],
    'CDEFGIJL': ['3C','3G','3E','3D','3J','3F','3L','3I'],
    'CDEFGIJK': ['3C','3G','3E','3D','3J','3F','3I','3K'],
    'CDEFGHKL': ['3C','3G','3E','3D','3H','3F','3L','3K'],
    'CDEFGHJL': ['3C','3G','3J','3D','3H','3F','3L','3E'],
    'CDEFGHJK': ['3C','3G','3J','3D','3H','3F','3E','3K'],
    'CDEFGHIL': ['3C','3G','3E','3D','3H','3F','3L','3I'],
    'CDEFGHIK': ['3C','3G','3E','3D','3H','3F','3I','3K'],
    'CDEFGHIJ': ['3C','3G','3J','3D','3H','3F','3E','3I'],
    'BFGHIJKL': ['3H','3J','3B','3F','3I','3G','3L','3K'],
    'BEGHIJKL': ['3E','3J','3I','3B','3H','3G','3L','3K'],
    'BEFHIJKL': ['3E','3J','3B','3F','3I','3H','3L','3K'],
    'BEFGIJKL': ['3E','3J','3B','3F','3I','3G','3L','3K'],
    'BEFGHJKL': ['3E','3J','3B','3F','3H','3G','3L','3K'],
    'BEFGHIKL': ['3E','3G','3B','3F','3I','3H','3L','3K'],
    'BEFGHIJL': ['3E','3J','3B','3F','3H','3G','3L','3I'],
    'BEFGHIJK': ['3E','3J','3B','3F','3H','3G','3I','3K'],
    'BDGHIJKL': ['3H','3J','3B','3D','3I','3G','3L','3K'],
    'BDFHIJKL': ['3H','3J','3B','3D','3I','3F','3L','3K'],
    'BDFGIJKL': ['3I','3G','3B','3D','3J','3F','3L','3K'],
    'BDFGHJKL': ['3H','3G','3B','3D','3J','3F','3L','3K'],
    'BDFGHIKL': ['3H','3G','3B','3D','3I','3F','3L','3K'],
    'BDFGHIJL': ['3H','3G','3B','3D','3J','3F','3L','3I'],
    'BDFGHIJK': ['3H','3G','3B','3D','3J','3F','3I','3K'],
    'BDEHIJKL': ['3E','3J','3B','3D','3I','3H','3L','3K'],
    'BDEGIJKL': ['3E','3J','3B','3D','3I','3G','3L','3K'],
    'BDEGHJKL': ['3E','3J','3B','3D','3H','3G','3L','3K'],
    'BDEGHIKL': ['3E','3G','3B','3D','3I','3H','3L','3K'],
    'BDEGHIJL': ['3E','3J','3B','3D','3H','3G','3L','3I'],
    'BDEGHIJK': ['3E','3J','3B','3D','3H','3G','3I','3K'],
    'BDEFIJKL': ['3E','3J','3B','3D','3I','3F','3L','3K'],
    'BDEFHJKL': ['3E','3J','3B','3D','3H','3F','3L','3K'],
    'BDEFHIKL': ['3E','3I','3B','3D','3H','3F','3L','3K'],
    'BDEFHIJL': ['3E','3J','3B','3D','3H','3F','3L','3I'],
    'BDEFHIJK': ['3E','3J','3B','3D','3H','3F','3I','3K'],
    'BDEFGJKL': ['3E','3G','3B','3D','3J','3F','3L','3K'],
    'BDEFGIKL': ['3E','3G','3B','3D','3I','3F','3L','3K'],
    'BDEFGIJL': ['3E','3G','3B','3D','3J','3F','3L','3I'],
    'BDEFGIJK': ['3E','3G','3B','3D','3J','3F','3I','3K'],
    'BDEFGHKL': ['3E','3G','3B','3D','3H','3F','3L','3K'],
    'BDEFGHJL': ['3H','3G','3B','3D','3J','3F','3L','3E'],
    'BDEFGHJK': ['3H','3G','3B','3D','3J','3F','3E','3K'],
    'BDEFGHIL': ['3E','3G','3B','3D','3H','3F','3L','3I'],
    'BDEFGHIK': ['3E','3G','3B','3D','3H','3F','3I','3K'],
    'BDEFGHIJ': ['3H','3G','3B','3D','3J','3F','3E','3I'],
    'BCGHIJKL': ['3H','3J','3B','3C','3I','3G','3L','3K'],
    'BCFHIJKL': ['3H','3J','3B','3C','3I','3F','3L','3K'],
    'BCFGIJKL': ['3I','3G','3B','3C','3J','3F','3L','3K'],
    'BCFGHJKL': ['3H','3G','3B','3C','3J','3F','3L','3K'],
    'BCFGHIKL': ['3H','3G','3B','3C','3I','3F','3L','3K'],
    'BCFGHIJL': ['3H','3G','3B','3C','3J','3F','3L','3I'],
    'BCFGHIJK': ['3H','3G','3B','3C','3J','3F','3I','3K'],
    'BCEHIJKL': ['3E','3J','3B','3C','3I','3H','3L','3K'],
    'BCEGIJKL': ['3E','3J','3B','3C','3I','3G','3L','3K'],
    'BCEGHJKL': ['3E','3J','3B','3C','3H','3G','3L','3K'],
    'BCEGHIKL': ['3E','3G','3B','3C','3I','3H','3L','3K'],
    'BCEGHIJL': ['3E','3J','3B','3C','3H','3G','3L','3I'],
    'BCEGHIJK': ['3E','3J','3B','3C','3H','3G','3I','3K'],
    'BCEFIJKL': ['3E','3J','3B','3C','3I','3F','3L','3K'],
    'BCEFHJKL': ['3E','3J','3B','3C','3H','3F','3L','3K'],
    'BCEFHIKL': ['3E','3I','3B','3C','3H','3F','3L','3K'],
    'BCEFHIJL': ['3E','3J','3B','3C','3H','3F','3L','3I'],
    'BCEFHIJK': ['3E','3J','3B','3C','3H','3F','3I','3K'],
    'BCEFGJKL': ['3E','3G','3B','3C','3J','3F','3L','3K'],
    'BCEFGIKL': ['3E','3G','3B','3C','3I','3F','3L','3K'],
    'BCEFGIJL': ['3E','3G','3B','3C','3J','3F','3L','3I'],
    'BCEFGIJK': ['3E','3G','3B','3C','3J','3F','3I','3K'],
    'BCEFGHKL': ['3E','3G','3B','3C','3H','3F','3L','3K'],
    'BCEFGHJL': ['3H','3G','3B','3C','3J','3F','3L','3E'],
    'BCEFGHJK': ['3H','3G','3B','3C','3J','3F','3E','3K'],
    'BCEFGHIL': ['3E','3G','3B','3C','3H','3F','3L','3I'],
    'BCEFGHIK': ['3E','3G','3B','3C','3H','3F','3I','3K'],
    'BCEFGHIJ': ['3H','3G','3B','3C','3J','3F','3E','3I'],
    'BCDHIJKL': ['3H','3J','3B','3C','3I','3D','3L','3K'],
    'BCDGIJKL': ['3I','3G','3B','3C','3J','3D','3L','3K'],
    'BCDGHJKL': ['3H','3G','3B','3C','3J','3D','3L','3K'],
    'BCDGHIKL': ['3H','3G','3B','3C','3I','3D','3L','3K'],
    'BCDGHIJL': ['3H','3G','3B','3C','3J','3D','3L','3I'],
    'BCDGHIJK': ['3H','3G','3B','3C','3J','3D','3I','3K'],
    'BCDFIJKL': ['3C','3J','3B','3D','3I','3F','3L','3K'],
    'BCDFHJKL': ['3C','3J','3B','3D','3H','3F','3L','3K'],
    'BCDFHIKL': ['3C','3I','3B','3D','3H','3F','3L','3K'],
    'BCDFHIJL': ['3C','3J','3B','3D','3H','3F','3L','3I'],
    'BCDFHIJK': ['3C','3J','3B','3D','3H','3F','3I','3K'],
    'BCDFGJKL': ['3C','3G','3B','3D','3J','3F','3L','3K'],
    'BCDFGIKL': ['3C','3G','3B','3D','3I','3F','3L','3K'],
    'BCDFGIJL': ['3C','3G','3B','3D','3J','3F','3L','3I'],
    'BCDFGIJK': ['3C','3G','3B','3D','3J','3F','3I','3K'],
    'BCDFGHKL': ['3C','3G','3B','3D','3H','3F','3L','3K'],
    'BCDFGHJL': ['3C','3G','3B','3D','3H','3F','3L','3J'],
    'BCDFGHJK': ['3H','3G','3B','3C','3J','3F','3D','3K'],
    'BCDFGHIL': ['3C','3G','3B','3D','3H','3F','3L','3I'],
    'BCDFGHIK': ['3C','3G','3B','3D','3H','3F','3I','3K'],
    'BCDFGHIJ': ['3H','3G','3B','3C','3J','3F','3D','3I'],
    'BCDEIJKL': ['3E','3J','3B','3C','3I','3D','3L','3K'],
    'BCDEHJKL': ['3E','3J','3B','3C','3H','3D','3L','3K'],
    'BCDEHIKL': ['3E','3I','3B','3C','3H','3D','3L','3K'],
    'BCDEHIJL': ['3E','3J','3B','3C','3H','3D','3L','3I'],
    'BCDEHIJK': ['3E','3J','3B','3C','3H','3D','3I','3K'],
    'BCDEGJKL': ['3E','3G','3B','3C','3J','3D','3L','3K'],
    'BCDEGIKL': ['3E','3G','3B','3C','3I','3D','3L','3K'],
    'BCDEGIJL': ['3E','3G','3B','3C','3J','3D','3L','3I'],
    'BCDEGIJK': ['3E','3G','3B','3C','3J','3D','3I','3K'],
    'BCDEGHKL': ['3E','3G','3B','3C','3H','3D','3L','3K'],
    'BCDEGHJL': ['3H','3G','3B','3C','3J','3D','3L','3E'],
    'BCDEGHJK': ['3H','3G','3B','3C','3J','3D','3E','3K'],
    'BCDEGHIL': ['3E','3G','3B','3C','3H','3D','3L','3I'],
    'BCDEGHIK': ['3E','3G','3B','3C','3H','3D','3I','3K'],
    'BCDEGHIJ': ['3H','3G','3B','3C','3J','3D','3E','3I'],
    'BCDEFJKL': ['3C','3J','3B','3D','3E','3F','3L','3K'],
    'BCDEFIKL': ['3C','3E','3B','3D','3I','3F','3L','3K'],
    'BCDEFIJL': ['3C','3J','3B','3D','3E','3F','3L','3I'],
    'BCDEFIJK': ['3C','3J','3B','3D','3E','3F','3I','3K'],
    'BCDEFHKL': ['3C','3E','3B','3D','3H','3F','3L','3K'],
    'BCDEFHJL': ['3C','3J','3B','3D','3H','3F','3L','3E'],
    'BCDEFHJK': ['3C','3J','3B','3D','3H','3F','3E','3K'],
    'BCDEFHIL': ['3C','3E','3B','3D','3H','3F','3L','3I'],
    'BCDEFHIK': ['3C','3E','3B','3D','3H','3F','3I','3K'],
    'BCDEFHIJ': ['3C','3J','3B','3D','3H','3F','3E','3I'],
    'BCDEFGKL': ['3C','3G','3B','3D','3E','3F','3L','3K'],
    'BCDEFGJL': ['3C','3G','3B','3D','3J','3F','3L','3E'],
    'BCDEFGJK': ['3C','3G','3B','3D','3J','3F','3E','3K'],
    'BCDEFGIL': ['3C','3G','3B','3D','3E','3F','3L','3I'],
    'BCDEFGIK': ['3C','3G','3B','3D','3E','3F','3I','3K'],
    'BCDEFGIJ': ['3C','3G','3B','3D','3J','3F','3E','3I'],
    'BCDEFGHL': ['3C','3G','3B','3D','3H','3F','3L','3E'],
    'BCDEFGHK': ['3C','3G','3B','3D','3H','3F','3E','3K'],
    'BCDEFGHJ': ['3H','3G','3B','3C','3J','3F','3D','3E'],
    'BCDEFGHI': ['3C','3G','3B','3D','3H','3F','3E','3I'],
    'AFGHIJKL': ['3H','3J','3I','3F','3A','3G','3L','3K'],
    'AEGHIJKL': ['3E','3J','3I','3A','3H','3G','3L','3K'],
    'AEFHIJKL': ['3E','3J','3I','3F','3A','3H','3L','3K'],
    'AEFGIJKL': ['3E','3J','3I','3F','3A','3G','3L','3K'],
    'AEFGHJKL': ['3E','3G','3J','3F','3A','3H','3L','3K'],
    'AEFGHIKL': ['3E','3G','3I','3F','3A','3H','3L','3K'],
    'AEFGHIJL': ['3E','3G','3J','3F','3A','3H','3L','3I'],
    'AEFGHIJK': ['3E','3G','3J','3F','3A','3H','3I','3K'],
    'ADGHIJKL': ['3H','3J','3I','3D','3A','3G','3L','3K'],
    'ADFHIJKL': ['3H','3J','3I','3D','3A','3F','3L','3K'],
    'ADFGIJKL': ['3I','3G','3J','3D','3A','3F','3L','3K'],
    'ADFGHJKL': ['3H','3G','3J','3D','3A','3F','3L','3K'],
    'ADFGHIKL': ['3H','3G','3I','3D','3A','3F','3L','3K'],
    'ADFGHIJL': ['3H','3G','3J','3D','3A','3F','3L','3I'],
    'ADFGHIJK': ['3H','3G','3J','3D','3A','3F','3I','3K'],
    'ADEHIJKL': ['3E','3J','3I','3D','3A','3H','3L','3K'],
    'ADEGIJKL': ['3E','3J','3I','3D','3A','3G','3L','3K'],
    'ADEGHJKL': ['3E','3G','3J','3D','3A','3H','3L','3K'],
    'ADEGHIKL': ['3E','3G','3I','3D','3A','3H','3L','3K'],
    'ADEGHIJL': ['3E','3G','3J','3D','3A','3H','3L','3I'],
    'ADEGHIJK': ['3E','3G','3J','3D','3A','3H','3I','3K'],
    'ADEFIJKL': ['3E','3J','3I','3D','3A','3F','3L','3K'],
    'ADEFHJKL': ['3H','3J','3E','3D','3A','3F','3L','3K'],
    'ADEFHIKL': ['3H','3E','3I','3D','3A','3F','3L','3K'],
    'ADEFHIJL': ['3H','3J','3E','3D','3A','3F','3L','3I'],
    'ADEFHIJK': ['3H','3J','3E','3D','3A','3F','3I','3K'],
    'ADEFGJKL': ['3E','3G','3J','3D','3A','3F','3L','3K'],
    'ADEFGIKL': ['3E','3G','3I','3D','3A','3F','3L','3K'],
    'ADEFGIJL': ['3E','3G','3J','3D','3A','3F','3L','3I'],
    'ADEFGIJK': ['3E','3G','3J','3D','3A','3F','3I','3K'],
    'ADEFGHKL': ['3H','3G','3E','3D','3A','3F','3L','3K'],
    'ADEFGHJL': ['3H','3G','3J','3D','3A','3F','3L','3E'],
    'ADEFGHJK': ['3H','3G','3J','3D','3A','3F','3E','3K'],
    'ADEFGHIL': ['3H','3G','3E','3D','3A','3F','3L','3I'],
    'ADEFGHIK': ['3H','3G','3E','3D','3A','3F','3I','3K'],
    'ADEFGHIJ': ['3H','3G','3J','3D','3A','3F','3E','3I'],
    'ACGHIJKL': ['3H','3J','3I','3C','3A','3G','3L','3K'],
    'ACFHIJKL': ['3H','3J','3I','3C','3A','3F','3L','3K'],
    'ACFGIJKL': ['3I','3G','3J','3C','3A','3F','3L','3K'],
    'ACFGHJKL': ['3H','3G','3J','3C','3A','3F','3L','3K'],
    'ACFGHIKL': ['3H','3G','3I','3C','3A','3F','3L','3K'],
    'ACFGHIJL': ['3H','3G','3J','3C','3A','3F','3L','3I'],
    'ACFGHIJK': ['3H','3G','3J','3C','3A','3F','3I','3K'],
    'ACEHIJKL': ['3E','3J','3I','3C','3A','3H','3L','3K'],
    'ACEGIJKL': ['3E','3J','3I','3C','3A','3G','3L','3K'],
    'ACEGHJKL': ['3E','3G','3J','3C','3A','3H','3L','3K'],
    'ACEGHIKL': ['3E','3G','3I','3C','3A','3H','3L','3K'],
    'ACEGHIJL': ['3E','3G','3J','3C','3A','3H','3L','3I'],
    'ACEGHIJK': ['3E','3G','3J','3C','3A','3H','3I','3K'],
    'ACEFIJKL': ['3E','3J','3I','3C','3A','3F','3L','3K'],
    'ACEFHJKL': ['3H','3J','3E','3C','3A','3F','3L','3K'],
    'ACEFHIKL': ['3H','3E','3I','3C','3A','3F','3L','3K'],
    'ACEFHIJL': ['3H','3J','3E','3C','3A','3F','3L','3I'],
    'ACEFHIJK': ['3H','3J','3E','3C','3A','3F','3I','3K'],
    'ACEFGJKL': ['3E','3G','3J','3C','3A','3F','3L','3K'],
    'ACEFGIKL': ['3E','3G','3I','3C','3A','3F','3L','3K'],
    'ACEFGIJL': ['3E','3G','3J','3C','3A','3F','3L','3I'],
    'ACEFGIJK': ['3E','3G','3J','3C','3A','3F','3I','3K'],
    'ACEFGHKL': ['3H','3G','3E','3C','3A','3F','3L','3K'],
    'ACEFGHJL': ['3H','3G','3J','3C','3A','3F','3L','3E'],
    'ACEFGHJK': ['3H','3G','3J','3C','3A','3F','3E','3K'],
    'ACEFGHIL': ['3H','3G','3E','3C','3A','3F','3L','3I'],
    'ACEFGHIK': ['3H','3G','3E','3C','3A','3F','3I','3K'],
    'ACEFGHIJ': ['3H','3G','3J','3C','3A','3F','3E','3I'],
    'ACDHIJKL': ['3H','3J','3I','3C','3A','3D','3L','3K'],
    'ACDGIJKL': ['3I','3G','3J','3C','3A','3D','3L','3K'],
    'ACDGHJKL': ['3H','3G','3J','3C','3A','3D','3L','3K'],
    'ACDGHIKL': ['3H','3G','3I','3C','3A','3D','3L','3K'],
    'ACDGHIJL': ['3H','3G','3J','3C','3A','3D','3L','3I'],
    'ACDGHIJK': ['3H','3G','3J','3C','3A','3D','3I','3K'],
    'ACDFIJKL': ['3C','3J','3I','3D','3A','3F','3L','3K'],
    'ACDFHJKL': ['3H','3J','3F','3C','3A','3D','3L','3K'],
    'ACDFHIKL': ['3H','3F','3I','3C','3A','3D','3L','3K'],
    'ACDFHIJL': ['3H','3J','3F','3C','3A','3D','3L','3I'],
    'ACDFHIJK': ['3H','3J','3F','3C','3A','3D','3I','3K'],
    'ACDFGJKL': ['3C','3G','3J','3D','3A','3F','3L','3K'],
    'ACDFGIKL': ['3C','3G','3I','3D','3A','3F','3L','3K'],
    'ACDFGIJL': ['3C','3G','3J','3D','3A','3F','3L','3I'],
    'ACDFGIJK': ['3C','3G','3J','3D','3A','3F','3I','3K'],
    'ACDFGHKL': ['3H','3G','3F','3C','3A','3D','3L','3K'],
    'ACDFGHJL': ['3C','3G','3J','3D','3A','3F','3L','3H'],
    'ACDFGHJK': ['3H','3G','3J','3C','3A','3F','3D','3K'],
    'ACDFGHIL': ['3H','3G','3F','3C','3A','3D','3L','3I'],
    'ACDFGHIK': ['3H','3G','3F','3C','3A','3D','3I','3K'],
    'ACDFGHIJ': ['3H','3G','3J','3C','3A','3F','3D','3I'],
    'ACDEIJKL': ['3E','3J','3I','3C','3A','3D','3L','3K'],
    'ACDEHJKL': ['3H','3J','3E','3C','3A','3D','3L','3K'],
    'ACDEHIKL': ['3H','3E','3I','3C','3A','3D','3L','3K'],
    'ACDEHIJL': ['3H','3J','3E','3C','3A','3D','3L','3I'],
    'ACDEHIJK': ['3H','3J','3E','3C','3A','3D','3I','3K'],
    'ACDEGJKL': ['3E','3G','3J','3C','3A','3D','3L','3K'],
    'ACDEGIKL': ['3E','3G','3I','3C','3A','3D','3L','3K'],
    'ACDEGIJL': ['3E','3G','3J','3C','3A','3D','3L','3I'],
    'ACDEGIJK': ['3E','3G','3J','3C','3A','3D','3I','3K'],
    'ACDEGHKL': ['3H','3G','3E','3C','3A','3D','3L','3K'],
    'ACDEGHJL': ['3H','3G','3J','3C','3A','3D','3L','3E'],
    'ACDEGHJK': ['3H','3G','3J','3C','3A','3D','3E','3K'],
    'ACDEGHIL': ['3H','3G','3E','3C','3A','3D','3L','3I'],
    'ACDEGHIK': ['3H','3G','3E','3C','3A','3D','3I','3K'],
    'ACDEGHIJ': ['3H','3G','3J','3C','3A','3D','3E','3I'],
    'ACDEFJKL': ['3C','3J','3E','3D','3A','3F','3L','3K'],
    'ACDEFIKL': ['3C','3E','3I','3D','3A','3F','3L','3K'],
    'ACDEFIJL': ['3C','3J','3E','3D','3A','3F','3L','3I'],
    'ACDEFIJK': ['3C','3J','3E','3D','3A','3F','3I','3K'],
    'ACDEFHKL': ['3H','3E','3F','3C','3A','3D','3L','3K'],
    'ACDEFHJL': ['3H','3J','3F','3C','3A','3D','3L','3E'],
    'ACDEFHJK': ['3H','3J','3E','3C','3A','3F','3D','3K'],
    'ACDEFHIL': ['3H','3E','3F','3C','3A','3D','3L','3I'],
    'ACDEFHIK': ['3H','3E','3F','3C','3A','3D','3I','3K'],
    'ACDEFHIJ': ['3H','3J','3E','3C','3A','3F','3D','3I'],
    'ACDEFGKL': ['3C','3G','3E','3D','3A','3F','3L','3K'],
    'ACDEFGJL': ['3C','3G','3J','3D','3A','3F','3L','3E'],
    'ACDEFGJK': ['3C','3G','3J','3D','3A','3F','3E','3K'],
    'ACDEFGIL': ['3C','3G','3E','3D','3A','3F','3L','3I'],
    'ACDEFGIK': ['3C','3G','3E','3D','3A','3F','3I','3K'],
    'ACDEFGIJ': ['3C','3G','3J','3D','3A','3F','3E','3I'],
    'ACDEFGHL': ['3H','3G','3F','3C','3A','3D','3L','3E'],
    'ACDEFGHK': ['3H','3G','3E','3C','3A','3F','3D','3K'],
    'ACDEFGHJ': ['3H','3G','3J','3C','3A','3F','3D','3E'],
    'ACDEFGHI': ['3H','3G','3E','3C','3A','3F','3D','3I'],
    'ABGHIJKL': ['3H','3J','3B','3A','3I','3G','3L','3K'],
    'ABFHIJKL': ['3H','3J','3B','3A','3I','3F','3L','3K'],
    'ABFGIJKL': ['3I','3J','3B','3F','3A','3G','3L','3K'],
    'ABFGHJKL': ['3H','3J','3B','3F','3A','3G','3L','3K'],
    'ABFGHIKL': ['3H','3G','3B','3A','3I','3F','3L','3K'],
    'ABFGHIJL': ['3H','3J','3B','3F','3A','3G','3L','3I'],
    'ABFGHIJK': ['3H','3J','3B','3F','3A','3G','3I','3K'],
    'ABEHIJKL': ['3E','3J','3B','3A','3I','3H','3L','3K'],
    'ABEGIJKL': ['3E','3J','3B','3A','3I','3G','3L','3K'],
    'ABEGHJKL': ['3E','3J','3B','3A','3H','3G','3L','3K'],
    'ABEGHIKL': ['3E','3G','3B','3A','3I','3H','3L','3K'],
    'ABEGHIJL': ['3E','3J','3B','3A','3H','3G','3L','3I'],
    'ABEGHIJK': ['3E','3J','3B','3A','3H','3G','3I','3K'],
    'ABEFIJKL': ['3E','3J','3B','3A','3I','3F','3L','3K'],
    'ABEFHJKL': ['3E','3J','3B','3F','3A','3H','3L','3K'],
    'ABEFHIKL': ['3E','3I','3B','3F','3A','3H','3L','3K'],
    'ABEFHIJL': ['3E','3J','3B','3F','3A','3H','3L','3I'],
    'ABEFHIJK': ['3E','3J','3B','3F','3A','3H','3I','3K'],
    'ABEFGJKL': ['3E','3J','3B','3F','3A','3G','3L','3K'],
    'ABEFGIKL': ['3E','3G','3B','3A','3I','3F','3L','3K'],
    'ABEFGIJL': ['3E','3J','3B','3F','3A','3G','3L','3I'],
    'ABEFGIJK': ['3E','3J','3B','3F','3A','3G','3I','3K'],
    'ABEFGHKL': ['3E','3G','3B','3F','3A','3H','3L','3K'],
    'ABEFGHJL': ['3H','3J','3B','3F','3A','3G','3L','3E'],
    'ABEFGHJK': ['3H','3J','3B','3F','3A','3G','3E','3K'],
    'ABEFGHIL': ['3E','3G','3B','3F','3A','3H','3L','3I'],
    'ABEFGHIK': ['3E','3G','3B','3F','3A','3H','3I','3K'],
    'ABEFGHIJ': ['3H','3J','3B','3F','3A','3G','3E','3I'],
    'ABDHIJKL': ['3I','3J','3B','3D','3A','3H','3L','3K'],
    'ABDGIJKL': ['3I','3J','3B','3D','3A','3G','3L','3K'],
    'ABDGHJKL': ['3H','3J','3B','3D','3A','3G','3L','3K'],
    'ABDGHIKL': ['3I','3G','3B','3D','3A','3H','3L','3K'],
    'ABDGHIJL': ['3H','3J','3B','3D','3A','3G','3L','3I'],
    'ABDGHIJK': ['3H','3J','3B','3D','3A','3G','3I','3K'],
    'ABDFIJKL': ['3I','3J','3B','3D','3A','3F','3L','3K'],
    'ABDFHJKL': ['3H','3J','3B','3D','3A','3F','3L','3K'],
    'ABDFHIKL': ['3H','3I','3B','3D','3A','3F','3L','3K'],
    'ABDFHIJL': ['3H','3J','3B','3D','3A','3F','3L','3I'],
    'ABDFHIJK': ['3H','3J','3B','3D','3A','3F','3I','3K'],
    'ABDFGJKL': ['3F','3J','3B','3D','3A','3G','3L','3K'],
    'ABDFGIKL': ['3I','3G','3B','3D','3A','3F','3L','3K'],
    'ABDFGIJL': ['3F','3J','3B','3D','3A','3G','3L','3I'],
    'ABDFGIJK': ['3F','3J','3B','3D','3A','3G','3I','3K'],
    'ABDFGHKL': ['3H','3G','3B','3D','3A','3F','3L','3K'],
    'ABDFGHJL': ['3H','3G','3B','3D','3A','3F','3L','3J'],
    'ABDFGHJK': ['3H','3G','3B','3D','3A','3F','3J','3K'],
    'ABDFGHIL': ['3H','3G','3B','3D','3A','3F','3L','3I'],
    'ABDFGHIK': ['3H','3G','3B','3D','3A','3F','3I','3K'],
    'ABDFGHIJ': ['3H','3G','3B','3D','3A','3F','3I','3J'],
    'ABDEIJKL': ['3E','3J','3B','3A','3I','3D','3L','3K'],
    'ABDEHJKL': ['3E','3J','3B','3D','3A','3H','3L','3K'],
    'ABDEHIKL': ['3E','3I','3B','3D','3A','3H','3L','3K'],
    'ABDEHIJL': ['3E','3J','3B','3D','3A','3H','3L','3I'],
    'ABDEHIJK': ['3E','3J','3B','3D','3A','3H','3I','3K'],
    'ABDEGJKL': ['3E','3J','3B','3D','3A','3G','3L','3K'],
    'ABDEGIKL': ['3E','3G','3B','3A','3I','3D','3L','3K'],
    'ABDEGIJL': ['3E','3J','3B','3D','3A','3G','3L','3I'],
    'ABDEGIJK': ['3E','3J','3B','3D','3A','3G','3I','3K'],
    'ABDEGHKL': ['3E','3G','3B','3D','3A','3H','3L','3K'],
    'ABDEGHJL': ['3H','3J','3B','3D','3A','3G','3L','3E'],
    'ABDEGHJK': ['3H','3J','3B','3D','3A','3G','3E','3K'],
    'ABDEGHIL': ['3E','3G','3B','3D','3A','3H','3L','3I'],
    'ABDEGHIK': ['3E','3G','3B','3D','3A','3H','3I','3K'],
    'ABDEGHIJ': ['3H','3J','3B','3D','3A','3G','3E','3I'],
    'ABDEFJKL': ['3E','3J','3B','3D','3A','3F','3L','3K'],
    'ABDEFIKL': ['3E','3I','3B','3D','3A','3F','3L','3K'],
    'ABDEFIJL': ['3E','3J','3B','3D','3A','3F','3L','3I'],
    'ABDEFIJK': ['3E','3J','3B','3D','3A','3F','3I','3K'],
    'ABDEFHKL': ['3H','3E','3B','3D','3A','3F','3L','3K'],
    'ABDEFHJL': ['3H','3J','3B','3D','3A','3F','3L','3E'],
    'ABDEFHJK': ['3H','3J','3B','3D','3A','3F','3E','3K'],
    'ABDEFHIL': ['3H','3E','3B','3D','3A','3F','3L','3I'],
    'ABDEFHIK': ['3H','3E','3B','3D','3A','3F','3I','3K'],
    'ABDEFHIJ': ['3H','3J','3B','3D','3A','3F','3E','3I'],
    'ABDEFGKL': ['3E','3G','3B','3D','3A','3F','3L','3K'],
    'ABDEFGJL': ['3E','3G','3B','3D','3A','3F','3L','3J'],
    'ABDEFGJK': ['3E','3G','3B','3D','3A','3F','3J','3K'],
    'ABDEFGIL': ['3E','3G','3B','3D','3A','3F','3L','3I'],
    'ABDEFGIK': ['3E','3G','3B','3D','3A','3F','3I','3K'],
    'ABDEFGIJ': ['3E','3G','3B','3D','3A','3F','3I','3J'],
    'ABDEFGHL': ['3H','3G','3B','3D','3A','3F','3L','3E'],
    'ABDEFGHK': ['3H','3G','3B','3D','3A','3F','3E','3K'],
    'ABDEFGHJ': ['3H','3G','3B','3D','3A','3F','3E','3J'],
    'ABDEFGHI': ['3H','3G','3B','3D','3A','3F','3E','3I'],
    'ABCHIJKL': ['3I','3J','3B','3C','3A','3H','3L','3K'],
    'ABCGIJKL': ['3I','3J','3B','3C','3A','3G','3L','3K'],
    'ABCGHJKL': ['3H','3J','3B','3C','3A','3G','3L','3K'],
    'ABCGHIKL': ['3I','3G','3B','3C','3A','3H','3L','3K'],
    'ABCGHIJL': ['3H','3J','3B','3C','3A','3G','3L','3I'],
    'ABCGHIJK': ['3H','3J','3B','3C','3A','3G','3I','3K'],
    'ABCFIJKL': ['3I','3J','3B','3C','3A','3F','3L','3K'],
    'ABCFHJKL': ['3H','3J','3B','3C','3A','3F','3L','3K'],
    'ABCFHIKL': ['3H','3I','3B','3C','3A','3F','3L','3K'],
    'ABCFHIJL': ['3H','3J','3B','3C','3A','3F','3L','3I'],
    'ABCFHIJK': ['3H','3J','3B','3C','3A','3F','3I','3K'],
    'ABCFGJKL': ['3C','3J','3B','3F','3A','3G','3L','3K'],
    'ABCFGIKL': ['3I','3G','3B','3C','3A','3F','3L','3K'],
    'ABCFGIJL': ['3C','3J','3B','3F','3A','3G','3L','3I'],
    'ABCFGIJK': ['3C','3J','3B','3F','3A','3G','3I','3K'],
    'ABCFGHKL': ['3H','3G','3B','3C','3A','3F','3L','3K'],
    'ABCFGHJL': ['3H','3G','3B','3C','3A','3F','3L','3J'],
    'ABCFGHJK': ['3H','3G','3B','3C','3A','3F','3J','3K'],
    'ABCFGHIL': ['3H','3G','3B','3C','3A','3F','3L','3I'],
    'ABCFGHIK': ['3H','3G','3B','3C','3A','3F','3I','3K'],
    'ABCFGHIJ': ['3H','3G','3B','3C','3A','3F','3I','3J'],
    'ABCEIJKL': ['3E','3J','3B','3A','3I','3C','3L','3K'],
    'ABCEHJKL': ['3E','3J','3B','3C','3A','3H','3L','3K'],
    'ABCEHIKL': ['3E','3I','3B','3C','3A','3H','3L','3K'],
    'ABCEHIJL': ['3E','3J','3B','3C','3A','3H','3L','3I'],
    'ABCEHIJK': ['3E','3J','3B','3C','3A','3H','3I','3K'],
    'ABCEGJKL': ['3E','3J','3B','3C','3A','3G','3L','3K'],
    'ABCEGIKL': ['3E','3G','3B','3A','3I','3C','3L','3K'],
    'ABCEGIJL': ['3E','3J','3B','3C','3A','3G','3L','3I'],
    'ABCEGIJK': ['3E','3J','3B','3C','3A','3G','3I','3K'],
    'ABCEGHKL': ['3E','3G','3B','3C','3A','3H','3L','3K'],
    'ABCEGHJL': ['3H','3J','3B','3C','3A','3G','3L','3E'],
    'ABCEGHJK': ['3H','3J','3B','3C','3A','3G','3E','3K'],
    'ABCEGHIL': ['3E','3G','3B','3C','3A','3H','3L','3I'],
    'ABCEGHIK': ['3E','3G','3B','3C','3A','3H','3I','3K'],
    'ABCEGHIJ': ['3H','3J','3B','3C','3A','3G','3E','3I'],
    'ABCEFJKL': ['3E','3J','3B','3C','3A','3F','3L','3K'],
    'ABCEFIKL': ['3E','3I','3B','3C','3A','3F','3L','3K'],
    'ABCEFIJL': ['3E','3J','3B','3C','3A','3F','3L','3I'],
    'ABCEFIJK': ['3E','3J','3B','3C','3A','3F','3I','3K'],
    'ABCEFHKL': ['3H','3E','3B','3C','3A','3F','3L','3K'],
    'ABCEFHJL': ['3H','3J','3B','3C','3A','3F','3L','3E'],
    'ABCEFHJK': ['3H','3J','3B','3C','3A','3F','3E','3K'],
    'ABCEFHIL': ['3H','3E','3B','3C','3A','3F','3L','3I'],
    'ABCEFHIK': ['3H','3E','3B','3C','3A','3F','3I','3K'],
    'ABCEFHIJ': ['3H','3J','3B','3C','3A','3F','3E','3I'],
    'ABCEFGKL': ['3E','3G','3B','3C','3A','3F','3L','3K'],
    'ABCEFGJL': ['3E','3G','3B','3C','3A','3F','3L','3J'],
    'ABCEFGJK': ['3E','3G','3B','3C','3A','3F','3J','3K'],
    'ABCEFGIL': ['3E','3G','3B','3C','3A','3F','3L','3I'],
    'ABCEFGIK': ['3E','3G','3B','3C','3A','3F','3I','3K'],
    'ABCEFGIJ': ['3E','3G','3B','3C','3A','3F','3I','3J'],
    'ABCEFGHL': ['3H','3G','3B','3C','3A','3F','3L','3E'],
    'ABCEFGHK': ['3H','3G','3B','3C','3A','3F','3E','3K'],
    'ABCEFGHJ': ['3H','3G','3B','3C','3A','3F','3E','3J'],
    'ABCEFGHI': ['3H','3G','3B','3C','3A','3F','3E','3I'],
    'ABCDIJKL': ['3I','3J','3B','3C','3A','3D','3L','3K'],
    'ABCDHJKL': ['3H','3J','3B','3C','3A','3D','3L','3K'],
    'ABCDHIKL': ['3H','3I','3B','3C','3A','3D','3L','3K'],
    'ABCDHIJL': ['3H','3J','3B','3C','3A','3D','3L','3I'],
    'ABCDHIJK': ['3H','3J','3B','3C','3A','3D','3I','3K'],
    'ABCDGJKL': ['3C','3J','3B','3D','3A','3G','3L','3K'],
    'ABCDGIKL': ['3I','3G','3B','3C','3A','3D','3L','3K'],
    'ABCDGIJL': ['3C','3J','3B','3D','3A','3G','3L','3I'],
    'ABCDGIJK': ['3C','3J','3B','3D','3A','3G','3I','3K'],
    'ABCDGHKL': ['3H','3G','3B','3C','3A','3D','3L','3K'],
    'ABCDGHJL': ['3H','3G','3B','3C','3A','3D','3L','3J'],
    'ABCDGHJK': ['3H','3G','3B','3C','3A','3D','3J','3K'],
    'ABCDGHIL': ['3H','3G','3B','3C','3A','3D','3L','3I'],
    'ABCDGHIK': ['3H','3G','3B','3C','3A','3D','3I','3K'],
    'ABCDGHIJ': ['3H','3G','3B','3C','3A','3D','3I','3J'],
    'ABCDFJKL': ['3C','3J','3B','3D','3A','3F','3L','3K'],
    'ABCDFIKL': ['3C','3I','3B','3D','3A','3F','3L','3K'],
    'ABCDFIJL': ['3C','3J','3B','3D','3A','3F','3L','3I'],
    'ABCDFIJK': ['3C','3J','3B','3D','3A','3F','3I','3K'],
    'ABCDFHKL': ['3H','3F','3B','3C','3A','3D','3L','3K'],
    'ABCDFHJL': ['3C','3J','3B','3D','3A','3F','3L','3H'],
    'ABCDFHJK': ['3H','3J','3B','3C','3A','3F','3D','3K'],
    'ABCDFHIL': ['3H','3F','3B','3C','3A','3D','3L','3I'],
    'ABCDFHIK': ['3H','3F','3B','3C','3A','3D','3I','3K'],
    'ABCDFHIJ': ['3H','3J','3B','3C','3A','3F','3D','3I'],
    'ABCDFGKL': ['3C','3G','3B','3D','3A','3F','3L','3K'],
    'ABCDFGJL': ['3C','3G','3B','3D','3A','3F','3L','3J'],
    'ABCDFGJK': ['3C','3G','3B','3D','3A','3F','3J','3K'],
    'ABCDFGIL': ['3C','3G','3B','3D','3A','3F','3L','3I'],
    'ABCDFGIK': ['3C','3G','3B','3D','3A','3F','3I','3K'],
    'ABCDFGIJ': ['3C','3G','3B','3D','3A','3F','3I','3J'],
    'ABCDFGHL': ['3C','3G','3B','3D','3A','3F','3L','3H'],
    'ABCDFGHK': ['3H','3G','3B','3C','3A','3F','3D','3K'],
    'ABCDFGHJ': ['3H','3G','3B','3C','3A','3F','3D','3J'],
    'ABCDFGHI': ['3H','3G','3B','3C','3A','3F','3D','3I'],
    'ABCDEJKL': ['3E','3J','3B','3C','3A','3D','3L','3K'],
    'ABCDEIKL': ['3E','3I','3B','3C','3A','3D','3L','3K'],
    'ABCDEIJL': ['3E','3J','3B','3C','3A','3D','3L','3I'],
    'ABCDEIJK': ['3E','3J','3B','3C','3A','3D','3I','3K'],
    'ABCDEHKL': ['3H','3E','3B','3C','3A','3D','3L','3K'],
    'ABCDEHJL': ['3H','3J','3B','3C','3A','3D','3L','3E'],
    'ABCDEHJK': ['3H','3J','3B','3C','3A','3D','3E','3K'],
    'ABCDEHIL': ['3H','3E','3B','3C','3A','3D','3L','3I'],
    'ABCDEHIK': ['3H','3E','3B','3C','3A','3D','3I','3K'],
    'ABCDEHIJ': ['3H','3J','3B','3C','3A','3D','3E','3I'],
    'ABCDEGKL': ['3E','3G','3B','3C','3A','3D','3L','3K'],
    'ABCDEGJL': ['3E','3G','3B','3C','3A','3D','3L','3J'],
    'ABCDEGJK': ['3E','3G','3B','3C','3A','3D','3J','3K'],
    'ABCDEGIL': ['3E','3G','3B','3C','3A','3D','3L','3I'],
    'ABCDEGIK': ['3E','3G','3B','3C','3A','3D','3I','3K'],
    'ABCDEGIJ': ['3E','3G','3B','3C','3A','3D','3I','3J'],
    'ABCDEGHL': ['3H','3G','3B','3C','3A','3D','3L','3E'],
    'ABCDEGHK': ['3H','3G','3B','3C','3A','3D','3E','3K'],
    'ABCDEGHJ': ['3H','3G','3B','3C','3A','3D','3E','3J'],
    'ABCDEGHI': ['3H','3G','3B','3C','3A','3D','3E','3I'],
    'ABCDEFKL': ['3C','3E','3B','3D','3A','3F','3L','3K'],
    'ABCDEFJL': ['3C','3J','3B','3D','3A','3F','3L','3E'],
    'ABCDEFJK': ['3C','3J','3B','3D','3A','3F','3E','3K'],
    'ABCDEFIL': ['3C','3E','3B','3D','3A','3F','3L','3I'],
    'ABCDEFIK': ['3C','3E','3B','3D','3A','3F','3I','3K'],
    'ABCDEFIJ': ['3C','3J','3B','3D','3A','3F','3E','3I'],
    'ABCDEFHL': ['3H','3F','3B','3C','3A','3D','3L','3E'],
    'ABCDEFHK': ['3H','3E','3B','3C','3A','3F','3D','3K'],
    'ABCDEFHJ': ['3H','3J','3B','3C','3A','3F','3D','3E'],
    'ABCDEFHI': ['3H','3E','3B','3C','3A','3F','3D','3I'],
    'ABCDEFGL': ['3C','3G','3B','3D','3A','3F','3L','3E'],
    'ABCDEFGK': ['3C','3G','3B','3D','3A','3F','3E','3K'],
    'ABCDEFGJ': ['3C','3G','3B','3D','3A','3F','3E','3J'],
    'ABCDEFGI': ['3C','3G','3B','3D','3A','3F','3E','3I'],
    'ABCDEFGH': ['3H','3G','3B','3C','3A','3F','3D','3E'],
  },

  // For each R16+ match: [homeFeederMatchNum, awayFeederMatchNum]
  // Match 103 (3rd place) feeds from LOSERS; all others from WINNERS
  FEEDERS: {
    89:[74,77], 90:[73,75], 91:[76,78], 92:[79,80],
    93:[83,84], 94:[81,82], 95:[86,88], 96:[85,87],
    97:[89,90], 98:[93,94], 99:[91,92], 100:[95,96],
    101:[97,98], 102:[99,100],
    103:[101,102],   // 3rd place: losers of both SF
    104:[101,102],   // final:     winners of both SF
  },

  // Predicted group standings from user's score predictions
  calcGroupStandings(groupLetter, predictions, teams, matches) {
    const groupTeams   = teams.filter(t => t.group_letter === groupLetter);
    const groupMatches = matches.filter(m => m.stage === 'group' && m.group_letter === groupLetter);

    const tbl = {};
    for (const t of groupTeams) tbl[t.id] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 };

    for (const m of groupMatches) {
      const p = predictions.find(pr => pr.match_id === m.id);
      if (!p || p.home_score_pred == null || p.away_score_pred == null) continue;
      const h = p.home_score_pred, a = p.away_score_pred;
      if (tbl[m.home_team_id]) { tbl[m.home_team_id].gf += h; tbl[m.home_team_id].ga += a; tbl[m.home_team_id].gd += h - a; }
      if (tbl[m.away_team_id]) { tbl[m.away_team_id].gf += a; tbl[m.away_team_id].ga += h; tbl[m.away_team_id].gd += a - h; }
      if (h > a) {
        if (tbl[m.home_team_id]) { tbl[m.home_team_id].pts += 3; tbl[m.home_team_id].w++; }
        if (tbl[m.away_team_id]) tbl[m.away_team_id].l++;
      } else if (h < a) {
        if (tbl[m.away_team_id]) { tbl[m.away_team_id].pts += 3; tbl[m.away_team_id].w++; }
        if (tbl[m.home_team_id]) tbl[m.home_team_id].l++;
      } else {
        if (tbl[m.home_team_id]) { tbl[m.home_team_id].pts += 1; tbl[m.home_team_id].d++; }
        if (tbl[m.away_team_id]) { tbl[m.away_team_id].pts += 1; tbl[m.away_team_id].d++; }
      }
    }

    return Object.values(tbl).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name)
    );
  },

  isTiedThird(a, b) {
    return a.pts === b.pts && (a.w ?? 0) === (b.w ?? 0) && (a.d ?? 0) === (b.d ?? 0) && (a.l ?? 0) === (b.l ?? 0) && a.gd === b.gd && a.gf === b.gf;
  },

  // Best 8 third-place teams across all groups, respecting manual tiebreaker
  getBest8Third(allGroupStandings, tiebreaker = null) {
    const thirds = [];
    for (const s of allGroupStandings) if (s.length >= 3) thirds.push(s[2]);
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
    if (tiebreaker && Array.isArray(tiebreaker)) {
      // Within each tied group, apply the manual order
      const result = [];
      let i = 0;
      while (i < thirds.length) {
        let j = i + 1;
        while (j < thirds.length && this.isTiedThird(thirds[i], thirds[j])) j++;
        const group = thirds.slice(i, j).sort((a, b) => {
          const ia = tiebreaker.indexOf(a.team.id);
          const ib = tiebreaker.indexOf(b.team.id);
          if (ia !== -1 && ib !== -1) return ia - ib;
          return 0;
        });
        result.push(...group);
        i = j;
      }
      return result.slice(0, 8);
    }
    return thirds.slice(0, 8);
  },

  build(predictions, teams, matches, tiebreaker = null) {
    // Group standings
    const allStandings = {};
    for (const g of this.GROUPS) allStandings[g] = this.calcGroupStandings(g, predictions, teams, matches);

    const best8Third = this.getBest8Third(Object.values(allStandings), tiebreaker);

    // Assign best-third teams to '3T' slots using FIFA 2026 lookup table
    const thirdSlot = {};
    const qualKey = best8Third.map(t => t.team.group_letter).sort().join('');
    const lookup = this.THIRD_PLACE_LOOKUP[qualKey];
    if (lookup) {
      // THIRD_MATCH_SLOTS order: [1A→79, 1B→85, 1D→81, 1E→74, 1G→82, 1I→77, 1K→87, 1L→80]
      lookup.forEach((grpCode, i) => {
        const grpLetter = grpCode[1]; // '3D' → 'D'
        const entry = best8Third.find(t => t.team.group_letter === grpLetter);
        thirdSlot[this.THIRD_MATCH_SLOTS[i]] = entry ? entry.team : null;
      });
    } else {
      // Fallback: assign in rank order
      this.THIRD_MATCH_SLOTS.forEach((mNum, i) => { thirdSlot[mNum] = i < best8Third.length ? best8Third[i].team : null; });
    }

    // Resolve R32 teams
    const predictedTeams = {};
    for (const [mNum, [hSlot, aSlot]] of Object.entries(this.R32_SLOTS)) {
      const num = +mNum;
      const resolve = (slot) => {
        if (slot === '3T') return thirdSlot[num] || null;
        return allStandings[slot[1]]?.[+slot[0] - 1]?.team || null;
      };
      predictedTeams[num] = { home: resolve(hSlot), away: resolve(aSlot) };
    }

    // Index matches by match_number for quick lookup
    const matchByNum = {};
    for (const m of matches) matchByNum[m.match_number] = m;

    const predictedWinner = {};

    // Determine who user predicts wins a match
    const pickWinner = (num) => {
      const slot = predictedTeams[num];
      if (!slot?.home || !slot?.away) return null;
      const match = matchByNum[num];
      if (!match) return null;
      const p = predictions.find(pr => pr.match_id === match.id);
      if (!p || p.home_score_pred == null) return null;
      // Draw → home team advances (simplified for bracket display)
      return p.away_score_pred > p.home_score_pred ? slot.away : slot.home;
    };

    // R32 winners
    for (const num of [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88]) {
      predictedWinner[num] = pickWinner(num);
    }

    // R16 through SF winners
    for (const num of [89,90,91,92,93,94,95,96,97,98,99,100,101,102]) {
      const [fh, fa] = this.FEEDERS[num];
      predictedTeams[num] = { home: predictedWinner[fh] || null, away: predictedWinner[fa] || null };
      predictedWinner[num] = pickWinner(num);
    }

    // 3rd place match: losers of SF 101 and 102
    const loserOf = (sfNum) => {
      const slot = predictedTeams[sfNum];
      const winner = predictedWinner[sfNum];
      if (!slot || !winner) return null;
      return winner === slot.home ? slot.away : slot.home;
    };
    predictedTeams[103] = { home: loserOf(101), away: loserOf(102) };
    predictedWinner[103] = pickWinner(103);

    // Final: winners of SF 101 and 102
    predictedTeams[104] = { home: predictedWinner[101] || null, away: predictedWinner[102] || null };
    predictedWinner[104] = pickWinner(104);

    // allThirds: all 12 third-place teams sorted with tiebreaker applied
    const allThirds = [];
    for (const s of Object.values(allStandings)) if (s.length >= 3) allThirds.push(s[2]);
    allThirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
    if (tiebreaker && Array.isArray(tiebreaker)) {
      const result = [];
      let i = 0;
      while (i < allThirds.length) {
        let j = i + 1;
        while (j < allThirds.length && this.isTiedThird(allThirds[i], allThirds[j])) j++;
        const group = allThirds.slice(i, j).sort((a, b) => {
          const ia = tiebreaker.indexOf(a.team.id);
          const ib = tiebreaker.indexOf(b.team.id);
          if (ia !== -1 && ib !== -1) return ia - ib;
          return 0;
        });
        result.push(...group);
        i = j;
      }
      allThirds.length = 0;
      allThirds.push(...result);
    }

    return { allStandings, best8Third, allThirds, predictedTeams, predictedWinner };
  },
};
