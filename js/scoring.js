// ============================================================
// VM 2026 Tipping – Poengberegning
// ============================================================

const Scoring = {
  // Calculate points for a single prediction against a played match.
  // Returns a number (0, outcome points, or exact points), or null if not played.
  calculate(predHome, predAway, match) {
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

    // Exact score: outcome points + bonus
    if (predHome === resHome && predAway === resAway) {
      return pts.outcome + pts.exact;
    }

    // Correct outcome (H/D/A based on effective result)
    const predSign   = Math.sign(predHome - predAway);
    const resultSign = Math.sign(resHome - resAway);

    if (predSign === resultSign) {
      return pts.outcome;
    }

    // For penalty shootouts: also award outcome points if the user predicted
    // the correct winner (e.g. predicted 2-0 home win, actual 1-1 AET home wins penalties)
    if (match.went_to_penalties && predSign !== 0) {
      const penSign = Math.sign((match.home_penalties ?? 0) - (match.away_penalties ?? 0));
      if (penSign !== 0 && predSign === penSign) return pts.outcome;
    }

    return 0;
  },

  // Total points for a user across all matches
  totalForUser(predictions, matches) {
    let total = 0;
    for (const pred of predictions) {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match) continue;
      const pts = this.calculate(pred.home_score_pred, pred.away_score_pred, match);
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
        const pred   = (userPred[field]       || '').trim().toLowerCase();
        const actual = (actualResults[field]  || '').trim().toLowerCase();
        if (!pred || !actual) continue;

        if (pred === actual) {
          total += pts.exact;
          continue;
        }
        // Check if the predicted player appears anywhere in the group (wrong position)
        for (let j = 0; j < group.length; j++) {
          if (j === i) continue;
          const other = (actualResults[group[j]] || '').trim().toLowerCase();
          if (pred === other) {
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

    // Resolve the actual teams for every knockout slot once (group results → bracket)
    const actualTeams = typeof Bracket !== 'undefined' && Bracket.buildActualTeams
      ? Bracket.buildActualTeams(teams, matches)
      : null;

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
        // Compare user's predicted slot against actual resolved teams (not the DB's
        // home_team_id, which is null for knockout matches determined by group results).
        if (match.stage !== 'group' && bracketData) {
          const userSlot   = bracketData.predictedTeams?.[match.match_number];
          const actualSlot = actualTeams?.[match.match_number];
          let homeOk, awayOk;
          if (actualSlot?.home && actualSlot?.away) {
            homeOk = userSlot?.home?.id === actualSlot.home.id;
            awayOk = userSlot?.away?.id === actualSlot.away.id;
          } else {
            homeOk = userSlot?.home?.id === match.home_team_id;
            awayOk = userSlot?.away?.id === match.away_team_id;
          }
          if (!homeOk || !awayOk) continue; // wrong teams predicted → 0 points
        }

        const pts = this.calculate(pred.home_score_pred, pred.away_score_pred, match);
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
