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

import { GameProgress } from '../data/gameProgression';

export interface GameBalances {
  cityBudget: number;
  millionaireMoney: number;
  cryptoCredits: number;
  sshScore: number;
  assessmentLevel: string;
}

// Get user game progress
export async function getUserGameProgress(userId: number): Promise<GameProgress> {
  try {
    const res = await fetch(`${API_BASE}/progress?user_id=${userId}`);
    const data = await res.json();
    
    const progress: GameProgress = {
      assessment: false,
      crypto: false,
      millionaire: false,
      city_level1: false,
      city_level2: false,
      city_level3: false,
      ssh: false,
    };
    
    if (data.progress) {
      for (const p of data.progress) {
        const gameData = JSON.parse(p.data || '{}');
        
        switch (p.game_type) {
          case 'assessment':
            progress.assessment = !!gameData.level || !!gameData.completedAt;
            break;
          case 'crypto':
            progress.crypto = !!gameData.completed;
            break;
          case 'millionaire':
            progress.millionaire = !!gameData.completed;
            break;
          case 'city_level1':
            progress.city_level1 = !!gameData.completed;
            break;
          case 'city_level2':
            progress.city_level2 = !!gameData.completed;
            break;
          case 'city_level3':
            progress.city_level3 = !!gameData.completed;
            break;
          case 'ssh':
            progress.ssh = !!gameData.completed;
            break;
        }
      }
    }
    
    return progress;
  } catch (err) {
    console.error('Failed to fetch progress:', err);
    return {
      assessment: false, crypto: false, millionaire: false,
      city_level1: false, city_level2: false, city_level3: false, ssh: false,
    };
  }
}

// Fetch all game balances
export async function fetchGameBalances(userId: number): Promise<GameBalances> {
  try {
    const res = await fetch(`${API_BASE}/progress?user_id=${userId}`);
    const data = await res.json();
    
    const balances: GameBalances = {
      cityBudget: 0,
      millionaireMoney: 0,
      cryptoCredits: 0,
      sshScore: 0,
      assessmentLevel: 'لم يُحدد',
    };
    
    if (data.progress) {
      for (const p of data.progress) {
        const gameData = JSON.parse(p.data || '{}');
        
        switch (p.game_type) {
          case 'city':
          case 'city_level1':
          case 'city_level2':
          case 'city_level3':
            balances.cityBudget = Math.max(balances.cityBudget, gameData.budget || 0);
            break;
          case 'millionaire':
            balances.millionaireMoney = Math.max(balances.millionaireMoney, gameData.money || 0);
            break;
          case 'crypto':
            balances.cryptoCredits = gameData.credits || gameData.score || 0;
            break;
          case 'ssh':
            balances.sshScore = gameData.score || 0;
            break;
          case 'assessment':
            balances.assessmentLevel = gameData.level || 'لم يُحدد';
            break;
        }
      }
    }
    
    return balances;
  } catch (err) {
    console.error('Failed to fetch balances:', err);
    return {
      cityBudget: 0, millionaireMoney: 0, cryptoCredits: 0,
      sshScore: 0, assessmentLevel: 'لم يُحدد',
    };
  }
}

