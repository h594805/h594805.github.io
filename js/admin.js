// ============================================================
// VM 2026 Tipping – Admin Panel
// ============================================================

const { createClient: createAdminClient } = supabase;
let adminDb   = null;
let adminData = { matches: [], teams: [] };

async function adminSha256(msg) {
  const buf  = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ============================================================
// INIT
// ============================================================
async function adminInit() {
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('DIN-')) {
    document.body.innerHTML = '<div class="full-screen"><div class="card" style="text-align:center"><p>Konfigurer Supabase i js/config.js</p></div></div>';
    return;
  }
  adminDb = createAdminClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  setupAdminEntry();
}

// ============================================================
// ENTRY
// ============================================================
function setupAdminEntry() {
  document.getElementById('admin-entry-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('admin-entry-btn');
    const errEl = document.getElementById('admin-entry-error');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    const hash = await adminSha256(document.getElementById('admin-password').value);
    if (hash === CONFIG.ADMIN_PASSWORD_HASH) {
      document.getElementById('admin-entry').classList.add('hidden');
      document.getElementById('admin-panel').classList.remove('hidden');
      loadAdminData();
    } else {
      errEl.textContent = 'Feil passord.';
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = 'Logg inn';
    }
  });
}

// ============================================================
// LOAD DATA
// ============================================================
const MONTHS_ADMIN = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
const DAYS_ADMIN   = ['søn','man','tir','ons','tor','fre','lør'];

async function loadAdminData() {
  const [matchRes, teamRes] = await Promise.all([
    adminDb.from('matches').select('*').order('match_date').order('match_number'),
    adminDb.from('teams').select('*').order('id'),
  ]);
  adminData.matches = matchRes.data || [];
  adminData.teams   = teamRes.data  || [];
  setupAdminTabs();
  buildDateTabs();
}

function buildDateTabs() {
  const tabsEl = document.getElementById('admin-date-tabs');
  if (!tabsEl) return;

  // Collect unique calendar days (Norwegian local time)
  const dayMap = new Map();
  for (const m of adminData.matches) {
    if (!m.match_date) continue;
    const d = new Date(m.match_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!dayMap.has(key)) dayMap.set(key, d);
  }
  const days = [...dayMap.entries()].sort((a, b) => a[1] - b[1]);

  // Pick default: today, or nearest future day, or first day
  const nowKey = (() => { const n = new Date(); return `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`; })();
  let defaultKey = dayMap.has(nowKey) ? nowKey : null;
  if (!defaultKey) {
    const now = new Date();
    for (const [k, d] of days) { if (d >= now) { defaultKey = k; break; } }
  }
  if (!defaultKey && days.length) defaultKey = days[0][0];

  tabsEl.innerHTML = days.map(([key, d]) => {
    const label = `${DAYS_ADMIN[d.getDay()]} ${d.getDate()}. ${MONTHS_ADMIN[d.getMonth()]}`;
    const isToday = key === nowKey;
    return `<button class="admin-stage-tab${key === defaultKey ? ' active' : ''}" data-datekey="${key}" onclick="selectAdminDate('${key}')">${label}${isToday ? ' ★' : ''}</button>`;
  }).join('');

  if (defaultKey) {
    renderAdminMatchList(defaultKey);
    // Scroll active tab into view
    setTimeout(() => {
      const active = tabsEl.querySelector('.admin-stage-tab.active');
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 100);
  }
}

function selectAdminDate(key) {
  document.querySelectorAll('#admin-date-tabs .admin-stage-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.datekey === key)
  );
  renderAdminMatchList(key);
}

function adminTeamById(id) { return adminData.teams.find(t => t.id === id) || null; }
function adminTeamName(id, slotDesc) {
  const t = adminTeamById(id);
  return t ? (t.name_no || t.name) : (slotDesc || 'TBD');
}

// ============================================================
// ACTUAL TEAM RESOLUTION (knockout matches)
// ============================================================

const ADMIN_R32_SLOTS = {
  73: ['2A','2B'], 74: ['1E','3T'], 75: ['1F','2C'], 76: ['1C','2F'],
  77: ['1I','3T'], 78: ['2E','2I'], 79: ['1A','3T'], 80: ['1L','3T'],
  81: ['1D','3T'], 82: ['1G','3T'], 83: ['2K','2L'], 84: ['1H','2J'],
  85: ['1B','3T'], 86: ['1J','2H'], 87: ['1K','3T'], 88: ['2D','2G'],
};

const ADMIN_FEEDERS = {
  89:[74,77], 90:[73,75], 91:[76,78], 92:[79,80],
  93:[83,84], 94:[81,82], 95:[86,88], 96:[85,87],
  97:[89,90], 98:[93,94], 99:[91,92], 100:[95,96],
  101:[97,98], 102:[99,100],
  103:[101,102], 104:[101,102],
};

let adminResolvedTeams = null;

function adminCalcActualGroupStandings(groupLetter) {
  const groupTeams   = adminData.teams.filter(t => t.group_letter === groupLetter);
  const groupMatches = adminData.matches.filter(m => m.stage === 'group' && m.group_letter === groupLetter && m.is_played);
  const tbl = {};
  for (const t of groupTeams) tbl[t.id] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 };
  for (const m of groupMatches) {
    if (m.home_score == null || m.away_score == null) continue;
    const h = m.home_score, a = m.away_score;
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
}

function adminBuildResolvedTeams() {
  const allStandings = {};
  for (const g of 'ABCDEFGHIJKL'.split('')) allStandings[g] = adminCalcActualGroupStandings(g);

  // Best 8 third-place teams
  const thirds = [];
  for (const s of Object.values(allStandings)) if (s.length >= 3) thirds.push(s[2]);
  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
  const best8Third = thirds.slice(0, 8);

  // Assign third-place teams to their R32 slots using FIFA 2026 lookup table
  const thirdSlot = {};
  const qualKey = best8Third.map(t => t.team.group_letter).sort().join('');
  const lookup = Bracket.THIRD_PLACE_LOOKUP[qualKey];
  const thirdMatchSlots = Bracket.THIRD_MATCH_SLOTS;
  if (lookup) {
    lookup.forEach((grpCode, i) => {
      const entry = best8Third.find(t => t.team.group_letter === grpCode[1]);
      thirdSlot[thirdMatchSlots[i]] = entry ? entry.team : null;
    });
  } else {
    thirdMatchSlots.forEach((mNum, i) => { thirdSlot[mNum] = i < best8Third.length ? best8Third[i].team : null; });
  }

  const matchByNum = {};
  for (const m of adminData.matches) matchByNum[m.match_number] = m;

  const resolved = {};

  // Resolve R32 team slots
  for (const [mNum, [hSlot, aSlot]] of Object.entries(ADMIN_R32_SLOTS)) {
    const num = +mNum;
    const resolveSlot = (slot) => {
      if (slot === '3T') return thirdSlot[num] || null;
      return allStandings[slot[1]]?.[+slot[0] - 1]?.team || null;
    };
    resolved[num] = { home: resolveSlot(hSlot), away: resolveSlot(aSlot) };
  }

  const actualWinner = {};
  const getWinner = (num) => {
    const m = matchByNum[num];
    if (!m || !m.is_played) return null;
    const slot = resolved[num];
    if (!slot?.home || !slot?.away) return null;
    const h = m.went_to_aet ? (m.home_score_aet ?? m.home_score) : m.home_score;
    const a = m.went_to_aet ? (m.away_score_aet ?? m.away_score) : m.away_score;
    if (h == null || a == null) return null;
    if (h > a) return slot.home;
    if (a > h) return slot.away;
    if (m.went_to_penalties) {
      if (m.home_penalties > m.away_penalties) return slot.home;
      if (m.away_penalties > m.home_penalties) return slot.away;
    }
    return null;
  };

  // R32 winners
  for (const num of [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88]) {
    actualWinner[num] = getWinner(num);
  }

  // R16 through SF
  for (const num of [89,90,91,92,93,94,95,96,97,98,99,100,101,102]) {
    const [fh, fa] = ADMIN_FEEDERS[num];
    resolved[num] = { home: actualWinner[fh] || null, away: actualWinner[fa] || null };
    actualWinner[num] = getWinner(num);
  }

  // 3rd place: losers of both SFs
  const loserOf = (sfNum) => {
    const slot = resolved[sfNum];
    const winner = actualWinner[sfNum];
    if (!slot || !winner) return null;
    return winner === slot.home ? slot.away : slot.home;
  };
  resolved[103] = { home: loserOf(101), away: loserOf(102) };
  actualWinner[103] = getWinner(103);

  // Final: winners of both SFs
  resolved[104] = { home: actualWinner[101] || null, away: actualWinner[102] || null };

  return resolved;
}

function adminGetResolvedTeam(matchNum, side) {
  if (!adminResolvedTeams) adminResolvedTeams = adminBuildResolvedTeams();
  return adminResolvedTeams?.[matchNum]?.[side] || null;
}

function adminFlagImg(team) {
  if (!team) return '';
  return `<img src="https://flagcdn.com/w40/${team.country_code.toLowerCase()}.png"
    style="width:22px;height:16px;object-fit:cover;border-radius:2px;flex-shrink:0"
    onerror="this.style.display='none'">`;
}

// ============================================================
// TABS
// ============================================================
function showAdminSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function setupAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showAdminSection('admin-' + tab.dataset.section);
      if (tab.dataset.section === 'priser') loadAdminAwards();
    });
  });
  showAdminSection('admin-kamper');
}

// ============================================================
// MATCH LIST
// ============================================================
function renderAdminMatchList(dateKey) {
  const el = document.getElementById('admin-match-list');
  const [year, month, day] = dateKey.split('-').map(Number);
  const matches = adminData.matches.filter(m => {
    if (!m.match_date) return false;
    const d = new Date(m.match_date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }).sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

  if (!matches.length) {
    el.innerHTML = `<div class="empty-state"><p>Ingen kamper her ennå</p></div>`;
    return;
  }
  el.innerHTML = matches.map(m => renderAdminMatchRow(m)).join('');
}

function renderAdminMatchRow(m) {
  let ht = adminTeamById(m.home_team_id);
  let at = adminTeamById(m.away_team_id);
  if (!ht && m.stage !== 'group') ht = adminGetResolvedTeam(m.match_number, 'home');
  if (!at && m.stage !== 'group') at = adminGetResolvedTeam(m.match_number, 'away');
  const homeName = ht ? (ht.name_no || ht.name) : (m.home_slot_desc || 'TBD');
  const awayName = at ? (at.name_no || at.name) : (m.away_slot_desc || 'TBD');

  const currentH = m.went_to_aet ? (m.home_score_aet ?? m.home_score ?? '') : (m.home_score ?? '');
  const currentA = m.went_to_aet ? (m.away_score_aet ?? m.away_score ?? '') : (m.away_score ?? '');

  const playedBadge = m.is_played
    ? `<span style="font-size:0.7rem;color:#22c55e;font-weight:700;white-space:nowrap">Spilt</span>`
    : '';

  return `
    <div class="match-admin-row${m.is_played ? ' played' : ''}">
      <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;min-width:32px">#${m.match_number}</span>

      <div class="admin-team">
        ${adminFlagImg(ht)}
        <span style="font-weight:700;font-size:0.88rem">${esc(homeName)}</span>
      </div>

      <div class="admin-score-wrap">
        <input type="number" id="hs-${m.id}" class="score-input" value="${currentH}"
          min="0" max="30" inputmode="numeric" placeholder="–" style="width:46px">
        <span style="color:var(--text-muted);font-weight:700">–</span>
        <input type="number" id="as-${m.id}" class="score-input" value="${currentA}"
          min="0" max="30" inputmode="numeric" placeholder="–" style="width:46px">
      </div>

      <div class="admin-team away">
        <span style="font-weight:700;font-size:0.88rem">${esc(awayName)}</span>
        ${adminFlagImg(at)}
      </div>

      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
        <label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;cursor:pointer;white-space:nowrap;color:var(--text-muted)">
          <input type="checkbox" id="aet-${m.id}" ${m.went_to_aet ? 'checked' : ''}
            style="accent-color:var(--gold);width:14px;height:14px"> AET
        </label>
        ${playedBadge}
        <button class="btn btn-gold btn-sm" onclick="saveInlineResult(${m.id})">Lagre</button>
        ${m.is_played ? `<button class="btn btn-outline btn-sm" onclick="resetMatch(${m.id})" style="color:var(--red);border-color:var(--red)">Nullstill</button>` : ''}
      </div>
    </div>`;
}

// ============================================================
// SAVE INLINE RESULT
// ============================================================
async function saveInlineResult(matchId) {
  const m = adminData.matches.find(x => x.id === matchId);
  if (!m) return;

  const hs  = document.getElementById(`hs-${matchId}`).value;
  const as_ = document.getElementById(`as-${matchId}`).value;
  const aet = document.getElementById(`aet-${matchId}`).checked;

  if (hs === '' || as_ === '') { showAdminToast('Fyll inn begge scorene'); return; }

  const h = parseInt(hs);
  const a = parseInt(as_);

  const updates = {
    home_score:        h,
    away_score:        a,
    went_to_aet:       aet,
    home_score_aet:    aet ? h : null,
    away_score_aet:    aet ? a : null,
    went_to_penalties: false,
    is_played:         true,
  };

  const { error } = await adminDb.from('matches').update(updates).eq('id', matchId);
  if (error) { showAdminToast('Feil: ' + error.message); return; }

  Object.assign(m, updates);
  adminResolvedTeams = null;

  const activeDateTab = document.querySelector('#admin-date-tabs .admin-stage-tab.active');
  renderAdminMatchList(activeDateTab?.dataset.datekey);

  showAdminToast('Lagret!');
}

// ============================================================
// RESET MATCH
// ============================================================
async function resetMatch(matchId) {
  const m = adminData.matches.find(x => x.id === matchId);
  if (!m) return;

  const updates = {
    home_score:        null,
    away_score:        null,
    home_score_aet:    null,
    away_score_aet:    null,
    went_to_aet:       false,
    went_to_penalties: false,
    home_penalties:    null,
    away_penalties:    null,
    is_played:         false,
  };

  const { error } = await adminDb.from('matches').update(updates).eq('id', matchId);
  if (error) { showAdminToast('Feil: ' + error.message); return; }

  Object.assign(m, updates);
  adminResolvedTeams = null;

  const activeDateTab = document.querySelector('#admin-date-tabs .admin-stage-tab.active');
  renderAdminMatchList(activeDateTab?.dataset.datekey);

  showAdminToast('Kamp nullstilt!');
}

// ============================================================
// AWARDS
// ============================================================
async function loadAdminAwards() {
  const { data } = await adminDb.from('award_results').select('*').single();
  if (!data) return;
  ['best_player_1','best_player_2','best_player_3','top_scorer_1','top_scorer_2','top_scorer_3'].forEach(f => {
    const el = document.getElementById('award-result-' + f);
    if (el) el.value = data[f] || '';
  });
}

async function saveAwardResults() {
  const fields = ['best_player_1','best_player_2','best_player_3','top_scorer_1','top_scorer_2','top_scorer_3'];
  const obj = { updated_at: new Date().toISOString() };
  fields.forEach(f => { obj[f] = document.getElementById('award-result-' + f)?.value?.trim() || null; });
  const { error } = await adminDb.from('award_results').update(obj).eq('id', 1);
  if (error) { showAdminToast('Feil: ' + error.message); return; }
  showAdminToast('Prisvinnere lagret!');
}

// ============================================================
// USERS
// ============================================================
async function loadAdminStats() {
  const [usersRes, predsRes, matchRes] = await Promise.all([
    adminDb.from('app_users').select('id,username,created_at'),
    adminDb.from('predictions').select('id,user_id'),
    adminDb.from('matches').select('id,is_played'),
  ]);
  const users   = usersRes.data || [];
  const preds   = predsRes.data || [];
  const matches = matchRes.data || [];

  document.getElementById('stats-users').textContent  = users.length;
  document.getElementById('stats-played').textContent = matches.filter(m => m.is_played).length;
  document.getElementById('stats-preds').textContent  = preds.length;

  document.getElementById('admin-user-list').innerHTML = users.map(u => {
    const count = preds.filter(p => p.user_id === u.id).length;
    return `<div class="lb-row">
      <div class="lb-rank">–</div>
      <div class="lb-name">${esc(u.username)}</div>
      <div class="lb-pts" style="font-size:1rem">${count}</div>
      <div class="lb-cell">${new Date(u.created_at).toLocaleDateString('nb-NO')}</div>
      <div class="lb-cell"></div>
      <div class="lb-cell">
        <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id},'${esc(u.username)}')">Slett</button>
      </div>
    </div>`;
  }).join('');
}

async function deleteUser(id, name) {
  if (!confirm(`Slette "${name}"? Dette fjerner alle tipsene deres.`)) return;
  const { error } = await adminDb.from('app_users').delete().eq('id', id);
  if (error) { showAdminToast('Feil: ' + error.message); return; }
  showAdminToast(`"${name}" slettet.`);
  loadAdminStats();
}

// ============================================================
// TOAST
// ============================================================
function showAdminToast(msg) {
  const el = document.getElementById('admin-toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', adminInit);
