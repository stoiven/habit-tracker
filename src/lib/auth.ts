/**
 * Simple auth using localStorage only — no database or server.
 * Works on any device; data is per-browser. For sync across devices you’d add a backend (e.g. Firebase/Supabase).
 */

const STORAGE_USER = "habicard_user";
const STORAGE_GUEST = "habicard_guest";

export interface StoredUser {
  email: string;
  createdAt: string;
}

export function setUser(email: string): void {
  const user: StoredUser = { email: email.trim(), createdAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_GUEST);
  } catch {
    // ignore
  }
}

export function getUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setGuest(): void {
  try {
    localStorage.setItem(STORAGE_GUEST, "1");
    // Optionally clear user so "guest" is explicit
    // localStorage.removeItem(STORAGE_USER);
  } catch {
    // ignore
  }
}

export function isGuest(): boolean {
  try {
    return localStorage.getItem(STORAGE_GUEST) === "1";
  } catch {
    return false;
  }
}

export function isSignedIn(): boolean {
  return getUser() !== null || isGuest();
}

export function clearUser(): void {
  try {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_GUEST);
  } catch {
    // ignore
  }
}
