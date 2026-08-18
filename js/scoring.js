// ============================================================
// PL-Tipping – Poengrekning og statistikk
//
// Regelen: for kvart lag får du poeng lik kor mange plassar du
// bomma med. Tippa du eit lag på 5. plass og dei enda på 8., får
// du 3 poeng. Færrast poeng totalt vinn.
// ============================================================

const Scoring = {

  /** Map: team_id → faktisk plassering (berre lag admin har plassert). */
  actualMap(teams) {
    const m = new Map();
    for (const t of teams) {
      if (t.actual_position != null) m.set(t.id, t.actual_position);
    }
    return m;
  },

  hasResults(teams) {
    return teams.some(t => t.actual_position != null);
  },

  /** Spådommane til éin spelar som Map: team_id → plassering. */
  predMap(preds, userId) {
    const m = new Map();
    for (const p of preds) {
      if (String(p.user_id) === String(userId)) m.set(p.team_id, p.position);
    }
    return m;
  },

  /** Rekkjefølgja til éin spelar som liste med team_id, 1. plass først. */
  order(preds, userId) {
    return preds
      .filter(p => String(p.user_id) === String(userId))
      .sort((a, b) => a.position - b.position)
      .map(p => p.team_id);
  },

  /**
   * Rekn ut resultatet til éin spelar.
   * → { total, exact, scored, rows: [{team, pred, actual, diff}] }
   */
  scoreUser(preds, userId, teams) {
    const pm     = this.predMap(preds, userId);
    const actual = this.actualMap(teams);
    const rows   = [];
    let total = 0, exact = 0, scored = 0;

    for (const t of teams) {
      const pred = pm.get(t.id) ?? null;
      const act  = actual.get(t.id) ?? null;
      let diff = null;
      if (pred != null && act != null) {
        diff = Math.abs(pred - act);
        total += diff;
        scored++;
        if (diff === 0) exact++;
      }
      rows.push({ team: t, pred, actual: act, diff });
    }

    rows.sort((a, b) => (a.pred ?? 99) - (b.pred ?? 99));
    return { total, exact, scored, rows };
  },

  /** Tabellen – sortert med færrast poeng øvst. */
  buildLeaderboard(users, preds, teams) {
    const rows = users.map(u => {
      const s = this.scoreUser(preds, u.id, teams);
      return {
        user:   u,
        total:  s.total,
        exact:  s.exact,
        scored: s.scored,
        tipped: preds.filter(p => String(p.user_id) === String(u.id)).length,
        locked: !!u.locked_at,
      };
    });

    if (!this.hasResults(teams)) {
      // Ingen resultat enno – vis alfabetisk, låste øvst
      rows.sort((a, b) => (b.locked - a.locked) ||
        a.user.username.localeCompare(b.user.username, 'no'));
    } else {
      rows.sort((a, b) => (a.total - b.total) || (b.exact - a.exact) ||
        a.user.username.localeCompare(b.user.username, 'no'));
    }
    return rows;
  },
};


// ============================================================
// STATISTIKK – kva har gjengen samla sett spådd?
// ============================================================

const Stats = {

  /**
   * @returns null om ingen har levert komplett tabell, elles eit
   * objekt med alt fakta-sida treng.
   */
  build(users, preds, teams) {
    // Berre spelarar med komplett tabell tel i statistikken
    const players = users
      .map(u => ({ user: u, order: Scoring.order(preds, u.id) }))
      .filter(p => teams.length > 0 && p.order.length === teams.length);

    if (players.length === 0) return null;

    const byId = new Map(teams.map(t => [t.id, t]));
    const n    = players.length;
    const last = teams.length;

    // ---- Per lag: alle plasseringane det har fått ------------
    const teamStats = teams.map(t => {
      const picks = players.map(p => ({ user: p.user, pos: p.order.indexOf(t.id) + 1 }));
      const positions = picks.map(p => p.pos);
      const avg  = positions.reduce((a, b) => a + b, 0) / n;
      const vari = positions.reduce((a, b) => a + (b - avg) ** 2, 0) / n;
      const sorted = picks.slice().sort((a, b) => a.pos - b.pos);
      return {
        team:    t,
        picks,
        avg,
        spread:  Math.sqrt(vari),
        best:    sorted[0],                  // høgast plassert (lågast tal)
        worst:   sorted[sorted.length - 1],  // lågast plassert
        firsts:  positions.filter(p => p === 1).length,
        lasts:   positions.filter(p => p === last).length,
        top4:    positions.filter(p => p <= 4).length,
        bottom3: positions.filter(p => p >= last - 2).length,
      };
    });

    const avgOf = new Map(teamStats.map(s => [s.team.id, s.avg]));

    // ---- Konsensustabellen -----------------------------------
    const consensus = teamStats.slice().sort((a, b) => a.avg - b.avg);

    // ---- Dei største avvika i gjengen ------------------------
    const outliers = [];
    for (const p of players) {
      p.order.forEach((tid, i) => {
        const t = byId.get(tid);
        if (!t) return;
        const avg = avgOf.get(t.id);
        outliers.push({
          user: p.user, team: t,
          pos: i + 1, avg,
          gap: Math.abs((i + 1) - avg),
          dir: (i + 1) < avg ? 'høgare' : 'lågare',
        });
      });
    }
    outliers.sort((a, b) => b.gap - a.gap);

    // ---- Kor kontrær er kvar spelar? -------------------------
    const contrarian = players.map(p => {
      let sum = 0;
      p.order.forEach((tid, i) => { sum += Math.abs((i + 1) - (avgOf.get(tid) ?? 0)); });
      return { user: p.user, gap: sum, avgGap: sum / teams.length };
    }).sort((a, b) => b.gap - a.gap);

    // ---- Mest like / ulike tabellar --------------------------
    const pairs = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i], b = players[j];
        let d = 0;
        a.order.forEach((tid, k) => { d += Math.abs((k + 1) - (b.order.indexOf(tid) + 1)); });
        pairs.push({ a: a.user, b: b.user, dist: d });
      }
    }
    pairs.sort((x, y) => x.dist - y.dist);

    return {
      playerCount: n,
      players,
      teamStats,
      consensus,
      outliers,
      contrarian,
      pairs,
      champions: teamStats.filter(s => s.firsts > 0).sort((a, b) => b.firsts - a.firsts),
      spoons:    teamStats.filter(s => s.lasts  > 0).sort((a, b) => b.lasts  - a.lasts),
      agreed:    teamStats.slice().sort((a, b) => a.spread - b.spread),
      divisive:  teamStats.slice().sort((a, b) => b.spread - a.spread),
    };
  },
};
