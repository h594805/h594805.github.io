// ============================================================
// PL-Tipping – Hovedapp
// ============================================================

const { createClient } = supabase;
let db = null;

const State = {
  user:      null,   // innlogget bruker (fra pl_users)
  teams:     [],
  users:     [],
  preds:     [],     // alle spådommer, alle spillere
  settings:  null,
  myOrder:   [],     // team_id i rekkefølge, 1. plass først
  page:      'dashboard',
  playerIdx: -1,     // hvilken spiller som vises i detaljvisning
};

const STORE_KEY = 'pltipping_user';

// ============================================================
// UTILS
// ============================================================
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/** Tall med norsk desimalkomma. */
function fmt1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }

function teamById(id) { return State.teams.find(t => String(t.id) === String(id)) || null; }

/** Klubbmerke med fargemerke som reserve hvis bildet ikke laster. */
function crest(team, cls = 'crest') {
  if (!team) return `<span class="${cls}"></span>`;
  const fb = `<span class="crest-fb" style="--c:${esc(team.color || '#8e8e93')}">${esc(team.short || '?')}</span>`;
  const img = team.logo_url
    ? `<img src="${esc(team.logo_url)}" alt="" loading="lazy" decoding="async"
           onload="this.previousElementSibling.style.opacity=0"
           onerror="this.remove()">`
    : '';
  return `<span class="${cls}">${fb}${img}</span>`;
}

function initials(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

const MONTHS_NO = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS_NO[d.getMonth()]}`;
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${fmtDate(iso)} kl. ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function toast(msg, kind = 'ok') {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    document.body.appendChild(el);
  }
  el.className = 'app-toast ' + kind;
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

// ============================================================
// FRIST OG LÅS
// ============================================================
function deadline() {
  return State.settings?.deadline ? new Date(State.settings.deadline) : CONFIG.DEADLINE;
}
function deadlinePassed() { return new Date() >= deadline(); }

function deadlineText() {
  const ms = deadline() - new Date();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86400000);
  const hrs  = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days} dag${days !== 1 ? 'er' : ''} ${hrs}t`;
  if (hrs  > 0) return `${hrs}t ${mins}min`;
  return `${mins} min`;
}

function me() {
  return State.users.find(u => String(u.id) === String(State.user?.id)) || State.user;
}
function iAmLocked()  { return !!me()?.locked_at; }
function canEdit()    { return !iAmLocked() && !deadlinePassed(); }
/** Kan man se andres tabeller? */
function canReveal()  { return deadlinePassed() || !!State.settings?.reveal_predictions; }

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

  const saved = localStorage.getItem(STORE_KEY);
  if (saved) {
    try {
      State.user = JSON.parse(saved);
      await startApp();
      return;
    } catch { localStorage.removeItem(STORE_KEY); }
  }

  await loadSettings();
  document.getElementById('auth-season').textContent = State.settings?.season || CONFIG.SEASON;
  hideSplash();
  showPage('auth');
  setupAuthPage();
}

function showSetupWarning() {
  document.body.innerHTML = `
    <div class="full-screen">
      <div class="card" style="max-width:480px;text-align:center">
        <h2 class="mb-16">Konfigurer nettsiden</h2>
        <p class="muted mb-16">Fyll inn Supabase-nøklene i <strong>js/config.js</strong> før du starter.</p>
        <a href="setup.html" class="btn btn-gold">Åpne oppsett-verktøy</a>
      </div>
    </div>`;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id)?.classList.add('active');
}

function hideSplash() {
  const s = document.getElementById('splash-screen');
  if (!s) return;
  setTimeout(() => {
    s.classList.add('fade-out');
    setTimeout(() => s.remove(), 650);
  }, 300);
}

// ============================================================
// AUTH
// ============================================================
function setupAuthPage() {
  switchAuthTab('login');
  document.getElementById('tab-login').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-register').addEventListener('click', () => switchAuthTab('register'));
  buildPinPad('login-pin-pad', 'login');
  buildPinPad('register-pin-pad', 'register');
}

function switchAuthTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab !== 'login');
  document.querySelector('#page-auth .auth-tabs')?.classList.toggle('tab-right', tab !== 'login');
  clearPin('login');
  clearPin('register');
}

function buildPinPad(containerId, prefix) {
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
    btn.addEventListener('pointerdown', e => { e.preventDefault(); pinKey(prefix, action); });
  });
}

const pins = { login: '', register: '' };

function pinKey(prefix, key) {
  if (key === 'del') {
    pins[prefix] = pins[prefix].slice(0, -1);
  } else if (key === 'confirm') {
    if (prefix === 'login') handleLogin(); else handleRegister();
    return;
  } else {
    if (pins[prefix].length >= 4) return;
    pins[prefix] += key;
    if (navigator.vibrate) navigator.vibrate(8);
  }
  updatePinDots(prefix);
}

function updatePinDots(prefix) {
  document.querySelectorAll(`#${prefix}-dots .pin-dot`)
    .forEach((d, i) => d.classList.toggle('filled', i < pins[prefix].length));
}

function clearPin(prefix) { pins[prefix] = ''; updatePinDots(prefix); }

function authError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  document.getElementById('login-error').classList.add('hidden');

  if (!username)              return authError('login-error', 'Skriv inn navnet ditt.');
  if (pins.login.length !== 4) return authError('login-error', 'PIN-koden må være 4 siffer.');

  const pinHash = await sha256(pins.login);
  const { data, error } = await db.from('pl_users')
    .select('*').ilike('username', username).eq('pin_hash', pinHash).maybeSingle();

  if (error || !data) {
    clearPin('login');
    return authError('login-error', 'Feil navn eller PIN. Prøv igjen.');
  }

  State.user = data;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  await startApp();
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  document.getElementById('reg-error').classList.add('hidden');

  if (deadlinePassed())
    return authError('reg-error', 'Fristen har gått ut – det er ikke mulig å registrere seg lenger.');
  if (username.length < 2)
    return authError('reg-error', 'Navnet må ha minst 2 tegn.');
  if (pins.register.length !== 4)
    return authError('reg-error', 'PIN-koden må være 4 siffer.');

  const pinHash = await sha256(pins.register);
  const { data, error } = await db.from('pl_users')
    .insert([{ username, pin_hash: pinHash }]).select().single();

  if (error) {
    clearPin('register');
    return authError('reg-error', /unique|duplicate/i.test(error.message || '')
      ? 'Navnet er allerede tatt. Velg et annet.'
      : 'Registrering feilet. Prøv igjen.');
  }

  State.user = data;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  await startApp();
}

// ============================================================
// LASTING
// ============================================================
async function loadSettings() {
  const { data } = await db.from('pl_settings').select('*').eq('id', 1).maybeSingle();
  State.settings = data || null;
}
async function loadTeams() {
  const { data } = await db.from('pl_teams').select('*').order('sort_order').order('id');
  State.teams = data || [];
}
async function loadUsers() {
  const { data } = await db.from('pl_users').select('id, username, locked_at, created_at').order('id');
  State.users = data || [];
}
async function loadPredictions() {
  // Sideveis lasting – PostgREST returnerer maks 1000 rader per kall
  const size = 1000;
  let from = 0, all = [];
  while (true) {
    const { data, error } = await db.from('pl_predictions')
      .select('*').order('id').range(from, from + size - 1);
    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < size) break;
    from += size;
  }
  State.preds = all;
}

function buildMyOrder() {
  const mine = Scoring.order(State.preds, State.user.id);
  const rest = State.teams.map(t => t.id).filter(id => !mine.includes(id));
  State.myOrder = [...mine.filter(id => teamById(id)), ...rest];
}

async function startApp() {
  showPage('app');
  document.getElementById('header-username').textContent = State.user.username;

  await Promise.all([loadSettings(), loadTeams(), loadUsers(), loadPredictions()]);
  buildMyOrder();

  const season = State.settings?.season || CONFIG.SEASON;
  document.getElementById('header-season').textContent = season.replace(/^20/, '');

  hideSplash();
  setupNav();
  renderHeaderDeadline();
  if (!deadlinePassed()) setInterval(renderHeaderDeadline, 60000);
  navigateTo('dashboard');
  if (window.lucide) lucide.createIcons();
}

function renderHeaderDeadline() {
  const el = document.getElementById('header-frist');
  if (!el) return;
  if (deadlinePassed()) { el.textContent = ''; return; }
  const txt = deadlineText();
  el.textContent = txt ? `Frist: ${txt}` : '';
}

// ============================================================
// NAVIGASJON
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
}

function navigateTo(page) {
  if (State.page === 'tipping' && page !== 'tipping') flushSave();
  State.page = page;
  if (page !== 'players') State.playerIdx = -1;

  document.querySelectorAll('.nav-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.app-section')
    .forEach(s => s.classList.toggle('hidden', s.id !== 'section-' + page));
  window.scrollTo(0, 0);

  if      (page === 'dashboard') renderDashboard();
  else if (page === 'tipping')   renderTipping();
  else if (page === 'players')   renderPlayers();
  else if (page === 'stats')     renderStats();

  if (window.lucide) lucide.createIcons();
}

// ============================================================
// TABELL (dashboard)
// ============================================================
function renderDashboard() {
  const hasRes = Scoring.hasResults(State.teams);
  const lb  = Scoring.buildLeaderboard(State.users, State.preds, State.teams);
  const mine = lb.find(r => String(r.user.id) === String(State.user.id));
  const myRank = mine ? lb.indexOf(mine) + 1 : 0;

  const rankEl  = document.getElementById('dash-rank');
  const ptsEl   = document.getElementById('dash-pts');
  const exactEl = document.getElementById('dash-exact');

  ['rank-1','rank-2','rank-3','rank-last'].forEach(c =>
    [rankEl, ptsEl, exactEl].forEach(e => e.classList.remove(c)));

  if (hasRes && mine) {
    rankEl.textContent  = `#${myRank}`;
    ptsEl.textContent   = mine.total;
    exactEl.textContent = mine.exact;
    const isLast = lb.length >= 4 && myRank === lb.length;
    const cls = myRank <= 3 ? 'rank-' + myRank : isLast ? 'rank-last' : null;
    if (cls) [rankEl, ptsEl, exactEl].forEach(e => e.classList.add(cls));
  } else {
    rankEl.textContent  = '–';
    ptsEl.textContent   = '–';
    exactEl.textContent = '–';
  }

  // Statusbanner
  const statusEl = document.getElementById('dash-status');
  const done = State.teams.filter(t => t.actual_position != null).length;
  if (!hasRes) {
    const left = deadlineText();
    statusEl.innerHTML = deadlinePassed()
      ? `<div class="alert alert-info mb-16">Sesongen er i gang. Poengene dukker opp her så snart tabellen legges inn.</div>`
      : `<div class="alert alert-info mb-16">Tippefrist <strong>${esc(fmtDateTime(deadline()))}</strong>${left ? ` – ${esc(left)} igjen` : ''}. Husk å låse tabellen din!</div>`;
  } else if (!State.settings?.season_finished) {
    statusEl.innerHTML = `<div class="alert alert-warning mb-16">Foreløpig stilling – basert på tabellen per ${esc(fmtDate(State.settings?.table_updated_at) || 'nå')}${done < State.teams.length ? ` (${done}/${State.teams.length} lag lagt inn)` : ''}.</div>`;
  } else {
    statusEl.innerHTML = `<div class="alert alert-success mb-16">Sesongen er ferdig – dette er den endelige stillingen. 🏆</div>`;
  }

  document.getElementById('dash-sub').textContent = hasRes
    ? 'Færrest poeng vinner'
    : `${State.users.filter(u => u.locked_at).length}/${State.users.length} har låst`;

  const showLast = hasRes && lb.length >= 4;
  document.getElementById('dash-leaderboard').innerHTML = lb.length === 0
    ? `<div class="empty-state"><p class="empty-title">Ingen deltakere ennå</p><p>Del linken med gjengen!</p></div>`
    : lb.map((row, i) => {
      const isMe   = String(row.user.id) === String(State.user.id);
      const isLast = showLast && i === lb.length - 1;
      const rankCls = hasRes ? (i < 3 ? ' rank-' + (i+1) : isLast ? ' rank-last' : '') : '';
      const right = hasRes
        ? `<div class="lb-cell">${row.exact}</div><div class="lb-pts${rankCls}">${row.total}</div>`
        : `<div class="lb-cell">${row.tipped}/${State.teams.length}</div>
           <div class="lb-cell">${row.locked
              ? '<span class="lock-pill locked">Låst</span>'
              : '<span class="lock-pill">Åpen</span>'}</div>`;
      return `<div class="lb-row lb-pl${isMe ? ' me' : ''}${isLast ? ' lb-last' : ''}"
                   onclick="openPlayerById('${row.user.id}')">
        <div class="lb-rank${rankCls}">${hasRes ? i + 1 : ''}</div>
        <div class="lb-name">${esc(row.user.username)}${isMe ? ' <span class="you">(deg)</span>' : ''}</div>
        ${right}
      </div>`;
    }).join('');
}

// ============================================================
// SPÅ – min tabell
// ============================================================
function renderTipping() {
  const editable = canEdit();
  const listEl   = document.getElementById('tip-list');
  const hasRes   = Scoring.hasResults(State.teams);

  // Banner
  const banner = document.getElementById('tip-banner');
  if (iAmLocked()) {
    banner.innerHTML = `<div class="alert alert-success mb-16">
      Tabellen din er låst ${esc(fmtDateTime(me().locked_at))}. Lykke til! 🤞</div>`;
  } else if (deadlinePassed()) {
    banner.innerHTML = `<div class="alert alert-warning mb-16">
      Fristen har gått ut – tabellen din er låst automatisk.</div>`;
  } else {
    banner.innerHTML = `<div class="alert alert-info mb-16">
      Sett laga i den rekkefølgen du tror tabellen ender.
      Endringer lagres automatisk fram til du låser.</div>`;
  }

  document.getElementById('tip-hint').classList.toggle('hidden', !editable);
  document.getElementById('tip-title').textContent = editable ? 'Din tabell' : 'Din tabell (låst)';

  const actual = Scoring.actualMap(State.teams);
  listEl.innerHTML = State.myOrder.map((id, i) => {
    const t = teamById(id);
    if (!t) return '';
    return predRow(t, i + 1, editable, hasRes ? actual.get(t.id) ?? null : null);
  }).join('');

  if (editable) {
    Reorder.attach(listEl, ids => {
      State.myOrder = ids.map(Number);
      renderTipping();
      schedSave();
    }, canEdit);
  }

  // Knapper
  const actions = document.getElementById('tip-actions');
  if (editable) {
    actions.innerHTML = `
      <button class="btn btn-gold btn-full mt-16" onclick="lockPredictions()">
        <i data-lucide="lock"></i> Lås inn tabellen
      </button>
      <p class="muted tiny ta-c mt-8">Når du låser kan du ikke endre mer.</p>`;
  } else if (hasRes) {
    const s = Scoring.scoreUser(State.preds, State.user.id, State.teams);
    actions.innerHTML = `<div class="score-summary mt-16">
      <div><span class="ss-val">${s.total}</span><span class="ss-lab">bompoeng</span></div>
      <div><span class="ss-val">${s.exact}</span><span class="ss-lab">på blinken</span></div>
    </div>`;
  } else {
    actions.innerHTML = '';
  }
  if (window.lucide) lucide.createIcons();
}

function predRow(t, pos, editable, actualPos) {
  const zone = zoneFor(pos);
  let right = '';

  if (editable) {
    right = `<span class="pt-tools">
      <button class="pt-arrow" onclick="moveTeam(${t.id},-1)" aria-label="Flytt opp"${pos === 1 ? ' disabled' : ''}>▲</button>
      <button class="pt-arrow" onclick="moveTeam(${t.id},1)" aria-label="Flytt ned"${pos === State.myOrder.length ? ' disabled' : ''}>▼</button>
      <span class="pt-grip" data-grip aria-hidden="true">⠿</span>
    </span>`;
  } else if (actualPos != null) {
    const diff = Math.abs(pos - actualPos);
    const cls  = diff === 0 ? 'pts-exact' : diff <= 2 ? 'pts-outcome' : 'pts-zero';
    const arrow = actualPos < pos ? '▲' : actualPos > pos ? '▼' : '=';
    right = `<span class="pt-actual"><span class="pt-arrowdir ${actualPos < pos ? 'up' : actualPos > pos ? 'down' : ''}">${arrow}</span>${actualPos}.</span>
             <span class="pts-badge ${cls}">${diff}</span>`;
  }

  return `<div class="pt-row${zone ? ' ' + zone : ''}${editable ? '' : ' ro'}" data-id="${t.id}">
    <span class="pt-pos">${pos}</span>
    ${crest(t, 'crest')}
    <span class="pt-name">${esc(t.name)}</span>
    ${right}
  </div>`;
}

function moveTeam(teamId, dir) {
  if (!canEdit()) return;
  const i = State.myOrder.findIndex(id => String(id) === String(teamId));
  const j = i + dir;
  if (i < 0 || j < 0 || j >= State.myOrder.length) return;
  [State.myOrder[i], State.myOrder[j]] = [State.myOrder[j], State.myOrder[i]];
  if (navigator.vibrate) navigator.vibrate(8);
  renderTipping();
  schedSave();
}

// ---- Autolagring -------------------------------------------
let _saveTimer = null;
function schedSave() {
  setSaveStatus('saving');
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(savePredictions, 700);
}
function flushSave() {
  if (!_saveTimer) return;
  clearTimeout(_saveTimer);
  _saveTimer = null;
  savePredictions();
}

function setSaveStatus(kind) {
  const el = document.getElementById('tip-save');
  if (!el) return;
  el.className = 'save-status ' + (kind || '');
  el.textContent = kind === 'saving' ? 'Lagrer…' : kind === 'ok' ? 'Lagret ✓' : kind === 'error' ? 'Ikke lagret ✗' : '';
  if (kind === 'ok') setTimeout(() => {
    if (el.textContent === 'Lagret ✓') { el.textContent = ''; el.className = 'save-status'; }
  }, 2200);
}

async function savePredictions() {
  _saveTimer = null;
  if (!canEdit()) return;

  const rows = State.myOrder.map((teamId, i) => ({
    user_id: State.user.id,
    team_id: Number(teamId),
    position: i + 1,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await db.from('pl_predictions')
    .upsert(rows, { onConflict: 'user_id,team_id' });

  if (error) {
    console.error(error);
    setSaveStatus('error');
    return;
  }

  // Hold lokal kopi i takt
  State.preds = State.preds.filter(p => String(p.user_id) !== String(State.user.id))
                           .concat(rows.map(r => ({ ...r, id: null })));
  setSaveStatus('ok');
}

async function lockPredictions() {
  if (!canEdit()) return;
  if (State.myOrder.length !== State.teams.length) {
    toast('Du må plassere alle lagene først.', 'err');
    return;
  }
  if (!confirm('Lås inn tabellen? Du kan ikke endre den etterpå.')) return;

  flushSave();
  await savePredictions();

  const stamp = new Date().toISOString();
  const { error } = await db.from('pl_users').update({ locked_at: stamp }).eq('id', State.user.id);
  if (error) { toast('Klarte ikke låse. Prøv igjen.', 'err'); return; }

  const u = State.users.find(u => String(u.id) === String(State.user.id));
  if (u) u.locked_at = stamp;
  State.user.locked_at = stamp;
  localStorage.setItem(STORE_KEY, JSON.stringify(State.user));

  toast('Tabellen er låst inn! 🔒');
  renderTipping();
}

// ============================================================
// SPILLERE
// ============================================================
function playerList() {
  return Scoring.buildLeaderboard(State.users, State.preds, State.teams);
}

function renderPlayers() {
  document.getElementById('players-list-view').classList.toggle('hidden', State.playerIdx >= 0);
  document.getElementById('players-detail-view').classList.toggle('hidden', State.playerIdx < 0);

  if (State.playerIdx >= 0) { renderPlayerDetail(); return; }

  const rows   = playerList();
  const hasRes = Scoring.hasResults(State.teams);
  document.getElementById('players-count').textContent =
    `${rows.length} spiller${rows.length === 1 ? '' : 'e'}`;

  const el = document.getElementById('players-list');
  if (rows.length === 0) {
    el.innerHTML = `<div class="empty-state"><p class="empty-title">Ingen er med ennå</p><p>Del linken med gjengen så de kan registrere seg.</p></div>`;
    return;
  }

  el.innerHTML = rows.map((r, i) => {
    const isMe = String(r.user.id) === String(State.user.id);
    const meta = r.locked
      ? `Låst ${esc(fmtDate(r.user.locked_at))}`
      : `${r.tipped}/${State.teams.length} lag plassert`;
    const right = hasRes
      ? `<div class="pc-pts">${r.total}<span>p</span></div>`
      : (r.locked ? `<span class="lock-pill locked">Låst</span>` : `<span class="lock-pill">Åpen</span>`);
    return `<button class="player-card${isMe ? ' me' : ''}" onclick="openPlayer(${i})">
      <span class="pc-avatar">${esc(initials(r.user.username))}</span>
      <span class="pc-main">
        <span class="pc-name">${esc(r.user.username)}${isMe ? ' <span class="you">(deg)</span>' : ''}</span>
        <span class="pc-meta">${meta}</span>
      </span>
      ${right}
      <i data-lucide="chevron-right" class="pc-chev"></i>
    </button>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function openPlayer(idx) {
  State.playerIdx = idx;
  navigateTo('players');
}
function openPlayerById(userId) {
  const idx = playerList().findIndex(r => String(r.user.id) === String(userId));
  if (idx >= 0) openPlayer(idx);
}
function closePlayer() {
  State.playerIdx = -1;
  renderPlayers();
  window.scrollTo(0, 0);
}
function stepPlayer(dir) {
  const rows = playerList();
  if (rows.length === 0) return;
  State.playerIdx = (State.playerIdx + dir + rows.length) % rows.length;
  renderPlayerDetail(dir);
  window.scrollTo(0, 0);
}

function renderPlayerDetail(slideDir = 0) {
  const rows = playerList();
  if (State.playerIdx < 0 || State.playerIdx >= rows.length) { closePlayer(); return; }

  const row    = rows[State.playerIdx];
  const isMe   = String(row.user.id) === String(State.user.id);
  const hasRes = Scoring.hasResults(State.teams);
  const body   = document.getElementById('pd-body');

  document.getElementById('pd-name').textContent = row.user.username + (isMe ? ' (deg)' : '');
  document.getElementById('pd-dots').innerHTML = rows.length > 1
    ? rows.map((_, i) => `<span class="pd-dot${i === State.playerIdx ? ' on' : ''}"></span>`).join('')
    : '';

  // Skjult før fristen (så ingen kopierer)
  if (!isMe && !canReveal()) {
    body.innerHTML = `<div class="empty-state">
      <div class="empty-lock"><i data-lucide="lock"></i></div>
      <p class="empty-title">Skjult inntil fristen</p>
      <p>Tabellen til ${esc(row.user.username)} blir synlig ${esc(fmtDateTime(deadline()))}.</p>
      <p class="mt-8">${row.locked ? '✅ Har låst inn tabellen sin.' : `⏳ Har plassert ${row.tipped}/${State.teams.length} lag.`}</p>
    </div>`;
    if (window.lucide) lucide.createIcons();
    attachPlayerSwipe(body);
    return;
  }

  const order = Scoring.order(State.preds, row.user.id);
  if (order.length === 0) {
    body.innerHTML = `<div class="empty-state">
      <p class="empty-title">Ingen spådom ennå</p>
      <p>${esc(row.user.username)} har ikke plassert lagene.</p></div>`;
    attachPlayerSwipe(body);
    return;
  }

  const actual = Scoring.actualMap(State.teams);
  const stats  = hasRes
    ? `<div class="score-summary mb-16">
         <div><span class="ss-val">${row.total}</span><span class="ss-lab">bompoeng</span></div>
         <div><span class="ss-val">${row.exact}</span><span class="ss-lab">på blinken</span></div>
       </div>`
    : `<div class="pd-meta">${row.locked
         ? `Låst ${esc(fmtDateTime(row.user.locked_at))}`
         : `Ikke låst ennå – ${row.tipped}/${State.teams.length} lag plassert`}</div>`;

  body.innerHTML = stats + `<div class="pt-list">` + order.map((id, i) => {
    const t = teamById(id);
    return t ? predRow(t, i + 1, false, hasRes ? actual.get(t.id) ?? null : null) : '';
  }).join('') + '</div>';

  if (slideDir) {
    body.classList.remove('slide-l', 'slide-r');
    void body.offsetWidth;
    body.classList.add(slideDir > 0 ? 'slide-l' : 'slide-r');
  }
  attachPlayerSwipe(body);
  if (window.lucide) lucide.createIcons();
}

// Sveip venstre/høyre mellom spillere
let _swipeEl = null, _swipeStart = null;
function attachPlayerSwipe(el) {
  if (_swipeEl === el) return;
  _swipeEl = el;
  el.addEventListener('touchstart', e => {
    const t = e.changedTouches[0];
    _swipeStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  el.addEventListener('touchend', e => {
    if (!_swipeStart) return;
    const t  = e.changedTouches[0];
    const dx = t.clientX - _swipeStart.x;
    const dy = t.clientY - _swipeStart.y;
    _swipeStart = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    stepPlayer(dx < 0 ? 1 : -1);
  }, { passive: true });
}

// ============================================================
// FAKTA
// ============================================================
function renderStats() {
  const el = document.getElementById('stats-body');

  if (!canReveal()) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-lock"><i data-lucide="lock"></i></div>
      <p class="empty-title">Fakta åpner ved fristen</p>
      <p>Statistikken avslører hva alle har tippa, så den er skjult til ${esc(fmtDateTime(deadline()))}.</p>
    </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const s = Stats.build(State.users, State.preds, State.teams);
  if (!s) {
    el.innerHTML = `<div class="empty-state">
      <p class="empty-title">Ikke nok data ennå</p>
      <p>Statistikken dukker opp så snart noen har plassert alle ${State.teams.length} laga.</p></div>`;
    return;
  }

  const nm = u => esc(u.username);
  let h = `<p class="stats-intro">Basert på <strong>${s.playerCount}</strong> komplette tabeller.</p>`;

  // ---- Høydepunkt ------------------------------------------
  const champ = s.champions[0];
  const spoon = s.spoons[0];
  const boldest = s.outliers[0];
  const mostAgreed = s.agreed[0];
  const mostDivisive = s.divisive[0];

  h += `<div class="section-title">Kort fortalt</div><div class="fact-grid">`;
  if (champ) h += factCard('crown', 'Folkets mester', champ.team,
    `${champ.firsts} av ${s.playerCount} har dem på 1. plass`);
  if (spoon) h += factCard('trending-down', 'Dømt til jumboplass', spoon.team,
    `${spoon.lasts} av ${s.playerCount} har dem sist`);
  if (mostDivisive) h += factCard('split', 'Mest uenighet', mostDivisive.team,
    `Fra ${mostDivisive.best.pos}. til ${mostDivisive.worst.pos}. plass`);
  if (mostAgreed) h += factCard('handshake', 'Størst enighet', mostAgreed.team,
    `Alle har dem rundt ${fmt1(mostAgreed.avg)}. plass`);
  h += `</div>`;

  // ---- Modigste tips ---------------------------------------
  h += `<div class="section-title mt-24">Modigste tips</div>
        <p class="muted tiny mb-10">Størst avstand mellom ett tips og snittet til gjengen.</p>
        <div class="card-list">`;
  h += s.outliers.slice(0, 8).map(o => `
    <div class="bold-row">
      ${crest(o.team, 'crest crest-lg')}
      <div class="bold-text">
        <strong>${nm(o.user)}</strong> har ${esc(o.team.name)} på
        <strong>${o.pos}. plass</strong> – snittet er ${fmt1(o.avg)}.
      </div>
      <span class="bold-gap ${o.dir === 'høyere' ? 'up' : 'down'}">${o.dir === 'høyere' ? '▲' : '▼'} ${fmt1(o.gap)}</span>
    </div>`).join('');
  h += `</div>`;

  // ---- Konsensustabellen -----------------------------------
  h += `<div class="section-title mt-24">Gjengens fasit</div>
        <p class="muted tiny mb-10">Snittplasseringa til hvert lag. Trykk på et lag for å se hvem som har dem høyest og lavest.</p>
        <div class="pt-list">`;
  h += s.consensus.map((c, i) => {
    const zone = zoneFor(i + 1);
    return `<div class="cons-wrap">
      <div class="pt-row${zone ? ' ' + zone : ''} ro cons-row" onclick="toggleCons(${c.team.id})">
        <span class="pt-pos">${i + 1}</span>
        ${crest(c.team, 'crest')}
        <span class="pt-name">${esc(c.team.name)}</span>
        <span class="cons-avg">${fmt1(c.avg)}</span>
        <span class="cons-spread" title="Spredning">±${fmt1(c.spread)}</span>
      </div>
      <div class="cons-detail hidden" id="cons-${c.team.id}">
        <div><span class="cd-lab">Høyest</span> ${nm(c.best.user)} – ${c.best.pos}. plass</div>
        <div><span class="cd-lab">Lavest</span> ${nm(c.worst.user)} – ${c.worst.pos}. plass</div>
        <div><span class="cd-lab">Topp 4</span> ${c.top4} av ${s.playerCount} · <span class="cd-lab">Bunn 3</span> ${c.bottom3} av ${s.playerCount}</div>
      </div>
    </div>`;
  }).join('');
  h += `</div>`;

  // ---- Mestertips ------------------------------------------
  if (s.champions.length) {
    h += `<div class="section-title mt-24">Hvem vinner ligaen?</div><div class="card-list">`;
    h += s.champions.map(c => barRow(c.team, c.firsts, s.playerCount,
      c.picks.filter(p => p.pos === 1).map(p => p.user.username))).join('');
    h += `</div>`;
  }
  if (s.spoons.length) {
    h += `<div class="section-title mt-24">Hvem blir nummer ${State.teams.length}?</div><div class="card-list">`;
    h += s.spoons.map(c => barRow(c.team, c.lasts, s.playerCount,
      c.picks.filter(p => p.pos === State.teams.length).map(p => p.user.username), true)).join('');
    h += `</div>`;
  }

  // ---- Spillerprofiler -------------------------------------
  h += `<div class="section-title mt-24">Hvem tør å skille seg ut?</div>
        <p class="muted tiny mb-10">Samla avstand fra gjengens snitt – høyt tall betyr en tabell som stikker seg ut.</p>
        <div class="card-list">`;
  const maxGap = s.contrarian[0]?.gap || 1;
  h += s.contrarian.map((c, i) => `
    <div class="rank-row${String(c.user.id) === String(State.user.id) ? ' me' : ''}">
      <span class="rr-rank">${i + 1}</span>
      <span class="rr-name">${nm(c.user)}</span>
      <span class="rr-bar"><span style="width:${Math.max(6, (c.gap / maxGap) * 100)}%"></span></span>
      <span class="rr-val">${fmt1(c.avgGap)}</span>
    </div>`).join('');
  h += `</div><p class="muted tiny mt-8">Tallet er snittavvik per lag.</p>`;

  // ---- Like tabeller ---------------------------------------
  if (s.pairs.length) {
    const twin = s.pairs[0];
    const opposite = s.pairs[s.pairs.length - 1];
    h += `<div class="section-title mt-24">Tvillinger og motpoler</div><div class="fact-grid">`;
    h += `<div class="fact-card">
            <div class="fc-icon"><i data-lucide="copy"></i></div>
            <div class="fc-label">Mest like tabeller</div>
            <div class="fc-value">${nm(twin.a)} &amp; ${nm(twin.b)}</div>
            <div class="fc-sub">Bare ${twin.dist} plassers forskjell totalt</div>
          </div>
          <div class="fact-card">
            <div class="fc-icon"><i data-lucide="swords"></i></div>
            <div class="fc-label">Størst uenighet</div>
            <div class="fc-value">${nm(opposite.a)} &amp; ${nm(opposite.b)}</div>
            <div class="fc-sub">${opposite.dist} plassers forskjell totalt</div>
          </div></div>`;
  }

  el.innerHTML = h;
  if (window.lucide) lucide.createIcons();
}

function factCard(icon, label, team, sub) {
  return `<div class="fact-card">
    <div class="fc-icon"><i data-lucide="${icon}"></i></div>
    <div class="fc-label">${esc(label)}</div>
    <div class="fc-team">${crest(team, 'crest crest-lg')}<span>${esc(team.name)}</span></div>
    <div class="fc-sub">${esc(sub)}</div>
  </div>`;
}

function barRow(team, count, total, names, red = false) {
  const pct = Math.round((count / total) * 100);
  return `<div class="bar-row">
    ${crest(team, 'crest crest-lg')}
    <div class="br-main">
      <div class="br-top"><span class="br-name">${esc(team.name)}</span><span class="br-count">${count}</span></div>
      <div class="br-track"><span class="br-fill${red ? ' red' : ''}" style="width:${pct}%"></span></div>
      <div class="br-names">${names.map(esc).join(', ')}</div>
    </div>
  </div>`;
}

function toggleCons(teamId) {
  document.getElementById('cons-' + teamId)?.classList.toggle('hidden');
}

// ============================================================
// LOGG UT
// ============================================================
function logout() {
  State.user = null;
  State.playerIdx = -1;
  localStorage.removeItem(STORE_KEY);
  showPage('auth');
  setupAuthPage();
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushSave();
});
