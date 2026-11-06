export type AuthMode = 'signin' | 'register' | 'guest';

export interface StyluSession {
  handle: string;
  mode: AuthMode;
  enteredAt: string;
}

const SESSION_KEY = 'stylu_broadcast_session';

const ADJECTIVES = [
  'Neon', 'Cosmic', 'Urban', 'Retro', 'Cyber', 'Electric', 'Quantum',
  'Digital', 'Chrome', 'Vapor', 'Pixel', 'Azure', 'Obsidian', 'Crimson',
];

const NOUNS = [
  'Drifter', 'Runner', 'Rebel', 'Phoenix', 'Shadow', 'Ghost', 'Knight',
  'Rogue', 'Falcon', 'Storm', 'Wolf', 'Viper', 'Tiger', 'Dragon',
];

export function generateHandle(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 999);
  return `@${adj}${noun}${suffix}`;
}

export function readSession(): StyluSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StyluSession;
    if (!parsed?.handle) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: StyluSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function normalizeHandle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}
