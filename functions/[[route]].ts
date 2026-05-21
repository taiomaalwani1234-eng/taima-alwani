export interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// SQL Schema initialization — each statement is separate for D1 batch()
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT,
    level TEXT DEFAULT 'recruit',
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, game_type)
  )`,
  `CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    ip TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
];

// The safe SELECT columns list (never includes password_hash)
const USER_SAFE_COLS = 'id, username, email, nickname, level, role, is_banned, created_at, last_login';

// PBKDF2 Password Hashing using Web Crypto API
async function hashPassword(password: string, salt?: string): Promise<{hash: string, salt: string}> {
  const s = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(s), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return { hash: `${s}:${hash}`, salt: s };
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (!stored.includes(':')) {
    // Taima legacy plaintext password support
    return password === stored;
  }
  const [salt] = stored.split(':');
  const { hash } = await hashPassword(password, salt);
  return hash === stored;
}

async function initDB(db: D1Database) {
  // 1. Create tables using batch() — D1 requires each statement to be separate
  await db.batch(SCHEMA_STATEMENTS.map(sql => db.prepare(sql)));

  // 2. Safe column migration using PRAGMA table_info
  try {
    const tableInfo = await db.prepare("PRAGMA table_info(users)").all();
    const columns = (tableInfo.results as any[]).map((r: any) => r.name as string);

    const migrations: ReturnType<D1Database['prepare']>[] = [];
    if (!columns.includes('email')) {
      migrations.push(db.prepare("ALTER TABLE users ADD COLUMN email TEXT"));
    }
    if (!columns.includes('password_hash')) {
      migrations.push(db.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT"));
    }
    if (!columns.includes('role')) {
      migrations.push(db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"));
    }
    if (!columns.includes('is_banned')) {
      migrations.push(db.prepare("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0"));
    }
    if (migrations.length > 0) {
      await db.batch(migrations);
    }
  } catch (err) {
    console.error("DB migration error:", err);
  }
}

// Helper to check admin auth
function requireAdmin(request: Request, env: Env): boolean {
  const token = request.headers.get('X-Admin-Token');
  const secret = env.ADMIN_SECRET || 'admin';
  return token === secret;
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

  // Auto-migrate database on API request
  try {
    await initDB(env.DB);
  } catch (dbErr: any) {
    console.error("Database auto-init failed:", dbErr);
  }

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Routes
  try {
      // ===== ALL USERS (admin) =====
      if (path === '/api/users' && method === 'GET') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);
        const results = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users ORDER BY created_at DESC`).all();
        return jsonResponse({ users: results.results });
      }

      // ===== DELETE USER (admin) =====
      const deleteMatch = path.match(/^\/api\/admin\/users\/(\d+)$/);
      if (deleteMatch && method === 'DELETE') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const userId = parseInt(deleteMatch[1]);
        await env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(userId).run();
        await env.DB.prepare('DELETE FROM logs WHERE user_id = ?').bind(userId).run();
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, "admin_delete_user", ?, ?)')
          .bind(null, JSON.stringify({ deleted_user_id: userId }), request.headers.get('cf-connecting-ip') || '').run();

        return jsonResponse({ success: true });
      }

      // ===== ADMIN: CHANGE USER PASSWORD =====
      const pwdMatch = path.match(/^\/api\/admin\/users\/(\d+)\/password$/);
      if (pwdMatch && method === 'POST') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const targetId = parseInt(pwdMatch[1]);
        const { new_password } = await request.json() as any;
        if (!new_password || new_password.length < 4) {
          return jsonResponse({ error: 'password too short (min 4 chars)' }, 400);
        }

        const { hash } = await hashPassword(new_password);
        await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(hash, targetId).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, "admin_password_reset", ?, ?)')
          .bind(targetId, JSON.stringify({ target_user_id: targetId }), request.headers.get('cf-connecting-ip') || '').run();

        return jsonResponse({ success: true });
      }

      // ===== ADMIN: CHANGE USER ROLE =====
      const roleMatch = path.match(/^\/api\/admin\/users\/(\d+)\/role$/);
      if (roleMatch && method === 'POST') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const targetId = parseInt(roleMatch[1]);
        const { role } = await request.json() as any;
        if (!role || !['admin', 'user'].includes(role)) {
          return jsonResponse({ error: 'role must be "admin" or "user"' }, 400);
        }

        await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, targetId).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, "admin_role_change", ?, ?)')
          .bind(targetId, JSON.stringify({ new_role: role }), request.headers.get('cf-connecting-ip') || '').run();

        return jsonResponse({ success: true });
      }

      // ===== ADMIN: UPDATE USER DATA =====
      const editMatch = path.match(/^\/api\/admin\/users\/(\d+)\/update$/);
      if (editMatch && method === 'POST') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const targetId = parseInt(editMatch[1]);
        const { nickname, email, level, role } = await request.json() as any;

        const updates: string[] = [];
        const params: any[] = [];
        if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email); }
        if (level !== undefined) { updates.push('level = ?'); params.push(level); }
        if (role !== undefined && ['admin', 'user'].includes(role)) { updates.push('role = ?'); params.push(role); }
        if (updates.length === 0) return jsonResponse({ error: 'nothing to update' }, 400);

        params.push(targetId);
        await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, "admin_user_edit", ?, ?)')
          .bind(targetId, JSON.stringify({ updates: updates.map(u => u.split(' = ')[0]) }), request.headers.get('cf-connecting-ip') || '').run();

        const user = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(targetId).first();
        return jsonResponse({ success: true, user });
      }

      // ===== ADMIN: BAN/UNBAN USER =====
      const banMatch = path.match(/^\/api\/admin\/users\/(\d+)\/ban$/);
      if (banMatch && method === 'POST') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const targetId = parseInt(banMatch[1]);
        const { is_banned } = await request.json() as any;
        const banVal = is_banned ? 1 : 0;

        await env.DB.prepare('UPDATE users SET is_banned = ? WHERE id = ?').bind(banVal, targetId).run();

        await env.DB.prepare('INSERT INTO logs (user_id, action, details, ip) VALUES (?, ?, ?, ?)')
          .bind(targetId, banVal ? 'admin_ban_user' : 'admin_unban_user', '{}', request.headers.get('cf-connecting-ip') || '').run();

        return jsonResponse({ success: true });
      }

      // ===== HEALTH =====
      if (path === '/api/health' && method === 'GET') {
        return jsonResponse({ status: 'ok', time: new Date().toISOString() });
      }

      // ===== MANUAL MIGRATION TRIGGER (safe to call multiple times) =====
      if (path === '/api/migrate' && method === 'GET') {
        try {
          await initDB(env.DB);
          const tableInfo = await env.DB.prepare("PRAGMA table_info(users)").all();
          return jsonResponse({ success: true, columns: tableInfo.results });
        } catch (migErr: any) {
          return jsonResponse({ success: false, error: migErr.message }, 500);
        }
      }

      // ===== REGISTER =====
      if (path === '/api/auth/register' && method === 'POST') {
        const { username, email, password, nickname } = await request.json() as any;
        if (!username || !email || !password) return jsonResponse({ error: 'username, email, and password required' }, 400);
        if (password.length < 4) return jsonResponse({ error: 'password too short (min 4)' }, 400);

        // Check if email or username exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ?').bind(email, username).first();
        if (existing) return jsonResponse({ error: 'email or username already exists' }, 409);

        // Hash the password
        const { hash } = await hashPassword(password);

        // Check if this is the very first user — auto-promote to admin
        const countResult = await env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first() as any;
        const isFirstUser = (countResult?.cnt || 0) === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const result = await env.DB.prepare('INSERT INTO users (username, email, password_hash, nickname, role) VALUES (?, ?, ?, ?, ?)')
          .bind(username, email, hash, nickname || username, role).run();
        const newId = result.meta.last_row_id;

        await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "register", ?)')
          .bind(newId, request.headers.get('cf-connecting-ip') || '').run();

        const user = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(newId).first();
        return jsonResponse({ user, isNew: true }, 201);
      }

      // ===== LOGIN (email + password) =====
      if (path === '/api/auth/login' && method === 'POST') {
        const body = await request.json() as any;
        const { username, nickname, email, password } = body;

        // Email + password login
        if (email && password) {
          const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as any;
          if (!user) return jsonResponse({ error: 'invalid email or password' }, 401);

          // Check if user is banned
          if (user.is_banned) return jsonResponse({ error: 'هذا الحساب محظور. تواصل مع المدير.' }, 403);

          const isValid = await verifyPassword(password, user.password_hash || '');
          if (!isValid) return jsonResponse({ error: 'invalid email or password' }, 401);

          // If the password was legacy plaintext, upgrade it to hashed
          if (user.password_hash && !user.password_hash.includes(':')) {
            const { hash } = await hashPassword(password);
            await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(hash, user.id).run();
          }

          await env.DB.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').bind(user.id).run();
          await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "login", ?)')
            .bind(user.id, request.headers.get('cf-connecting-ip') || '').run();

          const safeUser = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(user.id).first();
          return jsonResponse({ user: safeUser, isNew: false });
        }

        // Legacy: username-only login
        if (!username) return jsonResponse({ error: 'email+password or username required' }, 400);
        const existing = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first() as any;
        
        if (existing) {
          if (existing.is_banned) return jsonResponse({ error: 'هذا الحساب محظور. تواصل مع المدير.' }, 403);

          await env.DB.prepare('UPDATE users SET last_login = datetime("now"), nickname = ? WHERE id = ?')
            .bind(nickname || existing.nickname, existing.id).run();
          await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "login", ?)')
            .bind(existing.id, request.headers.get('cf-connecting-ip') || '').run();
          const user = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(existing.id).first();
          return jsonResponse({ user, isNew: false });
        } else {
          const result = await env.DB.prepare('INSERT INTO users (username, nickname) VALUES (?, ?)').bind(username, nickname || username).run();
          const newId = result.meta.last_row_id;
          await env.DB.prepare('INSERT INTO logs (user_id, action, ip) VALUES (?, "register", ?)')
            .bind(newId, request.headers.get('cf-connecting-ip') || '').run();
          const user = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(newId).first();
          return jsonResponse({ user, isNew: true }, 201);
        }
      }

      // ===== UPDATE PROFILE =====
      if (path === '/api/user/profile' && method === 'POST') {
        const { user_id, nickname, email, password } = await request.json() as any;
        if (!user_id) return jsonResponse({ error: 'user_id required' }, 400);

        const updates: string[] = [];
        const params: any[] = [];
        if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email); }
        if (password !== undefined) { 
          const { hash } = await hashPassword(password);
          updates.push('password_hash = ?'); 
          params.push(hash); 
        }
        if (updates.length === 0) return jsonResponse({ error: 'nothing to update' }, 400);

        params.push(user_id);
        await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        const user = await env.DB.prepare(`SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`).bind(user_id).first();
        return jsonResponse({ user });
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

      // ===== GET LOGS (admin) =====
      if (path === '/api/logs' && method === 'GET') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const user_id = url.searchParams.get('user_id');
        const action = url.searchParams.get('action');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let query = 'SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id';
        const conditions: string[] = [];
        const params: any[] = [];
        
        if (user_id) {
          conditions.push('l.user_id = ?');
          params.push(user_id);
        }
        if (action) {
          conditions.push('l.action = ?');
          params.push(action);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await env.DB.prepare(query).bind(...params).all();

        // Also get the total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM logs l';
        const countParams: any[] = [];
        if (conditions.length > 0) {
          countQuery += ' WHERE ' + conditions.join(' AND ');
          if (user_id) countParams.push(user_id);
          if (action) countParams.push(action);
        }
        const countResult = countParams.length > 0
          ? await env.DB.prepare(countQuery).bind(...countParams).first() as any
          : await env.DB.prepare(countQuery).first() as any;

        return jsonResponse({ logs: results.results, total: countResult?.total || 0 });
      }

      // ===== STATS (admin) =====
      if (path === '/api/stats' && method === 'GET') {
        if (!requireAdmin(request, env)) return jsonResponse({ error: 'unauthorized' }, 403);

        const [users, logs, today, active7d, admins, topGame] = await env.DB.batch([
          env.DB.prepare('SELECT COUNT(*) as count FROM users'),
          env.DB.prepare('SELECT COUNT(*) as count FROM logs'),
          env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')"),
          env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE last_login > datetime('now', '-7 days')"),
          env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
          env.DB.prepare("SELECT game_type, COUNT(*) as cnt FROM progress GROUP BY game_type ORDER BY cnt DESC LIMIT 1"),
        ]);

        const topGameResult = topGame.results?.[0] as any;

        return jsonResponse({
          totalUsers: (users.results?.[0] as any)?.count || 0,
          totalLogs: (logs.results?.[0] as any)?.count || 0,
          todayUsers: (today.results?.[0] as any)?.count || 0,
          activeUsers7d: (active7d.results?.[0] as any)?.count || 0,
          totalAdmins: (admins.results?.[0] as any)?.count || 0,
          topGame: topGameResult ? { game_type: topGameResult.game_type, count: topGameResult.cnt } : null,
        });
      }

      return new Response('Not found', { status: 404 });

    } catch (err: any) {
      return jsonResponse({ error: err.message }, 500);
    }
};
