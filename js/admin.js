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
async function loadAdminData() {
  const [matchRes, teamRes] = await Promise.all([
    adminDb.from('matches').select('*').order('match_number'),
    adminDb.from('teams').select('*').order('id'),
  ]);
  adminData.matches = matchRes.data || [];
  adminData.teams   = teamRes.data  || [];
  renderAdminMatchList('group', 'A');
  setupAdminTabs();
}

function adminTeamById(id) { return adminData.teams.find(t => t.id === id) || null; }
function adminTeamName(id, slotDesc) {
  const t = adminTeamById(id);
  return t ? (t.name_no || t.name) : (slotDesc || 'TBD');
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

  document.querySelectorAll('.admin-stage-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-stage-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const group = document.querySelector('.admin-group-tab.active')?.dataset.group || 'A';
      renderAdminMatchList(tab.dataset.stage, group);
    });
  });
  document.querySelectorAll('.admin-group-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-group-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAdminMatchList('group', tab.dataset.group);
    });
  });
}

// ============================================================
// MATCH LIST
// ============================================================
function renderAdminMatchList(stage, group) {
  const el = document.getElementById('admin-match-list');
  const matches = stage === 'group'
    ? adminData.matches.filter(m => m.stage === 'group' && m.group_letter === group)
    : adminData.matches.filter(m => m.stage === stage);

  if (!matches.length) {
    el.innerHTML = `<div class="empty-state"><p>Ingen kamper her ennå</p></div>`;
    return;
  }
  el.innerHTML = matches.map(m => renderAdminMatchRow(m)).join('');
}

function renderAdminMatchRow(m) {
  const ht = adminTeamById(m.home_team_id);
  const at = adminTeamById(m.away_team_id);
  const homeName = adminTeamName(m.home_team_id, m.home_slot_desc);
  const awayName = adminTeamName(m.away_team_id, m.away_slot_desc);

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

  const activeStage = document.querySelector('.admin-stage-tab.active');
  const activeGroup = document.querySelector('.admin-group-tab.active');
  renderAdminMatchList(activeStage?.dataset.stage || 'group', activeGroup?.dataset.group || 'A');

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

  const activeStage = document.querySelector('.admin-stage-tab.active');
  const activeGroup = document.querySelector('.admin-group-tab.active');
  renderAdminMatchList(activeStage?.dataset.stage || 'group', activeGroup?.dataset.group || 'A');

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
