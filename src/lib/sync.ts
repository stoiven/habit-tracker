/**
 * Cross-device sync: fetch and push app data to the Vercel API (stored in Vercel Blob).
 * Requires VITE_SYNC_SECRET and SYNC_SECRET to match on the server.
 */

export interface SyncPayload {
  habits: unknown;
  dayHabits: Record<string, string[]>;
  monthCompletionByDay: Record<string, string[]>;
  tasks: unknown[];
  distractions: unknown[];
}

function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (typeof base === "string" && base.length > 0) return base.replace(/\/$/, "");
  if (typeof window !== "undefined") return "";
  return "";
}

function getSyncSecret(): string | null {
  const s = import.meta.env.VITE_SYNC_SECRET;
  return typeof s === "string" && s.length > 0 ? s : null;
}

export async function fetchSyncData(userEmail: string): Promise<SyncPayload | null> {
  const secret = getSyncSecret();
  if (!secret) return null;
  const base = getApiBase();
  const url = `${base}/api/data?user=${encodeURIComponent(userEmail)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data == null) return null;
  if (
    typeof data !== "object" ||
    !("habits" in data) ||
    !("dayHabits" in data) ||
    !("monthCompletionByDay" in data) ||
    !("tasks" in data) ||
    !("distractions" in data)
  ) {
    return null;
  }
  return data as SyncPayload;
}

export async function pushSyncData(userEmail: string, payload: SyncPayload): Promise<boolean> {
  const secret = getSyncSecret();
  if (!secret) return false;
  const base = getApiBase();
  const res = await fetch(`${base}/api/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ user: userEmail, data: payload }),
  });
  return res.ok;
}

export function isSyncConfigured(): boolean {
  return getSyncSecret() !== null;
}
