const API_BASE = "/api";

// Get user from localStorage
export function getCurrentUser() {
  const stored = localStorage.getItem("taima_user");
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return null;
}

export function saveUserLocally(user: any) {
  localStorage.setItem("taima_user", JSON.stringify(user));
}

export function clearUserLocally() {
  localStorage.removeItem("taima_user");
}

// Register with email + password
export async function registerUser(username: string, email: string, password: string, nickname: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, nickname }),
  });
  const data = await res.json();
  if (data.user) saveUserLocally(data.user);
  return data;
}

// Login with email + password
export async function loginWithEmail(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.user) saveUserLocally(data.user);
  return data;
}

// Legacy login with username only
export async function loginUser(username: string, nickname: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, nickname }),
  });
  const data = await res.json();
  if (data.user) saveUserLocally(data.user);
  return data;
}

// Update profile
export async function updateProfile(userId: number, updates: { nickname?: string; email?: string; password?: string }) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ...updates }),
  });
  const data = await res.json();
  if (data.user) saveUserLocally(data.user);
  return data;
}

// Save progress
export async function saveProgress(userId: number, gameType: string, data: any) {
  const res = await fetch(`${API_BASE}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, game_type: gameType, data }),
  });
  return res.json();
}

// Get progress
export async function getProgress(userId: number, gameType?: string) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (gameType) params.set("game_type", gameType);
  const res = await fetch(`${API_BASE}/progress?${params}`);
  return res.json();
}

// Update level
export async function updateLevel(userId: number, level: string) {
  const res = await fetch(`${API_BASE}/user/level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, level }),
  });
  return res.json();
}
