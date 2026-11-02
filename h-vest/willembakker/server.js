#!/usr/bin/env node
/*
  Willem Bakker teamportaal – server
  Draait op Node.js (18 of nieuwer) zonder extra pakketten.
  Start:            node server.js
  Eerste keer:      node server.js --setup            (maakt accounts, toont wachtwoorden)
  Gebruiker erbij:  node server.js --gebruiker <naam> [--admin] ["Naam zoals getoond"] ["Rol"]
  Wachtwoord reset: node server.js --wachtwoord <naam>
  Instellingen via omgevingsvariabelen: PORT (3010), HOST (0.0.0.0), BASE_PATH (bijv. /willembakker), WB_DATA (map voor data).
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = process.env.WB_DATA || path.join(ROOT, 'data');
const PORT = parseInt(process.env.PORT || '3010', 10);
const HOST = process.env.HOST || '0.0.0.0';
const BASE = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const COLS = ['team', 'sponsors', 'bv', 'prive', 'events', 'mijlpalen', 'acties', 'programma', 'eventbudget', 'presentaties', 'settings'];
const SESSIE_MS = 90 * 24 * 3600 * 1000;
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
const NAAM_RE = /^[a-z0-9][a-z0-9._-]{0,30}$/;
const STANDAARD_GEBRUIKERS = [
  {naam: 'gjalt', weergave: 'Gjalt', rol: 'Financieel', admin: true},
  {naam: 'piet', weergave: 'Piet', rol: 'Sponsoring', admin: false},
  {naam: 'tanja', weergave: 'Tanja', rol: 'Topsportbegeleider', admin: false},
  {naam: 'ruud', weergave: 'Ruud', rol: 'Legal', admin: false},
  {naam: 'cornelie', weergave: 'Cornelie', rol: 'Marketing', admin: false},
  {naam: 'herbert', weergave: 'Herbert', rol: 'Vader van Willem, stichting', admin: false},
  {naam: 'willem', weergave: 'Willem', rol: 'De sporter', admin: false}
];

/* ---------- bestanden ---------- */
const FILES = {db: path.join(DATA_DIR, 'db.json'), users: path.join(DATA_DIR, 'gebruikers.json'), sessies: path.join(DATA_DIR, 'sessies.json')};
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; } }
function writeJson(file, obj) { fs.mkdirSync(path.dirname(file), {recursive: true}); const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(obj, null, 1)); fs.renameSync(tmp, file); }
function log(...a) { console.log(new Date().toISOString().slice(0, 19).replace('T', ' '), ...a); }

let db = readJson(FILES.db, null);
if (!db || typeof db !== 'object' || !db.data) {
  db = {versie: 1, data: {}};
  const seed = readJson(path.join(ROOT, 'seed.json'), {});
  COLS.forEach(c => { db.data[c] = {}; (Array.isArray(seed[c]) ? seed[c] : []).forEach(d => { if (d && d.id) db.data[c][d.id] = d; }); });
  if (require.main === module) { writeJson(FILES.db, db); log('Nieuwe database aangemaakt met startgegevens:', FILES.db); }
}
COLS.forEach(c => { if (!db.data[c] || typeof db.data[c] !== 'object') db.data[c] = {}; });
let users = readJson(FILES.users, []);
if (!Array.isArray(users)) users = [];
let sessies = readJson(FILES.sessies, {});
if (!sessies || typeof sessies !== 'object') sessies = {};

let saveTimer = null;
function saveDbSoon() { if (saveTimer) return; saveTimer = setTimeout(() => { saveTimer = null; try { writeJson(FILES.db, db); } catch (e) { log('FOUT bij opslaan database:', e.message); } }, 150); }
function saveUsers() { writeJson(FILES.users, users); }
function saveSessies() { writeJson(FILES.sessies, sessies); }

/* ---------- wachtwoorden en sessies ---------- */
function hashWw(ww, salt) { salt = salt || crypto.randomBytes(16).toString('hex'); return {salt, hash: crypto.scryptSync(String(ww), salt, 64).toString('hex')}; }
function checkWw(user, ww) { if (!user || !user.hash || !user.salt) return false; const h = crypto.scryptSync(String(ww), user.salt, 64); const a = Buffer.from(user.hash, 'hex'); return a.length === h.length && crypto.timingSafeEqual(a, h); }
function genWw() { const c = 'bcdfghjkmnprstvwz', v = 'aeiou'; let w = ''; for (let i = 0; i < 3; i++) w += c[crypto.randomInt(c.length)] + v[crypto.randomInt(v.length)]; return w + '-' + String(crypto.randomInt(1000, 9999)); }
function userByNaam(naam) { return users.find(u => u.naam === String(naam || '').toLowerCase()) || null; }
function publicUser(u) { return {naam: u.naam, weergave: u.weergave || u.naam, rol: u.rol || '', admin: !!u.admin, aangemaakt: u.aangemaakt || null, laatsteLogin: u.laatsteLogin || null}; }
function maakGebruiker(spec, ww) {
  if (!NAAM_RE.test(spec.naam)) throw new Error('ongeldige inlognaam (kleine letters, cijfers, . _ -)');
  if (userByNaam(spec.naam)) throw new Error('bestaat al');
  const gegenereerd = !ww; ww = ww || genWw();
  if (String(ww).length < 8) throw new Error('wachtwoord minimaal 8 tekens');
  const u = Object.assign({naam: spec.naam, weergave: spec.weergave || spec.naam, rol: spec.rol || '', admin: !!spec.admin, aangemaakt: new Date().toISOString()}, hashWw(ww));
  users.push(u); saveUsers();
  return {user: u, wachtwoord: gegenereerd ? ww : null};
}
function parseCookies(req) { const out = {}; (req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return out; }
function getSessie(req) {
  const t = parseCookies(req).wb_sessie; if (!t) return null;
  const s = sessies[t]; if (!s) return null;
  if (Date.now() - s.sinds > SESSIE_MS) { delete sessies[t]; saveSessies(); return null; }
  return Object.assign({token: t}, s);
}
function nieuweSessie(res, naam) {
  const token = crypto.randomBytes(32).toString('hex');
  sessies[token] = {naam, sinds: Date.now()};
  Object.keys(sessies).forEach(k => { if (Date.now() - sessies[k].sinds > SESSIE_MS) delete sessies[k]; });
  saveSessies();
  res.setHeader('Set-Cookie', `wb_sessie=${token}; Path=${BASE || '/'}; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSIE_MS / 1000)}`);
}
function wisSessie(res, token) { if (token && sessies[token]) { delete sessies[token]; saveSessies(); } res.setHeader('Set-Cookie', `wb_sessie=; Path=${BASE || '/'}; HttpOnly; SameSite=Lax; Max-Age=0`); }
const pogingen = new Map();
function geblokkeerd(ip) { const p = pogingen.get(ip); return !!(p && p.n >= 8 && Date.now() - p.tot < 15 * 60 * 1000); }
function mislukt(ip) { const p = pogingen.get(ip) || {n: 0, tot: 0}; if (Date.now() - p.tot > 15 * 60 * 1000) p.n = 0; p.n++; p.tot = Date.now(); pogingen.set(ip, p); }

/* ---------- http-hulpjes ---------- */
function send(res, status, obj) { const body = JSON.stringify(obj); res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body)}); res.end(body); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 2 * 1024 * 1024) { reject(new Error('te groot')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new Error('geen geldige json')); } });
    req.on('error', reject);
  });
}
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8'};
function serveStatic(res, rel) {
  const file = path.normalize(path.join(PUBLIC, rel === '/' ? 'index.html' : rel));
  if (!file.startsWith(PUBLIC + path.sep) && file !== path.join(PUBLIC, 'index.html')) { res.writeHead(404); return res.end('Niet gevonden'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); return res.end('Niet gevonden'); }
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'",
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin'});
    fs.createReadStream(file).pipe(res);
  });
}

/* ---------- live updates (server-sent events) ---------- */
const streams = new Set();
function broadcast() { const msg = `event: change\ndata: ${JSON.stringify({versie: db.versie})}\n\n`; streams.forEach(r => { try { r.write(msg); } catch (e) { streams.delete(r); } }); }

/* ---------- gegevens ---------- */
function geldigDoc(doc) { return doc && typeof doc === 'object' && !Array.isArray(doc) && JSON.stringify(doc).length <= 256 * 1024; }
function zetDoc(col, id, doc, door) { db.data[col][id] = Object.assign({}, doc, {id, _door: door, _op: new Date().toISOString()}); }
function schrijf(writes, door) {
  for (const w of writes) {
    if (!w || !COLS.includes(w.col) || !ID_RE.test(String(w.id || ''))) throw new Error('ongeldige schrijfopdracht');
    if (w.op === 'set') { if (!geldigDoc(w.doc)) throw new Error('ongeldig document'); }
    else if (w.op !== 'delete') throw new Error('onbekende opdracht');
  }
  for (const w of writes) { if (w.op === 'set') zetDoc(w.col, w.id, w.doc, door); else delete db.data[w.col][w.id]; }
  db.versie++; saveDbSoon(); broadcast();
  return db.versie;
}

/* ---------- api ---------- */
async function api(req, res, p, ip) {
  const m = req.method;
  if (m !== 'GET' && m !== 'HEAD') {
    const origin = req.headers.origin;
    if (origin) { let ok = false; try { ok = new URL(origin).host === req.headers.host; } catch (e) { ok = false; } if (!ok) return send(res, 403, {fout: 'ongeldige oorsprong'}); }
    if (!(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, {fout: 'json verwacht'});
  }
  if (p === '/api/login' && m === 'POST') {
    if (geblokkeerd(ip)) return send(res, 429, {fout: 'geblokkeerd'});
    const b = await readBody(req); const u = userByNaam(b.naam);
    if (!u || !checkWw(u, b.wachtwoord)) { mislukt(ip); log('Mislukte login voor', JSON.stringify(String(b.naam || '')), 'van', ip); return send(res, 401, {fout: 'ongeldig'}); }
    pogingen.delete(ip); u.laatsteLogin = new Date().toISOString(); saveUsers(); nieuweSessie(res, u.naam); log('Login:', u.naam);
    return send(res, 200, publicUser(u));
  }
  const sess = getSessie(req);
  const user = sess ? userByNaam(sess.naam) : null;
  if (!user) { if (sess) wisSessie(res, sess.token); return send(res, 401, {fout: 'niet ingelogd'}); }

  if (p === '/api/me' && m === 'GET') return send(res, 200, publicUser(user));
  if (p === '/api/logout' && m === 'POST') { wisSessie(res, sess.token); return send(res, 200, {ok: true}); }
  if (p === '/api/wachtwoord' && m === 'POST') {
    const b = await readBody(req);
    if (!checkWw(user, b.huidig)) return send(res, 400, {fout: 'huidig wachtwoord klopt niet'});
    if (String(b.nieuw || '').length < 8) return send(res, 400, {fout: 'minimaal 8 tekens'});
    Object.assign(user, hashWw(b.nieuw)); saveUsers(); log('Wachtwoord gewijzigd:', user.naam);
    return send(res, 200, {ok: true});
  }
  if (p === '/api/data' && m === 'GET') { const data = {}; COLS.forEach(c => { data[c] = Object.values(db.data[c]); }); return send(res, 200, {versie: db.versie, data}); }
  if (p === '/api/stream' && m === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no'});
    res.write(`retry: 3000\nevent: change\ndata: ${JSON.stringify({versie: db.versie})}\n\n`);
    streams.add(res); const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch (e) { /* weg */ } }, 25000);
    req.on('close', () => { streams.delete(res); clearInterval(ping); });
    return;
  }
  if (p === '/api/data/bulk' && m === 'POST') {
    const b = await readBody(req); if (!Array.isArray(b.writes) || b.writes.length > 5000) return send(res, 400, {fout: 'writes verwacht'});
    try { return send(res, 200, {versie: schrijf(b.writes, user.naam)}); } catch (e) { return send(res, 400, {fout: e.message}); }
  }
  const md = p.match(/^\/api\/data\/([a-z]+)\/([^/]+)$/);
  if (md && (m === 'PUT' || m === 'DELETE')) {
    const col = md[1], id = decodeURIComponent(md[2]);
    try { const w = m === 'PUT' ? {op: 'set', col, id, doc: await readBody(req)} : {op: 'delete', col, id}; return send(res, 200, {versie: schrijf([w], user.naam)}); }
    catch (e) { return send(res, 400, {fout: e.message}); }
  }
  /* beheer */
  if (p.startsWith('/api/gebruikers')) {
    if (!user.admin) return send(res, 403, {fout: 'alleen voor beheerders'});
    if (p === '/api/gebruikers' && m === 'GET') return send(res, 200, users.map(publicUser));
    if (p === '/api/gebruikers' && m === 'POST') {
      const b = await readBody(req);
      try { const r = maakGebruiker({naam: String(b.naam || '').toLowerCase().trim(), weergave: String(b.weergave || '').trim(), rol: String(b.rol || '').trim(), admin: !!b.admin}, b.wachtwoord ? String(b.wachtwoord) : null); log('Gebruiker toegevoegd:', r.user.naam, 'door', user.naam); return send(res, 200, {naam: r.user.naam, wachtwoord: r.wachtwoord}); }
      catch (e) { return send(res, 400, {fout: e.message}); }
    }
    const mu = p.match(/^\/api\/gebruikers\/([^/]+)$/);
    if (mu) {
      const u = userByNaam(decodeURIComponent(mu[1])); if (!u) return send(res, 404, {fout: 'onbekende gebruiker'});
      if (m === 'PUT') {
        const b = await readBody(req); const out = {ok: true};
        if (typeof b.weergave === 'string' && b.weergave.trim()) u.weergave = b.weergave.trim();
        if (typeof b.rol === 'string') u.rol = b.rol.trim();
        if (typeof b.admin === 'boolean') { if (!b.admin && u.naam === user.naam) return send(res, 400, {fout: 'je kunt jezelf niet als beheerder verwijderen'}); u.admin = b.admin; }
        if (b.nieuwWachtwoord) { const ww = b.nieuwWachtwoord === true ? genWw() : String(b.nieuwWachtwoord); if (ww.length < 8) return send(res, 400, {fout: 'minimaal 8 tekens'}); Object.assign(u, hashWw(ww)); if (b.nieuwWachtwoord === true) out.wachtwoord = ww; Object.keys(sessies).forEach(k => { if (sessies[k].naam === u.naam && k !== sess.token) delete sessies[k]; }); saveSessies(); log('Wachtwoord gereset voor', u.naam, 'door', user.naam); }
        saveUsers(); return send(res, 200, out);
      }
      if (m === 'DELETE') {
        if (u.naam === user.naam) return send(res, 400, {fout: 'je kunt jezelf niet verwijderen'});
        users = users.filter(x => x.naam !== u.naam); saveUsers();
        Object.keys(sessies).forEach(k => { if (sessies[k].naam === u.naam) delete sessies[k]; }); saveSessies();
        log('Gebruiker verwijderd:', u.naam, 'door', user.naam); return send(res, 200, {ok: true});
      }
    }
  }
  return send(res, 404, {fout: 'onbekende api-route'});
}

/* ---------- server ---------- */
function handle(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';
  let p = decodeURI((req.url || '/').split('?')[0]);
  if (BASE) { if (p === BASE) { res.writeHead(302, {Location: BASE + '/'}); return res.end(); } if (!p.startsWith(BASE + '/')) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); return res.end('Niet gevonden'); } p = p.slice(BASE.length); }
  if (p.startsWith('/api/')) return api(req, res, p, ip).catch(e => { log('API-fout:', e.message); if (!res.headersSent) send(res, 500, {fout: 'serverfout'}); });
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  return serveStatic(res, p);
}

/* ---------- opdrachtregel ---------- */
function cli(args) {
  if (args[0] === '--setup') {
    fs.mkdirSync(DATA_DIR, {recursive: true}); if (!fs.existsSync(FILES.db)) writeJson(FILES.db, db);
    console.log('\nWillem Bakker teamportaal – eerste inrichting');
    console.log('Datamap: ' + DATA_DIR + '\n');
    const regels = [];
    STANDAARD_GEBRUIKERS.forEach(spec => { if (userByNaam(spec.naam)) { regels.push(`  ${spec.naam.padEnd(10)} bestaat al (wachtwoord ongewijzigd)`); return; } const r = maakGebruiker(spec); regels.push(`  ${spec.naam.padEnd(10)} wachtwoord: ${r.wachtwoord}   (${spec.weergave}, ${spec.rol}${spec.admin ? ', beheerder' : ''})`); });
    console.log('Accounts (inlognaam = voornaam in kleine letters):'); console.log(regels.join('\n'));
    console.log('\nBewaar deze wachtwoorden en geef ze persoonlijk door; ze worden niet opnieuw getoond.');
    console.log('Start daarna de server met:  node server.js\n');
    return true;
  }
  if (args[0] === '--gebruiker' && args[1]) {
    const admin = args.includes('--admin'); const rest = args.slice(2).filter(a => a !== '--admin');
    try { const r = maakGebruiker({naam: args[1].toLowerCase(), weergave: rest[0] || args[1], rol: rest[1] || '', admin}); console.log(`Gebruiker ${r.user.naam} aangemaakt. Wachtwoord: ${r.wachtwoord}`); } catch (e) { console.error('Mislukt: ' + e.message); process.exitCode = 1; }
    return true;
  }
  if (args[0] === '--wachtwoord' && args[1]) {
    const u = userByNaam(args[1]); if (!u) { console.error('Onbekende gebruiker: ' + args[1]); process.exitCode = 1; return true; }
    const ww = genWw(); Object.assign(u, hashWw(ww)); saveUsers(); console.log(`Nieuw wachtwoord voor ${u.naam}: ${ww}`); return true;
  }
  if (args[0] === '--help' || args[0] === '-h') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace('#!/usr/bin/env node\n/*', '')); return true; }
  return false;
}

if (require.main === module) {
  if (!cli(process.argv.slice(2))) {
    if (!users.length) { console.log('Nog geen gebruikers. Voer eerst uit:  node server.js --setup'); process.exit(1); }
    const server = http.createServer(handle);
    server.listen(PORT, HOST, () => log(`Willem Bakker teamportaal draait op http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}${BASE}/  (data in ${DATA_DIR})`));
    const stop = () => { log('Stoppen…'); if (saveTimer) { clearTimeout(saveTimer); try { writeJson(FILES.db, db); } catch (e) { /* niets */ } } server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 1500); };
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
  }
}
module.exports = {handle, genWw, hashWw, checkWw};
