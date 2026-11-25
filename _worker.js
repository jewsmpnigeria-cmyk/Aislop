// Cloudflare Pages "advanced mode" worker.
// Needs: KV binding named SCRIPTS, secret named ADMIN_PASSWORD.

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

    return env.ASSETS.fetch(request);
  },
};
