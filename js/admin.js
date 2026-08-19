// ============================================================
// PL-Tipping – Admin-panel
// ============================================================

const { createClient: createAdminClient } = supabase;
let adminDb = null;

const Admin = {
  teams:    [],
  users:    [],
  preds:    [],
  settings: null,
  order:    [],   // team_id i faktisk tabellrekkjefølgje

  // --- Bonusspørsmål ---
  bonusOn:      false,
  bonusQ:       [],
  bonusPicks:   [],
  bonusCorrect: [],
};

async function adminSha256(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function aEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function aToast(msg, kind = 'ok') {
  let el = document.getElementById('app-toast');
  if (!el) { el = document.createElement('div'); el.id = 'app-toast'; document.body.appendChild(el); }
  el.className = 'app-toast ' + kind;
  el.style.bottom = '24px';
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function aCrest(team) {
  const fb = `<span class="crest-fb" style="--c:${aEsc(team.color || '#8e8e93')}">${aEsc(team.short || '?')}</span>`;
  const img = team.logo_url
    ? `<img src="${aEsc(team.logo_url)}" alt="" loading="lazy"
           onload="this.previousElementSibling.style.opacity=0" onerror="this.remove()">`
    : '';
  return `<span class="crest">${fb}${img}</span>`;
}

function aTeamById(id) { return Admin.teams.find(t => String(t.id) === String(id)) || null; }
function aDate(iso) { return iso ? new Date(iso).toLocaleDateString('nn-NO') : ''; }

// ============================================================
// INNGANG
// ============================================================
async function adminInit() {
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('DIN-')) {
    document.body.innerHTML = '<div class="full-screen"><div class="card ta-c">Set opp Supabase i js/config.js</div></div>';
    return;
  }
  adminDb = createAdminClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

  document.getElementById('admin-entry-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('admin-entry-btn');
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
      btn.textContent = 'Logg inn';
    }
  });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s =>
        s.classList.toggle('hidden', s.id !== 'admin-' + tab.dataset.section));
      window.scrollTo(0, 0);
    });
  });
}

// ============================================================
// LASTING
// ============================================================
async function loadAdminData() {
  const [t, u, p, s, bq, bp, bc] = await Promise.all([
    adminDb.from('pl_teams').select('*').order('sort_order').order('id'),
    adminDb.from('pl_users').select('*').order('id'),
    adminDb.from('pl_predictions').select('*'),
    adminDb.from('pl_settings').select('*').eq('id', 1).maybeSingle(),
    adminDb.from('pl_bonus').select('*').order('sort_order').order('key'),
    adminDb.from('pl_bonus_picks').select('*'),
    adminDb.from('pl_bonus_correct').select('*'),
  ]);
  Admin.teams    = t.data || [];
  Admin.users    = u.data || [];
  Admin.preds    = p.data || [];
  Admin.settings = s.data || null;

  // Manglar tabellane, er sql/bonus.sql ikkje køyrd enno
  Admin.bonusOn      = !bq.error;
  Admin.bonusQ       = bq.data || [];
  Admin.bonusPicks   = bp.data || [];
  Admin.bonusCorrect = bc.data || [];

  buildActualOrder();
  renderFasit();
  renderBonusAdmin();
  renderUsers();
  renderTeams();
  renderSettings();
}

function buildActualOrder() {
  const placed = Admin.teams.filter(t => t.actual_position != null)
                            .sort((a, b) => a.actual_position - b.actual_position)
                            .map(t => t.id);
  const rest = Admin.teams.map(t => t.id).filter(id => !placed.includes(id));
  Admin.order = [...placed, ...rest];
}

// ============================================================
// FASIT – den faktiske tabellen
// ============================================================
function renderFasit() {
  const listEl = document.getElementById('fasit-list');
  listEl.innerHTML = Admin.order.map((id, i) => {
    const t = aTeamById(id);
    if (!t) return '';
    const zone = zoneFor(i + 1);
    return `<div class="pt-row${zone ? ' ' + zone : ''}" data-id="${t.id}">
      <span class="pt-pos">${i + 1}</span>
      ${aCrest(t)}
      <span class="pt-name">${aEsc(t.name)}</span>
      <span class="pt-tools">
        <button class="pt-arrow" onclick="moveActual(${t.id},-1)"${i === 0 ? ' disabled' : ''}>▲</button>
        <button class="pt-arrow" onclick="moveActual(${t.id},1)"${i === Admin.order.length - 1 ? ' disabled' : ''}>▼</button>
        <span class="pt-grip" data-grip>⠿</span>
      </span>
    </div>`;
  }).join('');

  Reorder.attach(listEl, ids => {
    Admin.order = ids.map(Number);
    renderFasit();
  }, () => true);

  const placed = Admin.teams.filter(t => t.actual_position != null).length;
  document.getElementById('fasit-status').textContent = placed
    ? `Lagra ${aDate(Admin.settings?.table_updated_at)}`
    : 'Ingen fasit lagra enno';
  document.getElementById('season-finished').checked = !!Admin.settings?.season_finished;
}

function moveActual(teamId, dir) {
  const i = Admin.order.findIndex(id => String(id) === String(teamId));
  const j = i + dir;
  if (i < 0 || j < 0 || j >= Admin.order.length) return;
  [Admin.order[i], Admin.order[j]] = [Admin.order[j], Admin.order[i]];
  renderFasit();
}

async function saveActualTable() {
  const results = await Promise.all(Admin.order.map((id, i) =>
    adminDb.from('pl_teams').update({ actual_position: i + 1 }).eq('id', id)));
  if (results.some(r => r.error)) { aToast('Noko gjekk gale under lagringa.', 'err'); return; }

  const stamp = new Date().toISOString();
  await adminDb.from('pl_settings').update({ table_updated_at: stamp }).eq('id', 1);
  if (Admin.settings) Admin.settings.table_updated_at = stamp;
  Admin.order.forEach((id, i) => { const t = aTeamById(id); if (t) t.actual_position = i + 1; });

  renderFasit();
  aToast('Fasit lagra ✓');
}

async function clearActualTable() {
  if (!confirm('Nullstille fasiten? Alle poeng forsvinn til du legg han inn på nytt.')) return;
  const { error } = await adminDb.from('pl_teams').update({ actual_position: null }).gt('id', 0);
  if (error) { aToast('Klarte ikkje å nullstille.', 'err'); return; }
  Admin.teams.forEach(t => { t.actual_position = null; });
  await adminDb.from('pl_settings').update({ season_finished: false }).eq('id', 1);
  if (Admin.settings) Admin.settings.season_finished = false;
  buildActualOrder();
  renderFasit();
  aToast('Fasiten er nullstilt');
}

async function saveFinished() {
  const val = document.getElementById('season-finished').checked;
  const { error } = await adminDb.from('pl_settings').update({ season_finished: val }).eq('id', 1);
  if (error) { aToast('Klarte ikkje å lagre.', 'err'); return; }
  if (Admin.settings) Admin.settings.season_finished = val;
  aToast(val ? 'Sesongen er merkt som ferdig 🏆' : 'Merkt som pågåande');
}

// ============================================================
// BONUS – fasit på prisar og ville tips
// ============================================================
function renderBonusAdmin() {
  const el = document.getElementById('admin-bonus-list');
  const statusEl = document.getElementById('bonus-admin-status');

  if (!Admin.bonusOn) {
    el.innerHTML = `<div class="alert alert-warning">
      Bonustabellane finst ikkje i databasen enno. Køyr <code>sql/bonus.sql</code>
      i Supabase SQL Editor, og last sida på nytt.</div>`;
    statusEl.textContent = '';
    return;
  }
  if (Admin.bonusQ.length === 0) {
    el.innerHTML = `<div class="empty-state"><p class="empty-title">Ingen bonusspørsmål</p></div>`;
    statusEl.textContent = '';
    return;
  }

  el.innerHTML = Admin.bonusQ.map(q => {
    const groups   = BonusScore.groupAnswers(Admin.bonusPicks, q.key, Admin.users);
    const accepted = new Set(Admin.bonusCorrect.filter(r => r.q_key === q.key).map(r => r.answer_norm));
    // Rette svar som ingen gjetta – lagde til for hand
    const extra = [...accepted].filter(n => !groups.some(g => g.norm === n));

    const opt = (norm, label, who, count, on) => `
      <label class="ab-opt${on ? ' on' : ''}">
        <input type="checkbox" data-q="${aEsc(q.key)}" data-norm="${aEsc(norm)}"
               data-label="${aEsc(label)}"${on ? ' checked' : ''}>
        <span class="ab-ans">${aEsc(label)}</span>
        <span class="ab-who">${who}</span>
        <span class="ab-n">${count}</span>
      </label>`;

    return `<div class="ab-q">
      <div class="ab-head">
        <span class="ab-label">${aEsc(q.label)}</span>
        <span class="ab-pts">−${q.points} p</span>
      </div>
      ${q.hint ? `<div class="ab-hint">${aEsc(q.hint)}</div>` : ''}
      ${groups.length === 0 && extra.length === 0
        ? `<div class="ab-empty">Ingen har svart på dette enno.</div>` : ''}
      ${groups.map(g => opt(g.norm, g.label, g.users.map(aEsc).join(', '), g.count, accepted.has(g.norm))).join('')}
      ${extra.map(n => {
        const r = Admin.bonusCorrect.find(x => x.q_key === q.key && x.answer_norm === n);
        return opt(n, r?.label || n, '<span class="muted">ingen gjetta dette</span>', 0, true);
      }).join('')}
      <div class="ab-add">
        <input class="at-input" data-add="${aEsc(q.key)}" placeholder="Rett svar som ingen gjetta…">
        <button class="btn btn-outline btn-sm" data-addbtn="${aEsc(q.key)}">Legg til</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('input[type=checkbox][data-q]').forEach(cb => {
    cb.addEventListener('change', () =>
      toggleBonusCorrect(cb.dataset.q, cb.dataset.norm, cb.dataset.label));
  });
  el.querySelectorAll('[data-addbtn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key   = btn.dataset.addbtn;
      const input = el.querySelector(`input[data-add="${key}"]`);
      addBonusCorrect(key, input.value);
      input.value = '';
    });
  });

  const done = new Set(Admin.bonusCorrect.map(r => r.q_key)).size;
  statusEl.textContent = done
    ? `${done}/${Admin.bonusQ.length} spørsmål har fasit`
    : 'Ingen fasit lagt inn enno';
}

async function toggleBonusCorrect(qKey, norm, label) {
  const on = Admin.bonusCorrect.some(r => r.q_key === qKey && r.answer_norm === norm);

  if (on) {
    const { error } = await adminDb.from('pl_bonus_correct')
      .delete().eq('q_key', qKey).eq('answer_norm', norm);
    if (error) { aToast('Klarte ikkje å fjerne svaret.', 'err'); renderBonusAdmin(); return; }
    Admin.bonusCorrect = Admin.bonusCorrect.filter(r => !(r.q_key === qKey && r.answer_norm === norm));
    aToast('Svaret tel ikkje lenger');
  } else {
    const { data, error } = await adminDb.from('pl_bonus_correct')
      .insert([{ q_key: qKey, answer_norm: norm, label }]).select().single();
    if (error) { aToast('Klarte ikkje å lagre svaret.', 'err'); renderBonusAdmin(); return; }
    Admin.bonusCorrect.push(data);
    aToast('Svaret er godkjent ✓');
  }
  renderBonusAdmin();
}

async function addBonusCorrect(qKey, raw) {
  const label = String(raw || '').trim();
  if (!label) return;

  const norm = normAnswer(label);
  if (Admin.bonusCorrect.some(r => r.q_key === qKey && r.answer_norm === norm)) {
    aToast('Det svaret er allereie godkjent.', 'err');
    return;
  }
  await toggleBonusCorrect(qKey, norm, label);
}

// ============================================================
// SPELARAR
// ============================================================
function renderUsers() {
  const el = document.getElementById('admin-users');
  if (Admin.users.length === 0) {
    el.innerHTML = '<div class="empty-state"><p class="empty-title">Ingen spelarar enno</p></div>';
    return;
  }
  el.innerHTML = Admin.users.map(u => {
    const count = Admin.preds.filter(p => String(p.user_id) === String(u.id)).length;
    const bonus = Admin.bonusPicks.filter(p => String(p.user_id) === String(u.id)).length;
    const meta  = `${count}/${Admin.teams.length} lag` +
      (Admin.bonusOn ? ` · ${bonus}/${Admin.bonusQ.length} bonussvar` : '') +
      (u.created_at ? ` · med sidan ${aDate(u.created_at)}` : '');

    return `<div class="admin-user-row">
      <span class="pc-avatar">${aEsc((u.username || '?').charAt(0).toUpperCase())}</span>
      <div class="au-main">
        <div class="au-name">${aEsc(u.username)}</div>
        <div class="au-meta">${meta}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Slett</button>
    </div>`;
  }).join('');
}

async function deleteUser(id) {
  const name = Admin.users.find(u => u.id === id)?.username || 'spelaren';
  if (!confirm(`Slette ${name}? Både tabellen og bonussvara forsvinn òg.`)) return;
  const { error } = await adminDb.from('pl_users').delete().eq('id', id);
  if (error) { aToast('Klarte ikkje å slette.', 'err'); return; }
  Admin.users      = Admin.users.filter(u => u.id !== id);
  Admin.preds      = Admin.preds.filter(p => String(p.user_id) !== String(id));
  Admin.bonusPicks = Admin.bonusPicks.filter(p => String(p.user_id) !== String(id));
  renderUsers();
  renderBonusAdmin();
  aToast('Spelaren er sletta');
}

// ============================================================
// LAG
// ============================================================
function renderTeams() {
  document.getElementById('admin-teams').innerHTML = Admin.teams.map(t => `
    <div class="admin-team-row">
      ${aCrest(t)}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">
        <input class="at-input" id="tn-${t.id}" value="${aEsc(t.name)}" placeholder="Lagnamn">
        <input class="at-input" id="tl-${t.id}" value="${aEsc(t.logo_url || '')}" placeholder="URL til klubbmerke (valfritt)">
      </div>
      <input class="at-input" id="ts-${t.id}" value="${aEsc(t.short)}" maxlength="4"
             style="width:56px;text-align:center;flex-shrink:0" placeholder="KODE">
    </div>`).join('');
}

async function saveTeams() {
  const results = await Promise.all(Admin.teams.map(t => {
    const name  = document.getElementById('tn-' + t.id).value.trim() || t.name;
    const logo  = document.getElementById('tl-' + t.id).value.trim() || null;
    const short = (document.getElementById('ts-' + t.id).value.trim() || t.short).toUpperCase();
    t.name = name; t.logo_url = logo; t.short = short;
    return adminDb.from('pl_teams').update({ name, logo_url: logo, short }).eq('id', t.id);
  }));
  if (results.some(r => r.error)) { aToast('Noko gjekk gale under lagringa.', 'err'); return; }
  renderTeams();
  renderFasit();
  aToast('Laga er lagra ✓');
}

// ============================================================
// INNSTILLINGAR
// ============================================================
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderSettings() {
  document.getElementById('set-season').value   = Admin.settings?.season || CONFIG.SEASON;
  document.getElementById('set-deadline').value = toLocalInput(Admin.settings?.deadline || CONFIG.DEADLINE);
  document.getElementById('set-reveal').checked = !!Admin.settings?.reveal_predictions;
}

async function saveSettings() {
  const season   = document.getElementById('set-season').value.trim();
  const localVal = document.getElementById('set-deadline').value;
  const reveal   = document.getElementById('set-reveal').checked;

  const payload = {
    season: season || null,
    deadline: localVal ? new Date(localVal).toISOString() : null,
    reveal_predictions: reveal,
  };

  const { error } = await adminDb.from('pl_settings').update(payload).eq('id', 1);
  if (error) { aToast('Klarte ikkje å lagre.', 'err'); return; }
  Admin.settings = { ...(Admin.settings || { id: 1 }), ...payload };
  aToast('Innstillingane er lagra ✓');
}

// ============================================================
// OPPSTART
// ============================================================
document.addEventListener('DOMContentLoaded', adminInit);
