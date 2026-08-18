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
  order:    [],   // team_id i faktisk tabellrekkefølge
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

// ============================================================
// INNGANG
// ============================================================
async function adminInit() {
  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('DIN-')) {
    document.body.innerHTML = '<div class="full-screen"><div class="card ta-c">Konfigurer Supabase i js/config.js</div></div>';
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
  const [t, u, p, s] = await Promise.all([
    adminDb.from('pl_teams').select('*').order('sort_order').order('id'),
    adminDb.from('pl_users').select('*').order('id'),
    adminDb.from('pl_predictions').select('*'),
    adminDb.from('pl_settings').select('*').eq('id', 1).maybeSingle(),
  ]);
  Admin.teams    = t.data || [];
  Admin.users    = u.data || [];
  Admin.preds    = p.data || [];
  Admin.settings = s.data || null;

  buildActualOrder();
  renderFasit();
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
    ? `Lagret ${aEsc(Admin.settings?.table_updated_at ? new Date(Admin.settings.table_updated_at).toLocaleDateString('no-NO') : '')}`
    : 'Ingen fasit lagret ennå';
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
  const updates = Admin.order.map((id, i) =>
    adminDb.from('pl_teams').update({ actual_position: i + 1 }).eq('id', id));
  const results = await Promise.all(updates);
  if (results.some(r => r.error)) { aToast('Noe gikk galt ved lagring.', 'err'); return; }

  const stamp = new Date().toISOString();
  await adminDb.from('pl_settings').update({ table_updated_at: stamp }).eq('id', 1);
  if (Admin.settings) Admin.settings.table_updated_at = stamp;
  Admin.order.forEach((id, i) => { const t = aTeamById(id); if (t) t.actual_position = i + 1; });

  renderFasit();
  aToast('Fasit lagret ✓');
}

async function clearActualTable() {
  if (!confirm('Nullstille fasiten? Alle poeng forsvinner til du legger den inn på nytt.')) return;
  const { error } = await adminDb.from('pl_teams').update({ actual_position: null }).gt('id', 0);
  if (error) { aToast('Klarte ikke nullstille.', 'err'); return; }
  Admin.teams.forEach(t => { t.actual_position = null; });
  await adminDb.from('pl_settings').update({ season_finished: false }).eq('id', 1);
  if (Admin.settings) Admin.settings.season_finished = false;
  buildActualOrder();
  renderFasit();
  aToast('Fasit nullstilt');
}

async function saveFinished() {
  const val = document.getElementById('season-finished').checked;
  const { error } = await adminDb.from('pl_settings').update({ season_finished: val }).eq('id', 1);
  if (error) { aToast('Klarte ikke lagre.', 'err'); return; }
  if (Admin.settings) Admin.settings.season_finished = val;
  aToast(val ? 'Sesongen er markert som ferdig 🏆' : 'Merket som pågående');
}

// ============================================================
// SPILLERE
// ============================================================
function renderUsers() {
  const el = document.getElementById('admin-users');
  if (Admin.users.length === 0) {
    el.innerHTML = '<div class="empty-state"><p class="empty-title">Ingen spillere ennå</p></div>';
    return;
  }
  el.innerHTML = Admin.users.map(u => {
    const count = Admin.preds.filter(p => String(p.user_id) === String(u.id)).length;
    return `<div class="admin-user-row">
      <span class="pc-avatar">${aEsc((u.username || '?').charAt(0).toUpperCase())}</span>
      <div class="au-main">
        <div class="au-name">${aEsc(u.username)}</div>
        <div class="au-meta">${count}/${Admin.teams.length} lag ·
          ${u.locked_at ? 'låst ' + new Date(u.locked_at).toLocaleDateString('no-NO') : 'ikke låst'}</div>
      </div>
      ${u.locked_at
        ? `<button class="btn btn-outline btn-sm" onclick="unlockUser(${u.id})">Lås opp</button>`
        : ''}
      <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Slett</button>
    </div>`;
  }).join('');
}

async function unlockUser(id) {
  const { error } = await adminDb.from('pl_users').update({ locked_at: null }).eq('id', id);
  if (error) { aToast('Klarte ikke låse opp.', 'err'); return; }
  const u = Admin.users.find(u => u.id === id);
  if (u) u.locked_at = null;
  renderUsers();
  aToast('Låst opp – spilleren kan endre igjen');
}

async function deleteUser(id) {
  const name = Admin.users.find(u => u.id === id)?.username || 'spilleren';
  if (!confirm(`Slette ${name}? Spådommene forsvinner også.`)) return;
  const { error } = await adminDb.from('pl_users').delete().eq('id', id);
  if (error) { aToast('Klarte ikke slette.', 'err'); return; }
  Admin.users = Admin.users.filter(u => u.id !== id);
  Admin.preds = Admin.preds.filter(p => String(p.user_id) !== String(id));
  renderUsers();
  aToast('Spiller slettet');
}

// ============================================================
// LAG
// ============================================================
function renderTeams() {
  document.getElementById('admin-teams').innerHTML = Admin.teams.map(t => `
    <div class="admin-team-row">
      ${aCrest(t)}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">
        <input class="at-input" id="tn-${t.id}" value="${aEsc(t.name)}" placeholder="Lagnavn">
        <input class="at-input" id="tl-${t.id}" value="${aEsc(t.logo_url || '')}" placeholder="URL til klubbmerke (valgfritt)">
      </div>
      <input class="at-input" id="ts-${t.id}" value="${aEsc(t.short)}" maxlength="4"
             style="width:56px;text-align:center;flex-shrink:0" placeholder="KODE">
    </div>`).join('');
}

async function saveTeams() {
  const updates = Admin.teams.map(t => {
    const name  = document.getElementById('tn-' + t.id).value.trim() || t.name;
    const logo  = document.getElementById('tl-' + t.id).value.trim() || null;
    const short = (document.getElementById('ts-' + t.id).value.trim() || t.short).toUpperCase();
    t.name = name; t.logo_url = logo; t.short = short;
    return adminDb.from('pl_teams').update({ name, logo_url: logo, short }).eq('id', t.id);
  });
  const results = await Promise.all(updates);
  if (results.some(r => r.error)) { aToast('Noe gikk galt ved lagring.', 'err'); return; }
  renderTeams();
  renderFasit();
  aToast('Lag lagret ✓');
}

// ============================================================
// INNSTILLINGER
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
  if (error) { aToast('Klarte ikke lagre.', 'err'); return; }
  Admin.settings = { ...(Admin.settings || { id: 1 }), ...payload };
  aToast('Innstillinger lagret ✓');
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', adminInit);
