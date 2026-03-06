/**
 * Google Calendar API (read-only) via Google Identity Services token.
 * Requires VITE_GOOGLE_CLIENT_ID and GSI script in index.html.
 *
 * Token duration: Google sets access token lifetime (~1 hour); we cannot change it.
 * We persist the token and use silent refresh (prompt: 'none') when it expires so the
 * session can last as long as the user stays signed in to Google in this browser.
 */

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const STORAGE_KEY = "habicard_google_calendar_access_token";

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

export function getStoredCalendarToken(): string | null {
  return safeGetStorage(STORAGE_KEY);
}

export function setStoredCalendarToken(token: string): void {
  safeSetStorage(STORAGE_KEY, token);
}

export function clearStoredCalendarToken(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/** Thrown when the stored token is expired or invalid (401). */
export class CalendarSessionExpiredError extends Error {
  constructor() {
    super("Calendar session expired");
    this.name = "CalendarSessionExpiredError";
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
        };
      };
    };
  }
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}

interface CalendarEventsResponse {
  items?: Array<{
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    htmlLink?: string;
  }>;
}

function toISO(date: Date): string {
  return date.toISOString();
}

export function getCalendarClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * Request OAuth token (opens Google consent if needed). Calls onToken with the access token.
 */
export function requestCalendarToken(
  onToken: (accessToken: string) => void,
  onError: (message: string) => void
): void {
  const clientId = getCalendarClientId();
  if (!clientId) {
    onError("Google Calendar is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.");
    return;
  }
  if (!window.google?.accounts?.oauth2) {
    onError("Google sign-in script is still loading. Please try again in a moment.");
    return;
  }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CALENDAR_SCOPE,
    callback: (response) => {
      if (response.error) {
        onError(response.error === "access_denied" ? "Calendar access was denied." : response.error);
        return;
      }
      if (response.access_token) {
        onToken(response.access_token);
      } else {
        onError("No access token received.");
      }
    },
  });
  // Don't use prompt: "consent" — that forces the consent screen every time.
  // Omitting prompt lets Google reuse existing authorization when the app already has access.
  client.requestAccessToken();
}

/**
 * Try to get a new access token without showing the consent UI (silent refresh).
 * Works when the user is still signed in to Google. Use after 401 to extend session.
 */
export function requestCalendarTokenSilent(
  onToken: (accessToken: string) => void,
  onError: () => void
): void {
  const clientId = getCalendarClientId();
  if (!clientId || !window.google?.accounts?.oauth2) {
    onError();
    return;
  }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CALENDAR_SCOPE,
    callback: (response) => {
      if (response.access_token) {
        onToken(response.access_token);
      } else {
        onError();
      }
    },
  });
  client.requestAccessToken({ prompt: "none" });
}

/**
 * Fetch events from the user's primary calendar for the given time range.
 * timeMax is exclusive in the API; we use the start of the next day so it works for both week and single-day ranges.
 */
export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const exclusiveEnd = new Date(timeMax);
  exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
  exclusiveEnd.setHours(0, 0, 0, 0);
  const params = new URLSearchParams({
    timeMin: toISO(timeMin),
    timeMax: toISO(exclusiveEnd),
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (res.status === 401) {
    clearStoredCalendarToken();
    throw new CalendarSessionExpiredError();
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar API error: ${res.status}`);
  }
  const data: CalendarEventsResponse = await res.json();
  const items = data.items || [];
  return items.map((item) => {
    const start = item.start?.dateTime ?? item.start?.date ?? "";
    const end = item.end?.dateTime ?? item.end?.date ?? "";
    return {
      id: item.id,
      summary: item.summary ?? "(No title)",
      start,
      end,
      allDay: !item.start?.dateTime,
      htmlLink: item.htmlLink,
    };
  });
}
