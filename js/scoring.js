// ============================================================
// VM 2026 Tipping – Poengberegning
// ============================================================

// Normalize a name for comparison: trim, lowercase, strip accents (é → e).
function normalizeName(s) {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Two award-prediction values refer to the same player if they're equal once
// accents are stripped, or if one is a subset of the other's words — this
// lets a surname-only guess ("Mbappe") match a full name ("Kylian Mbappe").
function namesMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wordsA = na.split(/\s+/);
  const wordsB = nb.split(/\s+/);
  const [shorter, longer] = wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  return shorter.every(w => longer.includes(w));
}

const Scoring = {
  // Calculate points for a single prediction against a played match.
  // Returns a number (0, outcome points, or exact points), or null if not played.
  calculate(predHome, predAway, match, penWinnerPred = null) {
    if (!match.is_played) return null;
    if (predHome === null || predAway === null) return 0;

    const pts = CONFIG.SCORING[match.stage];
    if (!pts) return 0;

    // Determine effective result:
    // - If went to AET, use AET score (not regular time, not penalties)
    // - Otherwise use regular time score
    let resHome, resAway;
    if (match.went_to_aet && match.home_score_aet !== null) {
      resHome = match.home_score_aet;
      resAway = match.away_score_aet;
    } else {
      resHome = match.home_score;
      resAway = match.away_score;
    }

    // Exact score: outcome points + bonus (scoreline only — penalties never
    // factor into this comparison, per "AET-resultatet gjelder")
    if (predHome === resHome && predAway === resAway) {
      return pts.outcome + pts.exact;
    }

    if (match.stage === 'group') {
      // Group stage: a draw is a valid final outcome, so compare W/D/L sign.
      const predSign   = Math.sign(predHome - predAway);
      const resultSign = Math.sign(resHome - resAway);
      return predSign === resultSign ? pts.outcome : 0;
    }

    // Knockout: a draw can never be the actual final outcome — one team
    // always goes through, either outright or on penalties. So "riktig
    // utfall" means predicting the correct team to advance, not matching
    // the sign of the scoreline.
    let actualWinner = null;
    if (resHome !== resAway) {
      actualWinner = resHome > resAway ? 'home' : 'away';
    } else if (match.went_to_penalties) {
      const penSign = Math.sign((match.home_penalties ?? 0) - (match.away_penalties ?? 0));
      if (penSign > 0) actualWinner = 'home';
      else if (penSign < 0) actualWinner = 'away';
    }

    let predictedWinner = null;
    if (predHome !== predAway) {
      predictedWinner = predHome > predAway ? 'home' : 'away';
    } else if (penWinnerPred === 'home' || penWinnerPred === 'away') {
      predictedWinner = penWinnerPred;
    }

    if (actualWinner && predictedWinner && actualWinner === predictedWinner) {
      return pts.outcome;
    }

    return 0;
  },

  // Total points for a user across all matches
  totalForUser(predictions, matches) {
    let total = 0;
    for (const pred of predictions) {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match) continue;
      const pts = this.calculate(pred.home_score_pred, pred.away_score_pred, match, pred.penalty_winner_pred);
      if (pts !== null) total += pts;
    }
    return total;
  },

  // Award prediction points
  calculateAwards(userPred, actualResults) {
    if (!userPred || !actualResults) return 0;
    let total = 0;
    const fields = [
      ['best_player_1','best_player_2','best_player_3'],
      ['top_scorer_1',  'top_scorer_2',  'top_scorer_3'],
    ];
    const pts = CONFIG.AWARD_SCORING;

    for (const group of fields) {
      for (let i = 0; i < group.length; i++) {
        const field = group[i];
        const pred   = userPred[field];
        const actual = actualResults[field];
        if (!pred || !actual) continue;

        if (namesMatch(pred, actual)) {
          total += pts.exact;
          continue;
        }
        // Check if the predicted player appears anywhere else in the group (wrong position)
        for (let j = 0; j < group.length; j++) {
          if (j === i) continue;
          if (namesMatch(pred, actualResults[group[j]])) {
            total += pts.wrong_position;
            break;
          }
        }
      }
    }
    return total;
  },

  // Build leaderboard: [{user, matchPoints, awardPoints, total, outcomePts, exactPts, exact}]
  buildLeaderboard(users, predictions, matches, teams, awardPredictions, awardResults) {
    // Build per-user tiebreaker map from award_predictions
    const tiebreakerMap = {};
    for (const ap of (awardPredictions || [])) {
      if (ap.third_tiebreaker) {
        try { tiebreakerMap[ap.user_id] = JSON.parse(ap.third_tiebreaker); } catch {}
      }
    }

    return users.map(user => {
      const userPreds = predictions.filter(p => p.user_id === user.id);
      let matchPoints = 0, outcomePts = 0, exactPts = 0, exactCount = 0;

      // Build this user's predicted bracket once (for knockout team validation)
      const bracketData = typeof Bracket !== 'undefined'
        ? Bracket.build(userPreds, teams, matches, tiebreakerMap[user.id] || null)
        : null;

      for (const pred of userPreds) {
        const match = matches.find(m => m.id === pred.match_id);
        if (!match || !match.is_played) continue;

        // Knockout rounds: only award points if the user predicted the correct teams.
        // home_team_id / away_team_id are written by the admin when saving a result,
        // so this reliably reflects who actually played.
        if (match.stage !== 'group' && bracketData) {
          const slot = bracketData.predictedTeams?.[match.match_number];
          const homeOk = slot?.home?.id === match.home_team_id;
          const awayOk = slot?.away?.id === match.away_team_id;
          if (!homeOk || !awayOk) continue; // wrong teams predicted → 0 points
        }

        const pts = this.calculate(pred.home_score_pred, pred.away_score_pred, match, pred.penalty_winner_pred);
        if (pts === null || pts === 0) continue;
        matchPoints += pts;
        const scoring = CONFIG.SCORING[match.stage];
        if (scoring && pts === scoring.outcome + scoring.exact) {
          outcomePts += scoring.outcome;
          exactPts   += scoring.exact;
          exactCount++;
        } else {
          outcomePts += pts;
        }
      }

      const userAward  = awardPredictions.find(a => a.user_id === user.id) || null;
      const awardPoints = this.calculateAwards(userAward, awardResults);

      return {
        user,
        matchPoints,
        awardPoints,
        total: matchPoints + awardPoints,
        outcomePts,
        exactPts,
        exact: exactCount,
        predictions: userPreds.length,
      };
    }).sort((a, b) => b.total - a.total || b.exactPts - a.exactPts || b.outcomePts - a.outcomePts);
  },
};
