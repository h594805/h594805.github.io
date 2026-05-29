// ============================================================
// VM 2026 Tipping – Hovedapp
// ============================================================

const { createClient } = supabase;
let db = null;

const State = {
  user: null,
  matches: [],
  teams: [],
  predictions: [],
  allPredictions: [],
  allUsers: [],
  awardPredictions: [],
  awardResults: null,
  currentPage: 'dashboard',
  currentStage: 'group',
  currentGroup: 'A',
  currentTippingView: 'kamper',
  viewingUser: null,
  thirdTiebreaker: null,
};

// ============================================================
// UTILS
// ============================================================
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function sha256(message) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function flagUrl(code, size = 40) {
  if (!code) return '';
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

function flagImg(team, size = 40, cls = 'team-flag') {
  if (!team) return '<span class="flag-emoji">🏳️</span>';
  const url = flagUrl(team.country_code, size);
  const alt = team.name_no || team.name;
  return `<img class="${cls} flag-img" src="${url}" alt="${esc(alt)}" onerror="this.style.display='none';if(this.nextSibling)this.nextSibling.style.display='inline'"><span style="display:none">${flagEmoji(team.country_code)}</span>`;
}

const EMOJI_MAP = {
  'mx':'🇲🇽','za':'🇿🇦','kr':'🇰🇷','cz':'🇨🇿',
  'ca':'🇨🇦','ba':'🇧🇦','qa':'🇶🇦','ch':'🇨🇭',
  'br':'🇧🇷','ma':'🇲🇦','ht':'🇭🇹','gb-sct':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'us':'🇺🇸','py':'🇵🇾','au':'🇦🇺','tr':'🇹🇷',
  'de':'🇩🇪','cw':'🇨🇼','ci':'🇨🇮','ec':'🇪🇨',
  'nl':'🇳🇱','jp':'🇯🇵','se':'🇸🇪','tn':'🇹🇳',
  'be':'🇧🇪','eg':'🇪🇬','ir':'🇮🇷','nz':'🇳🇿',
  'es':'🇪🇸','cv':'🇨🇻','sa':'🇸🇦','uy':'🇺🇾',
  'fr':'🇫🇷','sn':'🇸🇳','iq':'🇮🇶','no':'🇳🇴',
  'ar':'🇦🇷','dz':'🇩🇿','at':'🇦🇹','jo':'🇯🇴',
  'pt':'🇵🇹','cd':'🇨🇩','uz':'🇺🇿','co':'🇨🇴',
  'gb-eng':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','hr':'🇭🇷','gh':'🇬🇭','pa':'🇵🇦',
};
function flagEmoji(code) { return EMOJI_MAP[(code||'').toLowerCase()] || '🏳️'; }

function teamById(id) { return State.teams.find(t => t.id === id) || null; }

const DAYS_NO   = ['søn','man','tir','ons','tor','fre','lør'];
const MONTHS_NO = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
function fmtDate(iso) {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return `${DAYS_NO[d.getDay()]} ${d.getDate()}. ${MONTHS_NO[d.getMonth()]} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ============================================================
// DEADLINE
// ============================================================
function deadlinePassed() { return new Date() >= CONFIG.DEADLINE; }

function deadlineText() {
  if (deadlinePassed()) return null;
  const ms   = CONFIG.DEADLINE - new Date();
  const days = Math.floor(ms / 86400000);
  const hrs  = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0)  return `${days} dag${days !== 1 ? 'er' : ''} ${hrs}t ${mins}min igjen`;
  if (hrs  > 0)  return `${hrs}t ${mins}min igjen`;
  return `${mins} min igjen`;
}

// ============================================================
// INIT
// ============================================================
async function init() {
  if (window.lucide) lucide.createIcons();
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('DIN-')) {
    showSetupWarning();
    return;
  }
  db = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

  const saved = localStorage.getItem('vm2026_user');
  if (saved) {
    try {
      State.user = JSON.parse(saved);
      await startApp();
      return;
    } catch { localStorage.removeItem('vm2026_user'); }
  }

  hideSplash();
  showPage('auth');
  setupAuthPage();
}

function showSetupWarning() {
  document.body.innerHTML = `
    <div class="full-screen">
      <div class="card" style="max-width:480px;text-align:center">
        <div style="font-size:2rem;margin-bottom:16px;color:var(--text-muted)">⚙</div>
        <h2 style="margin-bottom:16px">Konfigurer nettsiden</h2>
        <p class="muted" style="margin-bottom:20px">Fyll inn Supabase-nøklene i <strong>js/config.js</strong> før du starter.</p>
        <a href="setup.html" class="btn btn-gold">Åpne oppsett-verktøy</a>
      </div>
    </div>`;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const p = document.getElementById('page-' + id);
  if (p) p.classList.add('active');
}

// ============================================================
// AUTH PAGE
// ============================================================
function setupAuthPage() {
  switchAuthTab('login');
  document.getElementById('tab-login').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-register').addEventListener('click', () => switchAuthTab('register'));
  buildPinPad('login-pin-pad', 'login', handleLogin);
  buildPinPad('register-pin-pad', 'register', handleRegister);
}

function switchAuthTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab !== 'login');
  const authTabsEl = document.querySelector('#page-auth .auth-tabs');
  if (authTabsEl) authTabsEl.classList.toggle('tab-right', tab !== 'login');
  clearPin('login');
  clearPin('register');
}

function buildPinPad(containerId, prefix, onConfirm) {
  const container = document.getElementById(containerId);
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  container.innerHTML = keys.map(k => {
    let cls = 'pin-key';
    if (k === '⌫') cls += ' del';
    if (k === '✓') cls += ' confirm';
    return `<button type="button" class="${cls}">${k}</button>`;
  }).join('');
  container.querySelectorAll('.pin-key').forEach((btn, i) => {
    const action = keys[i] === '⌫' ? 'del' : keys[i] === '✓' ? 'confirm' : keys[i];
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      pinKey(prefix, action);
    }, { passive: false });
    btn.addEventListener('click', () => pinKey(prefix, action));
  });
}

const pins = { login: '', register: '' };

function pinKey(prefix, key) {
  if (key === 'del') {
    pins[prefix] = pins[prefix].slice(0, -1);
  } else if (key === 'confirm') {
    if (prefix === 'login') handleLogin();
    else handleRegister();
    return;
  } else {
    if (pins[prefix].length >= 4) return;
    pins[prefix] += key;
  }
  updatePinDots(prefix);
}

function updatePinDots(prefix) {
  document.querySelectorAll(`#${prefix}-dots .pin-dot`).forEach((d, i) =>
    d.classList.toggle('filled', i < pins[prefix].length)
  );
}

function clearPin(prefix) {
  pins[prefix] = '';
  updatePinDots(prefix);
}

async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('hidden');

  if (!username) { errEl.textContent = 'Skriv inn brukernavn.'; errEl.classList.remove('hidden'); return; }
  if (pins.login.length !== 4) { errEl.textContent = 'PIN-koden må være 4 siffer.'; errEl.classList.remove('hidden'); return; }

  const pinHash = await sha256(pins.login);
  const { data, error } = await db.from('app_users')
    .select('*').ilike('username', username).eq('pin_hash', pinHash).single();

  if (error || !data) {
    errEl.textContent = 'Feil brukernavn eller PIN. Prøv igjen.';
    errEl.classList.remove('hidden');
    clearPin('login');
    return;
  }

  State.user = data;
  localStorage.setItem('vm2026_user', JSON.stringify(data));
  await startApp();
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const errEl    = document.getElementById('reg-error');
  errEl.classList.add('hidden');

  if (deadlinePassed()) {
    errEl.textContent = 'Registrering er ikke lenger mulig etter tippefristens utløp (7. juni kl. 20:00).';
    errEl.classList.remove('hidden');
    return;
  }
  if (!username || username.length < 2) { errEl.textContent = 'Brukernavn må ha minst 2 tegn.'; errEl.classList.remove('hidden'); return; }
  if (pins.register.length !== 4) { errEl.textContent = 'PIN-koden må være 4 siffer.'; errEl.classList.remove('hidden'); return; }

  const pinHash = await sha256(pins.register);
  const { data, error } = await db.from('app_users')
    .insert([{ username, pin_hash: pinHash }]).select().single();

  if (error) {
    errEl.textContent = error.message.includes('unique')
      ? 'Brukernavn er allerede tatt. Velg et annet.'
      : 'Registrering feilet. Prøv igjen.';
    errEl.classList.remove('hidden');
    clearPin('register');
    return;
  }

  State.user = data;
  localStorage.setItem('vm2026_user', JSON.stringify(data));
  await startApp();
}

// ============================================================
// MAIN APP
// ============================================================
function hideSplash() {
  const s = document.getElementById('splash-screen');
  if (!s) return;
  setTimeout(() => {
    s.classList.add('fade-out');
    setTimeout(() => s.remove(), 650);
  }, 300);
}

async function startApp() {
  showPage('app');
  document.getElementById('header-username').textContent = State.user.username;

  await Promise.all([loadTeams(), loadMatches(), loadUsers(), loadAwardResults()]);
  await Promise.all([loadMyPredictions(), loadAllPredictions(), loadAwardPredictions()]);

  hideSplash();
  setupNav();
  renderHeaderDeadline();
  if (!deadlinePassed()) setInterval(renderHeaderDeadline, 60000);
  navigateTo('dashboard');
}

async function loadTeams()    { const { data } = await db.from('teams').select('*').order('group_letter').order('id'); State.teams = data || []; }
async function loadMatches()  { const { data } = await db.from('matches').select('*').order('match_number'); State.matches = data || []; }
async function loadMyPredictions()  { const { data } = await db.from('predictions').select('*').eq('user_id', State.user.id); State.predictions = data || []; }
async function loadAllPredictions() { const { data } = await db.from('predictions').select('*'); State.allPredictions = data || []; }
async function loadUsers()    { const { data } = await db.from('app_users').select('id, username, created_at'); State.allUsers = data || []; }
async function loadAwardResults()   { const { data } = await db.from('award_results').select('*').single(); State.awardResults = data || null; }
async function loadAwardPredictions() {
  const { data } = await db.from('award_predictions').select('*');
  State.awardPredictions = data || [];
  const mine = data?.find(a => a.user_id === State.user.id);
  State.thirdTiebreaker = null;
  if (mine?.third_tiebreaker) {
    try { State.thirdTiebreaker = JSON.parse(mine.third_tiebreaker); } catch {}
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.page !== 'oversikt') State.viewingUser = null;
      navigateTo(btn.dataset.page);
    });
  });
}

function viewPlayerOverview(userId) {
  State.viewingUser = State.allUsers.find(u => String(u.id) === String(userId)) || null;
  navigateTo('oversikt');
}

function navigateTo(page) {
  State.currentPage = page;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.app-section').forEach(s => s.classList.toggle('hidden', s.id !== 'section-' + page));
  window.scrollTo(0, 0);

  if      (page === 'dashboard')  renderDashboard();
  else if (page === 'oversikt')   renderOverview();
  else if (page === 'tipping')    renderTipping();
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const lb = Scoring.buildLeaderboard(State.allUsers, State.allPredictions, State.matches, State.teams, State.awardPredictions, State.awardResults);
  const me = lb.find(r => r.user.id === State.user.id) || { total:0, correct:0, exact:0, predictions:0 };
  const myRank = lb.indexOf(me) + 1;

  const rankEl  = document.getElementById('dash-rank');
  const ptsEl   = document.getElementById('dash-pts');
  const exactEl = document.getElementById('dash-exact');
  rankEl.textContent  = myRank ? `#${myRank}` : '–';
  ptsEl.textContent   = me.total;
  exactEl.textContent = me.exact;
  const isLast = lb.length >= 4 && myRank === lb.length;
  ['rank-1','rank-2','rank-3','rank-last'].forEach(c => { rankEl.classList.remove(c); ptsEl.classList.remove(c); exactEl.classList.remove(c); });
  if (myRank >= 1 && myRank <= 3) {
    rankEl.classList.add('rank-' + myRank);
    ptsEl.classList.add('rank-' + myRank);
    exactEl.classList.add('rank-' + myRank);
  } else if (isLast) {
    rankEl.classList.add('rank-last');
    ptsEl.classList.add('rank-last');
    exactEl.classList.add('rank-last');
  }

  const playedEl = document.getElementById('dash-played');
  if (playedEl) playedEl.textContent = `${State.matches.filter(m => m.is_played).length} kamper spilt`;

  // Full leaderboard
  const showLast = lb.length >= 4;
  document.getElementById('dash-leaderboard').innerHTML = lb.map((row, i) => {
    const meCls  = row.user.id === State.user.id ? ' me' : '';
    const isRowLast = showLast && i === lb.length - 1;
    const rankCls = i < 3 ? ' rank-'+(i+1) : isRowLast ? ' rank-last' : '';
    return `<div class="lb-row${meCls}${isRowLast ? ' lb-last' : ''}" style="cursor:pointer" onclick="viewPlayerOverview('${row.user.id}')">
      <div class="lb-rank${rankCls}">${i+1}</div>
      <div class="lb-name">${esc(row.user.username)}${row.user.id === State.user.id ? ' <span style="color:var(--gold);font-size:0.75rem">(deg)</span>' : ''}</div>
      <div class="lb-cell">${row.outcomePts}</div>
      <div class="lb-cell">${row.exactPts}</div>
      <div class="lb-pts${rankCls}">${row.total}</div>
    </div>`;
  }).join('');
}

// ============================================================
// TIPPING
// ============================================================
function renderTipping() {
  document.getElementById('view-tab-kamper').classList.toggle('active', State.currentTippingView === 'kamper');
  document.getElementById('view-tab-priser').classList.toggle('active', State.currentTippingView === 'priser');
  const tippingTabsEl = document.querySelector('#section-tipping .auth-tabs');
  if (tippingTabsEl) tippingTabsEl.classList.toggle('tab-right', State.currentTippingView !== 'kamper');
  document.getElementById('tipping-kamper-view').classList.toggle('hidden', State.currentTippingView !== 'kamper');
  document.getElementById('tipping-priser-view').classList.toggle('hidden', State.currentTippingView !== 'priser');

  if (State.currentTippingView === 'priser') {
    renderAwardsForm();
  } else {
    renderDeadlineBanner();
    setupStageTabs(
      document.getElementById('tipping-stage-tabs'),
      document.getElementById('tipping-group-tabs')
    );
    renderTippingList(document.getElementById('tipping-list'));
  }
}

function setTippingView(view) {
  State.currentTippingView = view;
  renderTipping();
}

function renderDeadlineBanner() {
  const el = document.getElementById('deadline-banner');
  if (!el) return;
  el.innerHTML = deadlinePassed()
    ? `<div class="alert alert-warning" style="margin-bottom:12px">Spådom er stengt. Du kan lese, men ikke endre spådommene dine.</div>`
    : '';
}

function renderHeaderDeadline() {
  const el = document.getElementById('header-frist');
  if (!el) return;
  if (deadlinePassed()) { el.textContent = ''; return; }
  const txt = deadlineText();
  el.textContent = txt ? `Frist: ${txt}` : '';
}

function setupStageTabs(stageEl, groupEl) {
  const stages = ['group','thirds','r32','r16','qf','sf','3rd','final'];
  stageEl.innerHTML = stages.map(s =>
    `<button class="tab-btn${State.currentStage===s?' active':''}" onclick="setTippingStage('${s}')">${CONFIG.STAGE_NAMES[s]}</button>`
  ).join('');
  renderGroupTabs(groupEl);
}

function renderGroupTabs(groupEl) {
  if (State.currentStage !== 'group') { groupEl.innerHTML = ''; return; }  // includes 'thirds'
  groupEl.innerHTML = 'ABCDEFGHIJKL'.split('').map(g =>
    `<button class="tab-btn${State.currentGroup===g?' active':''}" onclick="setTippingGroup('${g}')">${g}</button>`
  ).join('');
}

function setTippingStage(stage) {
  flushPendingSaves();
  State.currentStage = stage;
  if (stage === 'group') State.currentGroup = 'A';
  setupStageTabs(document.getElementById('tipping-stage-tabs'), document.getElementById('tipping-group-tabs'));
  renderDeadlineBanner();
  renderTippingList(document.getElementById('tipping-list'));
}

function setTippingGroup(g) {
  flushPendingSaves();
  State.currentGroup = g;
  document.querySelectorAll('#tipping-group-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.textContent === g));
  renderTippingList(document.getElementById('tipping-list'));
  const activeTab = document.querySelector('#tipping-group-tabs .tab-btn.active');
  if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// Swipe between groups (Fotmob-style)
const _swipe = { el: null, onStart: null, onEnd: null };

function attachGroupSwipe(el) {
  if (_swipe.el && _swipe.onStart) {
    _swipe.el.removeEventListener('touchstart', _swipe.onStart);
    _swipe.el.removeEventListener('touchend',   _swipe.onEnd);
  }
  let x0 = 0, y0 = 0;
  _swipe.onStart = e => { x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY; };
  _swipe.onEnd   = e => {
    if (State.currentStage !== 'group') return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    const groups = 'ABCDEFGHIJKL'.split('');
    const idx = groups.indexOf(State.currentGroup);
    if (dx < 0 && idx < groups.length - 1) setTippingGroup(groups[idx + 1]);
    else if (dx > 0 && idx > 0)            setTippingGroup(groups[idx - 1]);
  };
  _swipe.el = el;
  el.addEventListener('touchstart', _swipe.onStart, { passive: true });
  el.addEventListener('touchend',   _swipe.onEnd,   { passive: true });
}

function renderTippingList(listEl) {
  if (State.currentStage === 'thirds') {
    const bd = Bracket.build(State.predictions, State.teams, State.matches, State.thirdTiebreaker);
    listEl.innerHTML = renderTiebreakerSection(bd.allThirds);
    return;
  }

  const canEdit = !deadlinePassed();
  let matches;
  let bracketData = null;

  if (State.currentStage === 'group') {
    matches = State.matches
      .filter(m => m.stage === 'group' && m.group_letter === State.currentGroup)
      .slice()
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  } else {
    matches = State.matches
      .filter(m => m.stage === State.currentStage)
      .slice()
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
    bracketData = Bracket.build(State.predictions, State.teams, State.matches, State.thirdTiebreaker);
  }

  if (State.currentStage === 'group') attachGroupSwipe(listEl);

  if (matches.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><p class="empty-title">Ingen kamper ennå</p><p>Kampene i denne runden fastsettes etter forrige runde.</p></div>`;
    return;
  }

  let bracketNote = '';
  if (bracketData && State.currentStage !== 'group') {
    bracketNote = `<div class="bracket-note">Lag vist basert på dine gruppe-spådommer</div>`;
  }

  listEl.innerHTML = bracketNote + matches.map(m => {
    let bHome = null, bAway = null;
    if (bracketData?.predictedTeams?.[m.match_number]) {
      bHome = bracketData.predictedTeams[m.match_number].home;
      bAway = bracketData.predictedTeams[m.match_number].away;
    }
    return renderMatchCard(m, canEdit, bHome, bAway);
  }).join('');
}

function renderMatchCard(match, withInput, bracketHome = null, bracketAway = null) {
  const homeTeam = teamById(match.home_team_id) || bracketHome;
  const awayTeam = teamById(match.away_team_id) || bracketAway;
  const pred     = State.predictions.find(p => p.match_id === match.id);
  const locked   = deadlinePassed();
  const played   = match.is_played;

  const homeName = homeTeam ? (homeTeam.name_no || homeTeam.name) : (match.home_slot_desc || '?');
  const awayName = awayTeam ? (awayTeam.name_no || awayTeam.name) : (match.away_slot_desc || '?');

  const stageBadge = match.stage === 'group'
    ? `<span class="group-badge">Gruppe ${match.group_letter}</span>`
    : `<span class="stage-badge">${CONFIG.STAGE_NAMES[match.stage]}</span>`;

  const homeFlag = homeTeam ? flagImg(homeTeam, 40, 'flag-sm flag-img') : '';
  const awayFlag = awayTeam ? flagImg(awayTeam, 40, 'flag-sm flag-img') : '';

  // Center column: score, inputs, or vs
  let centerHTML;
  // Optional second row (played matches only)
  let predRowHTML = '';

  if (played) {
    const h = match.went_to_aet ? match.home_score_aet : match.home_score;
    const a = match.went_to_aet ? match.away_score_aet : match.away_score;
    centerHTML = `<div class="match-score-center">
      <div class="score-display played">${h} – ${a}</div>
      ${match.went_to_aet     ? '<div style="font-size:0.6rem;color:var(--text-muted);margin-top:1px">e.o.</div>'     : ''}
      ${match.went_to_penalties ? '<div style="font-size:0.6rem;color:var(--yellow);margin-top:1px">str.</div>' : ''}
    </div>`;
    if (pred) {
      const pts    = Scoring.calculate(pred.home_score_pred, pred.away_score_pred, match);
      const ptsCls = pts === CONFIG.SCORING[match.stage]?.exact ? 'pts-exact' : pts > 0 ? 'pts-outcome' : 'pts-zero';
      predRowHTML = `<div class="pred-row-sm">
        <span class="pred-label">Spådd: ${pred.home_score_pred}–${pred.away_score_pred}</span>
        <span class="pts-badge ${ptsCls}">${pts} poeng</span>
      </div>`;
    } else {
      predRowHTML = `<div class="pred-row-sm"><span class="pred-label" style="color:var(--red)">Ingen tipping</span></div>`;
    }
  } else if (withInput && !locked) {
    const hVal = pred?.home_score_pred ?? '';
    const aVal = pred?.away_score_pred ?? '';
    centerHTML = `<div class="match-input-center">
      <input type="number" class="score-input" id="ph-${match.id}" value="${hVal}" min="0" max="30" inputmode="numeric" placeholder="–" oninput="schedSave(${match.id})">
      <span class="score-dash">–</span>
      <input type="number" class="score-input" id="pa-${match.id}" value="${aVal}" min="0" max="30" inputmode="numeric" placeholder="–" oninput="schedSave(${match.id})">
      <span class="save-status" id="save-status-${match.id}"></span>
    </div>`;
  } else if (pred) {
    centerHTML = `<div class="match-score-center">
      <div class="score-pred">${pred.home_score_pred} – ${pred.away_score_pred}</div>
      <span class="pts-badge pts-pending" style="font-size:0.6rem;margin-top:2px">Venter</span>
    </div>`;
  } else {
    centerHTML = `<div class="match-score-center"><div class="score-vs">vs</div></div>`;
  }

  return `
    <div class="match-card${played?' played':''}${locked&&!played?' locked':''}">
      <div class="match-meta-sm">
        ${stageBadge}
        <span>${fmtDate(match.match_date)}</span>
      </div>
      <div class="match-inline-row">
        <div class="team-inline home">
          <span class="team-name-sm">${esc(homeName)}</span>${homeFlag}
        </div>
        ${centerHTML}
        <div class="team-inline away">
          ${awayFlag}<span class="team-name-sm">${esc(awayName)}</span>
        </div>
      </div>
      ${predRowHTML}
    </div>`;
}

// ============================================================
// PREDICTIONS OVERVIEW
// ============================================================
const BRACKET_SHORT = {
  'Elfenbenskysten': 'CI', 'Saudi-Arabia': 'KSA', 'Bosnia og Hercegovina': 'BiH',
  'Bosnia i Hercegovina': 'BiH', 'New Zealand': 'NZL', 'Costa Rica': 'CRC',
  'Trinidad og Tobago': 'TTO', 'Sør-Korea': 'KOR', 'DR Kongo': 'COD',
};
function bracketTeamName(team) {
  if (!team) return '?';
  const n = team.name_no || team.name || '?';
  if (BRACKET_SHORT[n]) return BRACKET_SHORT[n];
  return n.length > 10 ? n.substring(0, 10) : n;
}

function renderOverview() {
  const overviewEl = document.getElementById('oversikt-content');
  const titleEl    = document.getElementById('oversikt-title');
  if (!overviewEl) return;

  const viewer = State.viewingUser;
  const preds  = viewer
    ? State.allPredictions.filter(p => String(p.user_id) === String(viewer.id))
    : State.predictions;

  if (titleEl) titleEl.textContent = viewer ? `${viewer.username}s spådommer` : 'Mine spådommer';

  if (preds.length === 0) {
    overviewEl.innerHTML = `<div class="empty-state"><p class="empty-title">Ingen spådommer ennå</p><p>Spå kampene i gruppespillet for å se oversikten.</p></div>`;
    return;
  }

  const bracketData = Bracket.build(preds, State.teams, State.matches, viewer ? null : State.thirdTiebreaker);

  // Group predicted standings
  let html = '<div class="section-title" style="margin-bottom:10px">Gruppeprediksjoner</div>';
  html += '<div class="overview-groups">';
  for (const g of 'ABCDEFGHIJKL'.split('')) {
    const standings = bracketData.allStandings[g];
    const groupMatches = State.matches.filter(m => m.stage === 'group' && m.group_letter === g);
    const tippedCount = groupMatches.filter(m => preds.find(p => p.match_id === m.id)).length;
    const incomplete = tippedCount < groupMatches.length;
    html += `<div class="ov-group">
      <div class="ov-group-header">Gruppe ${g}</div>
      ${standings.map((r, i) => `
        <div class="ov-group-row ${i < 2 ? 'ov-qual' : i === 2 ? 'ov-third' : ''}">
          <span class="ov-pos">${i+1}</span>
          ${r.team ? flagImg(r.team, 20, 'flag-xs flag-img') : ''}
          <span class="ov-name">${esc(r.team ? (r.team.name_no || r.team.name) : '?')}</span>
          <span class="ov-pts">${r.pts}p</span>
        </div>`).join('')}
      ${incomplete ? `<div class="ov-incomplete">${tippedCount}/${groupMatches.length} spådd</div>` : ''}
    </div>`;
  }
  html += '</div>';
  html += '<p style="font-size:0.7rem;color:var(--text-muted);margin-bottom:16px"><span style="color:var(--green)">■</span> Videre &nbsp;·&nbsp; <span style="color:var(--yellow)">■</span> Mulig videre</p>';

  // Best thirds section – same card/row style as group standings
  html += '<div class="section-title" style="margin-bottom:10px">De beste treerne</div>';
  html += '<div class="ov-thirds-card">';
  html += `<div class="ov-thirds-header">
    <span class="ov-thirds-rank">#</span>
    <span class="ov-thirds-name">Lag</span>
    <span class="ov-thirds-stat">Pts</span>
    <span class="ov-thirds-stat">W</span>
    <span class="ov-thirds-stat">D</span>
    <span class="ov-thirds-stat">L</span>
    <span class="ov-thirds-stat">GD</span>
  </div>`;
  bracketData.allThirds.forEach((t, i) => {
    if (i === 8) html += '<div class="ov-thirds-cut"></div>';
    const gd = t.gd > 0 ? `+${t.gd}` : `${t.gd ?? 0}`;
    const gdCls = t.gd > 0 ? 'bt-gd-pos' : t.gd < 0 ? 'bt-gd-neg' : '';
    html += `<div class="ov-thirds-row${i < 8 ? ' ov-thirds-advance' : ''}">
      <span class="ov-thirds-rank">${i+1}</span>
      <span class="ov-thirds-name">
        ${t.team ? flagImg(t.team, 20, 'flag-xs flag-img') : ''}
        <span>${esc(t.team ? (t.team.name_no || t.team.name) : '?')}</span>
      </span>
      <span class="ov-thirds-stat"><strong>${t.pts}</strong></span>
      <span class="ov-thirds-stat">${t.w ?? 0}</span>
      <span class="ov-thirds-stat">${t.d ?? 0}</span>
      <span class="ov-thirds-stat">${t.l ?? 0}</span>
      <span class="ov-thirds-stat ${gdCls}">${gd}</span>
    </div>`;
  });
  html += '</div>';

  // Knockout bracket
  html += '<div class="section-title" style="margin-bottom:10px">Sluttspill</div>';
  html += renderBracketTree(bracketData);

  overviewEl.innerHTML = html;
}

function renderBracketTree(bracketData) {
  const { predictedTeams, predictedWinner } = bracketData;

  // Matches grouped into pairs that feed into the same next-round slot
  const rounds = [
    { label: '16-del', pairs: [[74,77],[73,75],[83,84],[81,82],[76,78],[79,80],[86,88],[85,87]] },
    { label: '8-del',  pairs: [[89,90],[93,94],[91,92],[95,96]] },
    { label: 'KF',     pairs: [[97,98],[99,100]] },
    { label: 'SF',     pairs: [[101,102]] },
    { label: 'Finale', pairs: [[104]] },
  ];

  const teamRow = (team, isWinner) => {
    if (!team) return `<div class="bracket-team tbd"><span>?</span></div>`;
    const n = bracketTeamName(team);
    return `<div class="bracket-team${isWinner ? ' winner' : ''}" title="${esc(team.name_no || team.name)}">
      ${flagImg(team, 20, 'flag-xs flag-img')}
      <span>${esc(n)}</span>
    </div>`;
  };

  let html = '<div class="bracket-wrap"><div class="bracket-grid">';
  for (const round of rounds) {
    html += `<div class="bracket-round">
      <div class="bracket-round-label">${round.label}</div>
      <div class="bracket-round-matches">`;
    for (const pair of round.pairs) {
      const linked = pair.length > 1;
      html += `<div class="bracket-pair${linked ? ' bracket-pair-linked' : ''}">`;
      for (const num of pair) {
        const slot    = predictedTeams[num] || {};
        const winner  = predictedWinner ? predictedWinner[num] : null;
        const homeWon = winner && slot.home && winner.id === slot.home.id;
        const awayWon = winner && slot.away && winner.id === slot.away.id;
        html += `<div class="bracket-match">
          ${teamRow(slot.home, homeWon)}
          ${teamRow(slot.away, awayWon)}
        </div>`;
      }
      html += '</div>';
    }
    html += '</div></div>';
  }
  html += '</div></div>';
  return html;
}

// Auto-save debounce (per match)
const _saveTimers = {};
function schedSave(matchId) {
  clearTimeout(_saveTimers[matchId]);
  _saveTimers[matchId] = setTimeout(() => savePrediction(matchId, true), 900);
}

// Fire all pending saves immediately before navigating away
function flushPendingSaves() {
  for (const matchId of Object.keys(_saveTimers)) {
    clearTimeout(_saveTimers[matchId]);
    delete _saveTimers[matchId];
    savePrediction(parseInt(matchId), true);
  }
}

async function savePrediction(matchId, auto = false) {
  if (deadlinePassed()) return;

  const hInput = document.getElementById(`ph-${matchId}`);
  const aInput = document.getElementById(`pa-${matchId}`);
  if (!hInput || !aInput) return;

  const h = parseInt(hInput.value);
  const a = parseInt(aInput.value);
  if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
    if (!auto) alert('Ugyldig resultat – skriv inn to tall (0 eller høyere).');
    return;
  }

  const statusEl = document.getElementById(`save-status-${matchId}`);
  if (statusEl) { statusEl.textContent = '…'; statusEl.className = 'save-status saving'; }

  const existing = State.predictions.find(p => p.match_id === matchId);
  let error;

  if (existing) {
    const res = await db.from('predictions')
      .update({ home_score_pred: h, away_score_pred: a, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    error = res.error;
    if (!error) { existing.home_score_pred = h; existing.away_score_pred = a; }
  } else {
    const res = await db.from('predictions')
      .insert([{ user_id: State.user.id, match_id: matchId, home_score_pred: h, away_score_pred: a }])
      .select().single();
    error = res.error;
    if (!error) State.predictions.push(res.data);
  }

  if (statusEl) {
    if (error) {
      statusEl.textContent = '✗';
      statusEl.className = 'save-status error';
      if (!auto) alert('Klarte ikke lagre. Prøv igjen.');
    } else {
      statusEl.textContent = '✓';
      statusEl.className = 'save-status ok';
      setTimeout(() => { if (statusEl) { statusEl.textContent = ''; statusEl.className = 'save-status'; } }, 2500);
    }
  } else if (error && !auto) {
    alert('Klarte ikke lagre. Prøv igjen.');
  }
}

// ============================================================
// TIEBREAKER (tredjeplass-rekkefølge)
// ============================================================

async function saveTiebreaker(order) {
  if (deadlinePassed()) return;
  State.thirdTiebreaker = order;
  const val = JSON.stringify(order);
  const existing = State.awardPredictions.find(a => a.user_id === State.user.id);
  if (existing) {
    await db.from('award_predictions').update({ third_tiebreaker: val, updated_at: new Date().toISOString() }).eq('id', existing.id);
    existing.third_tiebreaker = val;
  } else {
    const { data } = await db.from('award_predictions').insert([{ user_id: State.user.id, third_tiebreaker: val }]).select().single();
    if (data) State.awardPredictions.push(data);
  }
}

function moveTiebreaker(fromIdx, direction) {
  if (deadlinePassed()) return;
  const bd = Bracket.build(State.predictions, State.teams, State.matches, State.thirdTiebreaker);
  const all = bd.allThirds;
  const toIdx = fromIdx + direction;
  if (toIdx < 0 || toIdx >= all.length) return;
  const ids = all.map(t => t.team.id);
  [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
  saveTiebreaker(ids);
  renderTipping();
}

function renderTiebreakerSection(allThirds) {
  if (!allThirds || allThirds.length === 0) return '';
  const locked = deadlinePassed();
  const isTied = (a, b) => a && b && Bracket.isTiedThird(a, b);

  let html = `<div style="margin-bottom:24px">
    <div class="section-title" style="margin-bottom:6px">Rekkefølge blant beste treere</div>
    <p class="muted" style="font-size:0.75rem;margin-bottom:10px">De 8 øverste går videre til 16-delsfinalen. Flytt opp/ned lag som er helt like på alle kriterier.</p>
    <div class="ov-thirds-card ov-thirds-tb">
      <div class="ov-thirds-header">
        <span class="ov-thirds-rank">#</span>
        <span class="ov-thirds-name">Lag</span>
        <span class="ov-thirds-stat">Pts</span>
        <span class="ov-thirds-stat">W</span>
        <span class="ov-thirds-stat">D</span>
        <span class="ov-thirds-stat">L</span>
        <span class="ov-thirds-stat">GD</span>
        <span></span>
      </div>`;

  allThirds.forEach((t, i) => {
    const prevTied = i > 0 && isTied(allThirds[i - 1], t);
    const nextTied = i < allThirds.length - 1 && isTied(t, allThirds[i + 1]);
    const inTie = prevTied || nextTied;
    if (i === 8) html += '<div class="ov-thirds-cut"></div>';
    const gd = (t.gd >= 0 ? '+' : '') + (t.gd ?? 0);
    const gdCls = t.gd > 0 ? 'bt-gd-pos' : t.gd < 0 ? 'bt-gd-neg' : '';
    html += `<div class="ov-thirds-row${i < 8 ? ' ov-thirds-advance' : ''}${inTie ? ' ov-thirds-tied' : ''}">
      <span class="ov-thirds-rank">${i + 1}</span>
      <span class="ov-thirds-name">
        ${t.team ? flagImg(t.team, 20, 'flag-xs flag-img') : ''}
        <span>${esc(t.team ? (t.team.name_no || t.team.name) : '?')}</span>
      </span>
      <span class="ov-thirds-stat"><strong>${t.pts}</strong></span>
      <span class="ov-thirds-stat">${t.w ?? 0}</span>
      <span class="ov-thirds-stat">${t.d ?? 0}</span>
      <span class="ov-thirds-stat">${t.l ?? 0}</span>
      <span class="ov-thirds-stat ${gdCls}">${gd}</span>
      <span class="ov-thirds-btns">${inTie && !locked
        ? `<button class="tb-btn" onclick="moveTiebreaker(${i},-1)"${!prevTied  ? ' disabled' : ''}>▲</button>
           <button class="tb-btn" onclick="moveTiebreaker(${i}, 1)"${!nextTied ? ' disabled' : ''}>▼</button>`
        : ''}</span>
    </div>`;
  });

  html += '</div></div>';
  return html;
}

// ============================================================
// AWARDS FORM (Priser tab)
// ============================================================

function renderAwardsForm() {
  const userAward = State.awardPredictions.find(a => a.user_id === State.user.id) || {};
  const locked    = deadlinePassed();
  const el        = document.getElementById('awards-form');
  const groups = [
    {
      title: 'Beste spiller',
      fields: [
        ['best_player_1','1. plass'],
        ['best_player_2','2. plass'],
        ['best_player_3','3. plass'],
      ],
    },
    {
      title: 'Toppscorer',
      fields: [
        ['top_scorer_1','1. plass'],
        ['top_scorer_2','2. plass'],
        ['top_scorer_3','3. plass'],
      ],
    },
  ];

  const fieldsHtml = (readOnly) => groups.map(g => `
    <div class="section-title" style="margin:18px 0 10px">${esc(g.title)}</div>
    ${g.fields.map(([key, label]) => `
      <div class="form-group">
        <label>${esc(label)}</label>
        ${readOnly
          ? `<div class="form-input" style="opacity:0.7;cursor:default">${esc(userAward[key] || '–')}</div>`
          : `<input type="text" class="form-input" id="award-${key}" value="${esc(userAward[key] || '')}" placeholder="Fullt navn..." ${State.awardResults?.[key] ? 'disabled' : ''}>`
        }
      </div>`).join('')}
  `).join('');

  if (locked) {
    el.innerHTML = `
      <p class="muted" style="font-size:0.85rem;margin-bottom:4px">Spådomsfrist passert – spådommene er låst.</p>
      ${fieldsHtml(true)}`;
    return;
  }

  el.innerHTML = `
    <p class="muted" style="font-size:0.85rem;margin-bottom:4px">Skriv fullt navn uten spesialtegn – f.eks. Erling Haaland</p>
    ${fieldsHtml(false)}
    <button class="btn btn-gold btn-full" style="margin-top:8px" onclick="saveAwards()">Lagre prisprediksjon</button>
    <div id="awards-msg" class="mt-8 hidden"></div>`;
}

async function saveAwards() {
  if (deadlinePassed()) return;
  const fields = ['best_player_1','best_player_2','best_player_3','top_scorer_1','top_scorer_2','top_scorer_3'];
  const obj = { user_id: State.user.id };
  fields.forEach(f => { obj[f] = document.getElementById('award-' + f)?.value?.trim() || null; });

  const existing = State.awardPredictions.find(a => a.user_id === State.user.id);
  let error;
  if (existing) {
    const r = await db.from('award_predictions').update({ ...obj, updated_at: new Date().toISOString() }).eq('id', existing.id);
    error = r.error;
    if (!error) Object.assign(existing, obj);
  } else {
    const r = await db.from('award_predictions').insert([obj]).select().single();
    error = r.error;
    if (!error) State.awardPredictions.push(r.data);
  }

  const msgEl = document.getElementById('awards-msg');
  msgEl.className = error ? 'alert alert-error mt-8' : 'alert alert-success mt-8';
  msgEl.textContent = error ? 'Feil ved lagring. Prøv igjen.' : 'Prisprediksjon lagret! ✓';
  msgEl.classList.remove('hidden');
  setTimeout(() => msgEl.classList.add('hidden'), 3000);
}

// ============================================================
// LOGOUT
// ============================================================
function logout() {
  State.user = null;
  localStorage.removeItem('vm2026_user');
  showPage('auth');
  setupAuthPage();
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', init);
