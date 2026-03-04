/**
 * Simple auth using localStorage only — no database or server.
 * Sessions persist in this browser until you sign out or clear site data.
 * For sync across devices you’d add a backend (e.g. Firebase/Supabase).
 */

const STORAGE_USER = "habicard_user";
const STORAGE_GUEST = "habicard_guest";

/** Must be non-empty and contain @ to create a sign-in session. */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.includes("@");
}

export interface StoredUser {
  email: string;
  createdAt: string;
  displayName?: string;
}

export function setUser(email: string, displayName?: string): void {
  const trimmed = email.trim();
  const hasValidEmail = trimmed.length > 0 && trimmed.includes("@");
  // Require a valid email to sign in, unless we're only saving a display name (e.g. guest upgrading on Profile)
  if (!hasValidEmail && !displayName?.trim()) return;
  const existing = getUser();
  const user: StoredUser = {
    email: hasValidEmail ? trimmed : existing?.email ?? "guest@local",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    displayName: displayName?.trim() || existing?.displayName,
  };
  try {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_GUEST);
  } catch {
    // ignore
  }
}

/** Update profile (display name and/or email) for the current user. */
export function updateProfile(updates: { displayName?: string; email?: string }): void {
  let user = getUser();
  if (!user && isGuest()) {
    setUser("", updates.displayName);
    user = getUser();
  }
  if (!user) return;
  const next: StoredUser = {
    ...user,
    ...(updates.displayName !== undefined && { displayName: updates.displayName.trim() || undefined }),
    ...(updates.email !== undefined && { email: updates.email.trim() }),
  };
  try {
    localStorage.setItem(STORAGE_USER, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Display name for the header: stored name, or email local part, or "Guest". */
export function getDisplayName(): string {
  const user = getUser();
  if (user?.displayName) return user.displayName;
  if (user?.email) {
    const local = user.email.split("@")[0];
    if (local) return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  }
  if (isGuest()) return "Guest";
  return "Guest";
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
