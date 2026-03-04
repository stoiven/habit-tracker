/**
 * Simple auth using localStorage only — no database or server.
 * Only the allowed email can sign in; password is set on first use and stored as a hash.
 * Sessions persist in this browser until you sign out or clear site data.
 */

const STORAGE_USER = "habicard_user";
const STORAGE_GUEST = "habicard_guest";
const STORAGE_PASSWORD_HASH = "habicard_password_hash";

/** Only this email can access the app. */
export const ALLOWED_EMAIL = "stevenkcruz95@gmail.com";

export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase() === ALLOWED_EMAIL.toLowerCase();
}

/** SHA-256 hash of password (hex string). */
async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isPasswordSet(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_PASSWORD_HASH);
  } catch {
    return false;
  }
}

function getPasswordHash(): string | null {
  try {
    return localStorage.getItem(STORAGE_PASSWORD_HASH);
  } catch {
    return null;
  }
}

export async function checkPassword(password: string): Promise<boolean> {
  const stored = getPasswordHash();
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

/** Set the password (first-time setup). Stores hash only. */
export async function setPassword(password: string): Promise<void> {
  if (!password || password.length < 6) return;
  const hash = await hashPassword(password);
  try {
    localStorage.setItem(STORAGE_PASSWORD_HASH, hash);
  } catch {
    // ignore
  }
}

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

/** Update profile (display name and/or email). Email can only be the allowed owner email. */
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
    ...(updates.email !== undefined && isAllowedEmail(updates.email) && { email: updates.email.trim() }),
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
