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

  // 8 R32 match numbers that receive a best-third-place team, in rank order
  THIRD_SLOTS_ORDER: [74, 77, 79, 80, 81, 82, 85, 87],

  // For each R16+ match: [homeFeederMatchNum, awayFeederMatchNum]
  // Match 103 (3rd place) feeds from LOSERS; all others from WINNERS
  FEEDERS: {
    89:[73,74], 90:[75,76], 91:[77,78], 92:[79,80],
    93:[81,82], 94:[83,84], 95:[85,86], 96:[87,88],
    97:[89,90], 98:[91,92], 99:[93,94], 100:[95,96],
    101:[97,98], 102:[99,100],
    103:[101,102],   // 3rd place: losers of both SF
    104:[101,102],   // final:     winners of both SF
  },

  // Predicted group standings from user's score predictions
  calcGroupStandings(groupLetter, predictions, teams, matches) {
    const groupTeams   = teams.filter(t => t.group_letter === groupLetter);
    const groupMatches = matches.filter(m => m.stage === 'group' && m.group_letter === groupLetter);

    const tbl = {};
    for (const t of groupTeams) tbl[t.id] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0 };

    for (const m of groupMatches) {
      const p = predictions.find(pr => pr.match_id === m.id);
      if (!p || p.home_score_pred == null || p.away_score_pred == null) continue;
      const h = p.home_score_pred, a = p.away_score_pred;
      if (tbl[m.home_team_id]) { tbl[m.home_team_id].gf += h; tbl[m.home_team_id].ga += a; tbl[m.home_team_id].gd += h - a; }
      if (tbl[m.away_team_id]) { tbl[m.away_team_id].gf += a; tbl[m.away_team_id].ga += h; tbl[m.away_team_id].gd += a - h; }
      if (h > a)      { if (tbl[m.home_team_id]) tbl[m.home_team_id].pts += 3; }
      else if (h < a) { if (tbl[m.away_team_id]) tbl[m.away_team_id].pts += 3; }
      else            { if (tbl[m.home_team_id]) tbl[m.home_team_id].pts += 1; if (tbl[m.away_team_id]) tbl[m.away_team_id].pts += 1; }
    }

    return Object.values(tbl).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name)
    );
  },

  // Best 8 third-place teams across all groups
  getBest8Third(allGroupStandings) {
    const thirds = [];
    for (const s of allGroupStandings) if (s.length >= 3) thirds.push(s[2]);
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
    return thirds.slice(0, 8);
  },

  // Build full predicted bracket from user predictions.
  // Returns { allStandings, best8Third, predictedTeams }
  // predictedTeams[matchNum] = { home: team|null, away: team|null }
  build(predictions, teams, matches) {
    // Group standings
    const allStandings = {};
    for (const g of this.GROUPS) allStandings[g] = this.calcGroupStandings(g, predictions, teams, matches);

    const best8Third = this.getBest8Third(Object.values(allStandings));

    // Assign best-third teams to '3T' slots in THIRD_SLOTS_ORDER
    const thirdSlot = {};
    this.THIRD_SLOTS_ORDER.forEach((mNum, i) => { thirdSlot[mNum] = i < best8Third.length ? best8Third[i].team : null; });

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

    return { allStandings, best8Third, predictedTeams, predictedWinner };
  },
};
