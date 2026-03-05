import { useState, useCallback, useEffect } from "react";
import { Calendar, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getCalendarClientId,
  getStoredCalendarToken,
  setStoredCalendarToken,
  requestCalendarToken,
  requestCalendarTokenSilent,
  fetchCalendarEvents,
  CalendarSessionExpiredError,
  type CalendarEvent,
} from "@/lib/googleCalendar";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";

interface GoogleCalendarCardProps {
  weekStart: Date;
  weekEnd: Date;
}

const GoogleCalendarCard = ({ weekStart, weekEnd }: GoogleCalendarCardProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const loadEvents = useCallback((accessToken: string) => {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);
    setLoading(true);
    fetchCalendarEvents(accessToken, dayStart, dayEnd)
      .then((list) => {
        setEvents(list);
        setConnected(true);
      })
      .catch((err) => {
        if (err instanceof CalendarSessionExpiredError) {
          // Try to get a new token silently (no consent UI); extends session while user stays signed in to Google
          requestCalendarTokenSilent(
            (newToken) => {
              setStoredCalendarToken(newToken);
              loadEvents(newToken);
            },
            () => {
              setConnected(false);
              setLoading(false);
              toast.info("Calendar session expired. Connect again to refresh.");
            }
          );
        } else {
          toast.error(err instanceof Error ? err.message : "Failed to load calendar events.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Restore session from stored token (local and deployed)
  useEffect(() => {
    const token = getStoredCalendarToken();
    if (token) {
      setConnected(true);
      loadEvents(token);
    }
  }, [loadEvents]);

  const handleConnect = () => {
    const clientId = getCalendarClientId();
    if (!clientId) {
      toast.error(
        "Google Calendar is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file. See README for setup."
      );
      return;
    }
    setLoading(true);
    requestCalendarToken(
      (token) => {
        setStoredCalendarToken(token);
        loadEvents(token);
      },
      (message) => {
        toast.error(message);
        setLoading(false);
      }
    );
  };

  const handleRefresh = () => {
    const token = getStoredCalendarToken();
    if (token) {
      loadEvents(token);
    } else {
      toast.info("Connect Google Calendar to load events.");
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return "All day";
    try {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
    } catch {
      return "";
    }
  };

  const formatEventDate = (event: CalendarEvent) => {
    try {
      const d = event.allDay ? parseISO(event.start) : parseISO(event.start);
      return format(d, "EEE, MMM d");
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Calendar className="w-5 h-5 text-foreground" />
        </div>
        <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Google Calendar
        </h3>
      </div>

      {!connected ? (
        <>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Connect your Google Calendar to see today&apos;s events alongside your habits.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleConnect}
            disabled={loading}
            className="w-full border-border text-foreground hover:bg-muted"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect Google Calendar"
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Events for today
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <ul className="space-y-2 flex-1 overflow-y-auto max-h-64">
            {events.length === 0 ? (
              <li className="text-sm text-muted-foreground py-4 text-center">
                No events today.
              </li>
            ) : (
              events.map((event) => (
                <li
                  key={event.id}
                  className="text-sm rounded-md py-2 px-3 bg-muted/50 border border-border/50"
                >
                  <div className="font-medium text-foreground truncate" title={event.summary}>
                    {event.summary}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {formatEventDate(event)} · {formatEventTime(event)}
                  </div>
                  {event.htmlLink && (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Open in Calendar
                    </a>
                  )}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default GoogleCalendarCard;
