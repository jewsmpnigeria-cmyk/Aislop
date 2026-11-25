// Single-file Cloudflare Worker: loader site + password admin.
// Needs: KV binding named SCRIPTS, secret named ADMIN_PASSWORD.

const INDEX_HTML = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<meta name=\"robots\" content=\"noindex\">\n<title>Script Loader</title>\n<style>\n  :root{\n    --bg:#14161c; --panel:#1c1f27; --line:#2d313c; --text:#e8eaf0; --muted:#8b91a1;\n    --accent:#5ee0c2; --accent-ink:#06231c;\n  }\n  *{box-sizing:border-box}\n  html,body{height:100%}\n  body{\n    margin:0; background:var(--bg); color:var(--text);\n    font:16px/1.55 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif;\n    display:grid; place-items:center; padding:24px;\n  }\n  main{width:100%; max-width:560px}\n  h1{font-size:1.9rem; margin:0 0 6px; letter-spacing:-.02em}\n  p.sub{margin:0 0 28px; color:var(--muted)}\n  label{display:block; font-size:.9rem; color:var(--muted); margin-bottom:6px}\n  .row{display:flex; gap:8px; align-items:center; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:4px 4px 4px 14px}\n  .row:focus-within{border-color:var(--accent)}\n  .prefix{color:var(--muted); font-family:ui-monospace,Menlo,Consolas,monospace; font-size:.95rem; white-space:nowrap}\n  input{flex:1; min-width:0; background:transparent; border:0; color:var(--text); font:inherit; font-family:ui-monospace,Menlo,Consolas,monospace; padding:10px 6px; outline:none}\n  pre{\n    margin:18px 0 12px; padding:16px; background:var(--panel); border:1px solid var(--line);\n    border-radius:10px; overflow-x:auto; font:.9rem/1.5 ui-monospace,Menlo,Consolas,monospace;\n    white-space:pre-wrap; word-break:break-all;\n  }\n  button{\n    background:var(--accent); color:var(--accent-ink); border:0; border-radius:8px;\n    font:inherit; font-weight:600; padding:10px 18px; cursor:pointer;\n  }\n  button:hover{filter:brightness(1.08)}\n  button:focus-visible,input:focus-visible{outline:2px solid var(--accent); outline-offset:2px}\n  .hint{margin-top:22px; font-size:.85rem; color:var(--muted)}\n</style>\n</head>\n<body>\n<main>\n  <h1>Script Loader</h1>\n  <p class=\"sub\">Type a script name to get its loader line.</p>\n\n  <label for=\"name\">Script name</label>\n  <div class=\"row\">\n    <span class=\"prefix\" id=\"prefix\">/script/</span>\n    <input id=\"name\" value=\"example\" autocomplete=\"off\" spellcheck=\"false\" autocapitalize=\"none\">\n  </div>\n\n  <pre id=\"out\"></pre>\n  <button id=\"copy\" type=\"button\">Copy loader</button>\n\n  <p class=\"hint\">Scripts are managed by the site owner.</p>\n</main>\n\n<script>\n  const nameEl = document.getElementById('name');\n  const out = document.getElementById('out');\n  const copy = document.getElementById('copy');\n  const origin = location.origin;\n\n  function line(){\n    const n = nameEl.value.trim().replace(/[^a-zA-Z0-9_\\-.]/g,'') || 'scriptname';\n    return 'loadstring(game:HttpGet(\"' + origin + '/script/' + n + '\"))()';\n  }\n  function render(){ out.textContent = line(); }\n  nameEl.addEventListener('input', render);\n  copy.addEventListener('click', async () => {\n    try { await navigator.clipboard.writeText(line()); copy.textContent = 'Copied'; }\n    catch(e){ copy.textContent = 'Press and hold to copy'; }\n    setTimeout(() => copy.textContent = 'Copy loader', 1500);\n  });\n  render();\n</script>\n</body>\n</html>\n";
const ADMIN_HTML = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<meta name=\"robots\" content=\"noindex\">\n<title>Admin</title>\n<style>\n  :root{--bg:#14161c;--panel:#1c1f27;--line:#2d313c;--text:#e8eaf0;--muted:#8b91a1;--accent:#5ee0c2;--ink:#06231c;--danger:#ff7b7b}\n  *{box-sizing:border-box}\n  body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif;padding:20px}\n  main{max-width:720px;margin:0 auto}\n  h1{font-size:1.6rem;margin:8px 0 18px;letter-spacing:-.02em}\n  h2{font-size:1.05rem;margin:28px 0 10px}\n  .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px}\n  input,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--text);padding:10px 12px;font:inherit;outline:none}\n  textarea{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.88rem;min-height:260px;resize:vertical;white-space:pre}\n  input:focus,textarea:focus{border-color:var(--accent)}\n  label{display:block;font-size:.85rem;color:var(--muted);margin:12px 0 6px}\n  button{background:var(--accent);color:var(--ink);border:0;border-radius:8px;font:inherit;font-weight:600;padding:9px 16px;cursor:pointer}\n  button.ghost{background:transparent;color:var(--text);border:1px solid var(--line)}\n  button.danger{background:transparent;color:var(--danger);border:1px solid var(--line)}\n  button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n  .bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center}\n  .grow{flex:1}\n  .item{display:flex;gap:8px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}\n  .item:first-child{border-top:0}\n  .item .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,Menlo,Consolas,monospace}\n  .item button{padding:6px 10px;font-size:.85rem}\n  .msg{min-height:1.4em;color:var(--muted);font-size:.9rem}\n  .msg.err{color:var(--danger)}\n  .hidden{display:none}\n  .empty{color:var(--muted);padding:6px 0}\n</style>\n</head>\n<body>\n<main>\n  <h1>Script admin</h1>\n\n  <section id=\"login\" class=\"panel\">\n    <label for=\"pw\" style=\"margin-top:0\">Password</label>\n    <input id=\"pw\" type=\"password\" autocomplete=\"current-password\">\n    <div class=\"bar\"><button id=\"loginBtn\" type=\"button\">Log in</button><span id=\"loginMsg\" class=\"msg err\"></span></div>\n  </section>\n\n  <section id=\"app\" class=\"hidden\">\n    <div class=\"bar\" style=\"margin:0 0 8px\"><span class=\"grow msg\" id=\"status\"></span><button id=\"logout\" class=\"ghost\" type=\"button\">Log out</button></div>\n\n    <div class=\"panel\">\n      <label for=\"name\" style=\"margin-top:0\">Script name (becomes /script/name)</label>\n      <input id=\"name\" autocomplete=\"off\" spellcheck=\"false\" autocapitalize=\"none\" placeholder=\"mygame\">\n      <label for=\"code\">Code</label>\n      <textarea id=\"code\" spellcheck=\"false\" placeholder=\"-- paste your script here\"></textarea>\n      <div class=\"bar\">\n        <button id=\"save\" type=\"button\">Save script</button>\n        <button id=\"clear\" class=\"ghost\" type=\"button\">Clear</button>\n        <label class=\"ghost\" style=\"margin:0;border:1px solid var(--line);border-radius:8px;padding:8px 14px;cursor:pointer;color:var(--text)\">\n          Load from file<input id=\"file\" type=\"file\" accept=\".lua,.luau,.txt,text/plain\" class=\"hidden\">\n        </label>\n      </div>\n    </div>\n\n    <h2>Your scripts</h2>\n    <div id=\"list\" class=\"panel\"></div>\n  </section>\n</main>\n\n<script>\nconst $ = id => document.getElementById(id);\nlet pw = sessionStorage.getItem('pw') || '';\n\nasync function call(method, path, body) {\n  let r;\n  try { r = await fetch(path, { method, body, headers: { Authorization: 'Bearer ' + pw } }); }\n  catch (e) { throw new Error('Cannot reach the site: ' + e.message); }\n  const type = r.headers.get('content-type') || '';\n  if (r.status === 401) { logout('Wrong password, or the ADMIN_PASSWORD secret is not set / not redeployed yet.'); throw new Error('AUTH'); }\n  if (type.includes('text/html')) throw new Error('The worker is not running (got a web page instead of the API). Re-upload the folder with _worker.js at the root.');\n  if (!r.ok) throw new Error(r.status + ': ' + (await r.text()).slice(0, 200));\n  return r;\n}\n\nfunction say(msg, err) { const s = $('status'); s.textContent = msg; s.className = 'grow msg' + (err ? ' err' : ''); }\n\nfunction logout(msg) {\n  pw = ''; sessionStorage.removeItem('pw');\n  $('app').classList.add('hidden'); $('login').classList.remove('hidden');\n  $('loginMsg').textContent = msg || ''; $('pw').value = '';\n}\n\nasync function refresh() {\n  const names = await (await call('GET', '/api/scripts')).json();\n  const list = $('list'); list.textContent = '';\n  if (!names.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No scripts yet. Save one above.'; list.append(e); return; }\n  for (const n of names) {\n    const row = document.createElement('div'); row.className = 'item';\n    const label = document.createElement('span'); label.className = 'n'; label.textContent = n;\n    const edit = btn('Edit', 'ghost', async () => {\n      const code = await (await call('GET', '/api/scripts/' + encodeURIComponent(n))).text();\n      $('name').value = n; $('code').value = code; scrollTo({ top: 0, behavior: 'smooth' }); say('Editing ' + n);\n    });\n    const copy = btn('Copy loader', 'ghost', async () => {\n      const line = 'loadstring(game:HttpGet(\"' + location.origin + '/script/' + n + '\"))()';\n      try { await navigator.clipboard.writeText(line); say('Loader copied'); } catch { say(line); }\n    });\n    const del = btn('Delete', 'danger', async () => {\n      if (!confirm('Delete ' + n + '?')) return;\n      await call('DELETE', '/api/scripts/' + encodeURIComponent(n)); say('Deleted ' + n); refresh();\n    });\n    row.append(label, edit, copy, del); list.append(row);\n  }\n}\nfunction btn(t, cls, fn) {\n  const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = t;\n  b.addEventListener('click', () => fn().catch(e => say(e.message === 'AUTH' ? '' : e.message, true))); return b;\n}\n\nasync function enter() {\n  const msg = $('loginMsg'), b = $('loginBtn');\n  msg.textContent = 'Logging in...'; msg.style.color = 'var(--muted)'; b.disabled = true;\n  try { await refresh(); $('login').classList.add('hidden'); $('app').classList.remove('hidden'); say(''); msg.textContent = ''; }\n  catch (e) { if (e.message !== 'AUTH') { msg.textContent = e.message; msg.style.color = 'var(--danger)'; } else { msg.style.color = 'var(--danger)'; } }\n  b.disabled = false;\n}\n\n$('loginBtn').addEventListener('click', () => { pw = $('pw').value; sessionStorage.setItem('pw', pw); enter(); });\n$('pw').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });\n$('logout').addEventListener('click', () => logout());\n$('clear').addEventListener('click', () => { $('name').value = ''; $('code').value = ''; say(''); });\n$('file').addEventListener('change', async e => {\n  const f = e.target.files[0]; if (!f) return;\n  $('code').value = await f.text();\n  if (!$('name').value) $('name').value = f.name.replace(/\\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\\-.]/g, '');\n  e.target.value = '';\n});\n$('save').addEventListener('click', async () => {\n  const n = $('name').value.trim();\n  if (!/^[a-zA-Z0-9_\\-.]{1,64}$/.test(n)) return say('Name: letters, numbers, - _ . only', true);\n  if (!$('code').value.trim()) return say('Code is empty', true);\n  try {\n    await call('PUT', '/api/scripts/' + encodeURIComponent(n), $('code').value);\n    say('Saved. Live at /script/' + n); refresh();\n  } catch (e) { say(e.message === 'AUTH' ? 'Session expired' : e.message, true); }\n});\n\nif (pw) enter();\n</script>\n</body>\n</html>\n";

const page = (html, noStore) => new Response(html, { headers: {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  ...(noStore ? { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } : {}),
} });

const NAME_RE = /^[a-zA-Z0-9_\-.]{1,64}$/;
const MAX_BYTES = 5 * 1024 * 1024;
const PREFIX = 's:';

const text = (body, status = 200, extra = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...extra } });

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const given = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(env.ADMIN_PASSWORD)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function serveScript(name, env) {
  if (!NAME_RE.test(name)) return text('Not found', 404);
  const code = await env.SCRIPTS.get(PREFIX + name);
  if (code === null) return text('Not found', 404);
  return text(code, 200, {
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
  });
}

async function api(request, env, name) {
  if (!(await isAdmin(request, env))) {
    await new Promise(r => setTimeout(r, 500));
    return text('Unauthorized', 401);
  }
  const method = request.method;

  if (!name) {
    if (method !== 'GET') return text('Method not allowed', 405);
    const names = [];
    let cursor;
    do {
      const res = await env.SCRIPTS.list({ prefix: PREFIX, cursor });
      for (const k of res.keys) names.push(k.name.slice(PREFIX.length));
      cursor = res.list_complete ? undefined : res.cursor;
    } while (cursor);
    names.sort();
    return Response.json(names);
  }

  if (!NAME_RE.test(name)) return text('Invalid name. Use letters, numbers, - _ . (max 64).', 400);
  const key = PREFIX + name;

  if (method === 'GET') {
    const code = await env.SCRIPTS.get(key);
    return code === null ? text('Not found', 404) : text(code);
  }
  if (method === 'PUT') {
    const body = await request.text();
    if (body.length > MAX_BYTES) return text('Too large (5 MB max)', 413);
    await env.SCRIPTS.put(key, body);
    return text('Saved');
  }
  if (method === 'DELETE') {
    await env.SCRIPTS.delete(key);
    return text('Deleted');
  }
  return text('Method not allowed', 405);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/script/')) {
      return serveScript(decodeURIComponent(pathname.slice('/script/'.length)), env);
    }

    const m = pathname.match(/^\/api\/scripts(?:\/([^/]+))?$/);
    if (m) {
      if (!env.SCRIPTS) return text('KV binding "SCRIPTS" is missing', 500);
      return api(request, env, m[1] ? decodeURIComponent(m[1]) : null);
    }

    if (pathname === '/' || pathname === '/index.html') return page(INDEX_HTML);
    if (pathname === '/admin' || pathname === '/admin.html' || pathname === '/admin/') return page(ADMIN_HTML, true);
    return text('Not found', 404);
  },
};
