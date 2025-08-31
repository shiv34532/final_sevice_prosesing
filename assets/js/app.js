/* assets/js/app.js
   Static frontend version for GitHub Pages.
   Data stored in localStorage (demo). */

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* --- Simple localStorage-backed "DB" --- */
const DB_KEY = "final_platform_db_v1";
let db = JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify({
  users: [],
  messages: [],
  media: []
}));

function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

/* Navigation */
function showSection(id){
  $$(".content-section").forEach(s => s.classList.add("d-none"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("d-none");
  $$(".nav-link").forEach(n => n.classList.remove("active"));
  const link = document.querySelector(`[onclick="showSection('${id}')"]`);
  if (link) link.classList.add("active");
}

/* Cookies + Terms */
const COOKIE_KEY = "final_cookie_consent";  // 'accept'|'decline'
const TERMS_KEY  = "final_terms_accepted";

function initCookieBanner(){
  const state = localStorage.getItem(COOKIE_KEY);
  if (!state) $("#cookieBanner").classList.remove("d-none");
  updateCookieBadge();
  maybeShowTerms();
}
function acceptCookies(){ localStorage.setItem(COOKIE_KEY, "accept"); $("#cookieBanner").classList.add("d-none"); updateCookieBadge(); maybeShowTerms(); }
function declineCookies(){ localStorage.setItem(COOKIE_KEY, "decline"); $("#cookieBanner").classList.add("d-none"); updateCookieBadge(); new bootstrap.Modal($("#securityWarningModal")).show(); }
function acceptCookiesFromWarning(){ acceptCookies(); bootstrap.Modal.getInstance($("#securityWarningModal"))?.hide(); }
function updateCookieBadge(){
  const badge = $("#cookieStateBadge");
  if (!badge) return;
  const s = localStorage.getItem(COOKIE_KEY);
  badge.className = 'badge';
  if (s === 'accept') { badge.classList.add('text-bg-success'); badge.textContent = 'Enabled'; }
  else if (s === 'decline') { badge.classList.add('text-bg-secondary'); badge.textContent = 'Disabled'; }
  else { badge.classList.add('text-bg-secondary'); badge.textContent = 'Unknown'; }
}
function maybeShowTerms(){
  const cookies = localStorage.getItem(COOKIE_KEY);
  const accepted = localStorage.getItem(TERMS_KEY) === 'true';
  if (cookies === 'accept' && !accepted) new bootstrap.Modal($('#termsModal')).show();
}
function acceptTerms(){ localStorage.setItem(TERMS_KEY, 'true'); bootstrap.Modal.getInstance($('#termsModal'))?.hide(); }

/* --- Contact form (stored locally) --- */
function submitContactForm(e){
  e.preventDefault();
  const name = ($('#firstName').value || '') + ' ' + ($('#lastName').value || '');
  const msg = {
    id: db.messages.length + 1,
    name: name.trim(),
    email: $('#email').value,
    subject: $('#subject').value,
    message: $('#message').value,
    created_at: new Date().toLocaleString()
  };
  db.messages.unshift(msg);
  saveDB();
  $('#successMessage').classList.remove('d-none');
  setTimeout(()=>$('#successMessage').classList.add('d-none'), 3000);
  $('#contactForm').reset();
  renderMessages(); renderStats();
}

/* --- Signup (local) --- */
function registerUser(e){
  e.preventDefault();
  const name = $('#signupName').value.trim();
  const email = $('#signupEmail').value.trim().toLowerCase();
  const password = $('#signupPassword').value;
  const confirm = $('#confirmPassword').value;
  if (password !== confirm) return alert('Passwords do not match');
  if (db.users.find(u => u.email === email)) return alert('Email already exists (local demo).');

  db.users.unshift({ id: db.users.length + 1, name, email, role: 'user', created_at: new Date().toLocaleString() });
  saveDB();
  alert('Account created locally (demo)');
  bootstrap.Modal.getInstance($('#signupModal'))?.hide();
  $('#signupForm').reset();
  renderUsers(); renderStats();
}

/* --- Admin login (demo) --- */
function adminLogin(e){
  e.preventDefault();
  const email = $('#adminEmail').value.trim();
  const password = $('#adminPassword').value; // demo: any password works if user exists OR admin@example.com
  let user = db.users.find(u => u.email === email);
  if (!user && email === 'admin@example.com') user = { name: 'Admin', email: 'admin@example.com' };
  if (!user) return alert('Admin not found (demo). You can sign up first.');

  $('#userStatus span').textContent = user.email;
  bootstrap.Modal.getInstance($('#loginModal'))?.hide();
  showSection('admin');
  renderUsers(); renderMessages(); renderStats();
}

/* --- Render helpers for Admin panel --- */
function renderStats(){
  $('#totalUsers').textContent = db.users.length;
  $('#totalMessages').textContent = db.messages.length;
  $('#activeProjects').textContent = 0; // no projects in demo
}
function renderMessages(){
  const wrap = $('#messagesList'); if (!wrap) return;
  wrap.innerHTML = '';
  db.messages.slice(0,20).forEach(m => {
    const div = document.createElement('div');
    div.className = 'border-bottom pb-2';
    div.innerHTML = `<div class="d-flex justify-content-between"><strong class="text-primary">${escapeHtml(m.name || '—')}</strong><small class="text-muted">${m.created_at}</small></div>
      <div class="text-muted small">${escapeHtml(m.email || '')} • ${escapeHtml(m.subject || '')}</div>
      <div>${escapeHtml(m.message || '')}</div>`;
    wrap.appendChild(div);
  });
}
function renderUsers(){
  const wrap = $('#usersList'); if (!wrap) return;
  wrap.innerHTML = '';
  db.users.slice(0,50).forEach(u => {
    const div = document.createElement('div');
    div.className = 'p-2 border rounded';
    div.innerHTML = `<strong>${escapeHtml(u.name)}</strong> <span class="text-muted">(${escapeHtml(u.email)})</span> • ${escapeHtml(u.role)}`;
    wrap.appendChild(div);
  });
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* --- Security scan (demo) --- */
function runSecurityScan(){
  const out = $('#securityScanOutput');
  out.textContent = 'Running quick scan...';
  setTimeout(()=> {
    const cookie = localStorage.getItem(COOKIE_KEY) === 'accept' ? 'OK' : 'Cookies disabled';
    out.textContent = `✓ Local storage available\n✓ Demo admin API (local)\n• Cookies: ${cookie}\nRecommendation: enable cookies for full features.`;
  }, 600);
}

/* --- Media Manager (demo) --- */
function uploadMedia(e){
  e.preventDefault();
  const f = $('#mediaFile').files[0];
  if (!f) return alert('Choose a file (demo).');
  db.media.unshift({ id: db.media.length+1, filename: f.name, mime: f.type, created_at: new Date().toLocaleString() });
  saveDB();
  listMedia();
  $('#mediaForm').reset();
  alert('File recorded locally (demo).');
}
function listMedia(){
  const g = $('#mediaList'); if (!g) return; g.innerHTML = '';
  db.media.slice(0,200).forEach(m => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<div class="card h-100 small p-2"><div class="fw-bold text-truncate">${escapeHtml(m.filename)}</div><div class="text-muted">${escapeHtml(m.mime)}</div><div class="text-muted small">${escapeHtml(m.created_at)}</div></div>`;
    g.appendChild(col);
  });
}

/* --- UI Guide steps injection --- */
function initGuide(){
  const steps = [
    { title: 'Navigation', body:'Use the top bar to switch sections.' },
    { title: 'Contact', body:'Submit messages stored in your browser (demo).' },
    { title: 'Admin', body:'Login to view demo stats and recent items.' },
    { title: 'Security Center', body:'Manage cookie consent and run a quick scan.' },
    { title: 'Media Manager', body:'Upload & list files (demo recorded in browser).' }
  ];
  const wrap = $('#guideSteps'); if (!wrap) return;
  steps.forEach((s,i)=>{
    const el = document.createElement('div');
    el.className = 'border rounded p-3';
    el.innerHTML = `<div class="fw-bold">${i+1}. ${s.title}</div><div class="text-muted">${s.body}</div>`;
    wrap.appendChild(el);
  });
}

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
  showSection('home');
  initCookieBanner();
  initGuide();
  renderStats();
  renderMessages();
  renderUsers();
  listMedia();
});
