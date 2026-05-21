export interface Env {
  DB: D1Database;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// SQL Schema initialization
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT,
  level TEXT DEFAULT 'recruit',
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, game_type)
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

async function initDB(db: D1Database) {
  await db.exec(SCHEMA);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // If the request is NOT for /api, let Pages serve the static assets
  if (!path.startsWith('/api')) {
    return next();
  }

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Routes
  try {
      // ===== ALL USERS =====
      if (path === '/api/users' && method === 'GET') {
        const results = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
        return jsonResponse({ users: results.results });
      }

      // ===== DELETE USER =====
      const deleteMatch = path.match(/^\/api\/admin\/users\/(\d+)$/);
      if (deleteMatch && method === 'DELETE') {
        const userId = parseInt(deleteMatch[1]);
        await env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(userId).run();
        await env.DB.prepare('DELETE FROM logs WHERE user_id = ?').bind(userId).run();
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        return jsonResponse({ success: true });
      }

      // ===== HEALTH =====
      if (path === '/api/health' && method === 'GET') {
        return jsonResponse({ status: 'ok', time: new Date().toISOString() });
      }

      // ===== REGISTER / LOGIN =====
      if (path === '/api/auth/login' && method === 'POST') {
        const { username, nickname } = await request.json() as any;
        if (!username) return jsonResponse({ error: 'username required' }, 400);

        // Upsert user
        const existing = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
        
        if (existing) {
          // Update last login & nickname
          await env.DB.prepare('UPDATE users SET last_login = datetime("now"), nickname = ? WHERE id = ?')
            .bind(nickname || existing.nickname, existing.id).run();
          
          // Log
          await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "login", ?)')
            .bind(existing.id, request.headers.get('cf-connecting-ip') || '').run();

          const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(existing.id).first();
          return jsonResponse({ user, isNew: false });
        } else {
          // Create new user
          const result = await env.DB.prepare('INSERT INTO users (username, nickname) VALUES (?, ?)')
            .bind(username, nickname || username).run();
          
          const newId = result.meta.last_row_id;
          await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "register", ?)')
            .bind(newId, request.headers.get('cf-connecting-ip') || '').run();

          const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(newId).first();
          return jsonResponse({ user, isNew: true }, 201);
        }
      }

      // ===== SAVE PROGRESS =====
      if (path === '/api/progress' && method === 'POST') {
        const { user_id, game_type, data } = await request.json() as any;
        if (!user_id || !game_type) return jsonResponse({ error: 'user_id and game_type required' }, 400);

        await env.DB.prepare(`
          INSERT INTO progress (user_id, game_type, data, updated_at) VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT(user_id, game_type) DO UPDATE SET data = ?, updated_at = datetime('now')
        `).bind(user_id, game_type, JSON.stringify(data), JSON.stringify(data)).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details) VALUES (?, "save_progress", ?)')
          .bind(user_id, JSON.stringify({ game_type })).run();

        return jsonResponse({ success: true });
      }

      // ===== GET PROGRESS =====
      if (path === '/api/progress' && method === 'GET') {
        const user_id = url.searchParams.get('user_id');
        const game_type = url.searchParams.get('game_type');

        if (!user_id) return jsonResponse({ error: 'user_id required' }, 400);

        let query = 'SELECT * FROM progress WHERE user_id = ?';
        const params: any[] = [user_id];
        
        if (game_type) {
          query += ' AND game_type = ?';
          params.push(game_type);
        }

        const results = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse({ progress: results.results });
      }

      // ===== UPDATE LEVEL =====
      if (path === '/api/user/level' && method === 'POST') {
        const { user_id, level } = await request.json() as any;
        if (!user_id || !level) return jsonResponse({ error: 'user_id and level required' }, 400);

        await env.DB.prepare('UPDATE users SET level = ? WHERE id = ?').bind(level, user_id).run();
        await env.DB.prepare('INSERT INTO logs (user_id, action, details) VALUES (?, "level_up", ?)')
          .bind(user_id, JSON.stringify({ level })).run();

        return jsonResponse({ success: true });
      }

      // ===== GET LOGS =====
      if (path === '/api/logs' && method === 'GET') {
        const user_id = url.searchParams.get('user_id');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        let query = 'SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id';
        const params: any[] = [];
        
        if (user_id) {
          query += ' WHERE l.user_id = ?';
          params.push(user_id);
        }
        query += ' ORDER BY l.created_at DESC LIMIT ?';
        params.push(limit);

        const results = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse({ logs: results.results });
      }

      // ===== STATS =====
      if (path === '/api/stats' && method === 'GET') {
        const users = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        const logs = await env.DB.prepare('SELECT COUNT(*) as count FROM logs').first();
        const today = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").first();
        
        return jsonResponse({
          totalUsers: (users as any)?.count || 0,
          totalLogs: (logs as any)?.count || 0,
          todayUsers: (today as any)?.count || 0,
        });
      }

      return new Response('Not found', { status: 404 });

    } catch (err: any) {
      return jsonResponse({ error: err.message }, 500);
    }
};
