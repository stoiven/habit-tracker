import { useState, useMemo, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import HabitsPanel from "@/components/HabitsPanel";
import WeeklyProgressChart from "@/components/WeeklyProgressChart";
import WeeklySuccess from "@/components/WeeklySuccess";
import DayCard from "@/components/DayCard";
import MonthViewStats from "@/components/MonthViewStats";
import MonthlyTrendsChart from "@/components/MonthlyTrendsChart";
import MonthlySuccessCard from "@/components/MonthlySuccessCard";
import WeeklyOverview from "@/components/WeeklyOverview";
import Top10ThisMonth from "@/components/Top10ThisMonth";
import MonthCalendarGrid from "@/components/MonthCalendarGrid";
import AnnualPerformance from "@/components/AnnualPerformance";
import AnnualTrends from "@/components/AnnualTrends";
import YearRetrospective from "@/components/YearRetrospective";
import YourStoryThisYear from "@/components/YourStoryThisYear";
import MonthlyBreakdown from "@/components/MonthlyBreakdown";
import { defaultHabits, generateWeekData, formatDateRange, dateToStorageKey, normalizeDayHabitKey, Habit } from "@/lib/habitData";
import { isSignedIn, clearUser, getDisplayName, getUser } from "@/lib/auth";
import {
  getStoredHabits,
  setStoredHabits,
  getStoredDayHabits,
  setStoredDayHabits,
  getStoredMonthCompletion,
  setStoredMonthCompletion,
  getStoredDistractions,
  setStoredDistractions,
  getStoredTasks,
  setStoredTasks,
  type Distraction,
  type Task,
} from "@/lib/storage";
import ManageHabitsDialog from "@/components/ManageHabitsDialog";
import StreakMasterDialog from "@/components/StreakMasterDialog";
import GoogleCalendarCard from "@/components/GoogleCalendarCard";
import TaskListCard from "@/components/TaskListCard";
import { fetchSyncDataWithStatus, pushSyncData, isSyncConfigured, type SyncPayload } from "@/lib/sync";
import { toast } from "sonner";

type ViewType = "week" | "month" | "dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("week");
  const [habits, setHabits] = useState<Habit[]>(() => getStoredHabits() ?? defaultHabits);
  const [manageHabitsOpen, setManageHabitsOpen] = useState(false);
  const [streakDialogOpen, setStreakDialogOpen] = useState(false);
  const [currentYear] = useState(() => new Date().getFullYear());
  const [monthOffset, setMonthOffset] = useState(0);
  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    if (view === "month") setMonthOffset(0);
  }, []);

  // Require sign-in to view dashboard; re-check so we always enforce
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const ok = typeof window !== "undefined" && isSignedIn();
    setAllowed(ok);
    if (!ok) navigate("/", { replace: true });
  }, [navigate]);

  // Week view data: start from current week (Sunday on the left), then add weekOffset for prev/next
  const [weekOffset, setWeekOffset] = useState(0);
  const startOfWeek = useMemo(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    const result = new Date(sunday);
    result.setDate(sunday.getDate() + weekOffset * 7);
    return result;
  }, [weekOffset]);

  const weekData = useMemo(() => generateWeekData(startOfWeek, habits), [startOfWeek, habits]);
  // Initialize from localStorage; use YYYY-MM-DD keys so save/restore always match
  const [dayHabits, setDayHabits] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    weekData.days.forEach(day => {
      initial[dateToStorageKey(day.date)] = [];
    });
    const stored = getStoredDayHabits();
    if (stored && typeof stored === "object") {
      for (const k of Object.keys(stored)) {
        if (Array.isArray(stored[k])) initial[normalizeDayHabitKey(k)] = stored[k];
      }
    }
    return initial;
  });

  const toggleHabit = (dayDate: Date, habitId: string) => {
    lastLocalCheckChangeRef.current = Date.now();
    const key = dateToStorageKey(dayDate);
    setDayHabits(prev => {
      const current = prev[key] || [];
      const isCompleted = current.includes(habitId);
      const next = {
        ...prev,
        [key]: isCompleted
          ? current.filter(id => id !== habitId)
          : [...current, habitId],
      };
      setStoredDayHabits(next);
      return next;
    });
  };

  // Stats for the currently displayed week only (so DONE / RATE match the 7 day cards)
  const totalCompleted = weekData.days.reduce((sum, day) => sum + (dayHabits[dateToStorageKey(day.date)] || []).length, 0);
  const totalPossible = 7 * habits.filter(h => h.isActive).length;
  const weeklyRate = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  const chartData = weekData.days.map(day => ({
    day: day.dayName.slice(0, 3),
    value: (dayHabits[dateToStorageKey(day.date)] || []).length,
  }));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const displayMonth = useMemo(() => {
    const now = new Date();
    return (now.getMonth() + monthOffset + 12) % 12;
  }, [monthOffset]);
  const displayYear = useMemo(() => {
    const now = new Date();
    return now.getFullYear() + Math.floor((now.getMonth() + monthOffset) / 12);
  }, [monthOffset]);
  const yearTotalPossible = 365 * habits.filter((h) => h.isActive).length;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDateLabel = () => {
    if (activeView === "dashboard") return `${currentYear} DASHBOARD`;
    if (activeView === "month") return `${monthNames[displayMonth].toUpperCase()} ${displayYear}`;
    return formatDateRange(weekData.startDate, weekData.endDate);
  };

  // Month view: daily completion — init from localStorage so it survives refresh
  const [monthCompletionByDay, setMonthCompletionByDay] = useState<Record<string, string[]>>(() => {
    const out: Record<string, string[]> = {};
    const yr = 2026;
    const mo = 0;
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      out[key] = [];
    }
    const stored = getStoredMonthCompletion();
    if (stored && typeof stored === "object") {
      for (const k of Object.keys(stored)) {
        if (Array.isArray(stored[k])) out[k] = stored[k];
      }
    }
    return out;
  });

  // Re-apply localStorage once after mount (catches any env where initializer read was empty)
  useLayoutEffect(() => {
    const storedDay = getStoredDayHabits();
    if (storedDay && typeof storedDay === "object" && Object.values(storedDay).some(arr => arr.length > 0)) {
      const normalized: Record<string, string[]> = {};
      for (const k of Object.keys(storedDay)) {
        if (Array.isArray(storedDay[k])) normalized[normalizeDayHabitKey(k)] = storedDay[k];
      }
      setDayHabits(prev => ({ ...prev, ...normalized }));
    }
    const storedMonth = getStoredMonthCompletion();
    if (storedMonth && typeof storedMonth === "object" && Object.values(storedMonth).some(arr => arr.length > 0)) {
      setMonthCompletionByDay(prev => ({ ...prev, ...storedMonth }));
    }
  }, []);

  // Persist data to localStorage so it survives refresh and sessions
  useEffect(() => {
    setStoredHabits(habits);
  }, [habits]);
  useEffect(() => {
    const stored = getStoredDayHabits();
    const storedHasData = stored && Object.values(stored).some((arr) => arr.length > 0);
    const currentHasData = dayHabits && Object.values(dayHabits).some((arr) => arr.length > 0);
    if (!currentHasData && storedHasData) return;
    setStoredDayHabits(dayHabits);
  }, [dayHabits]);
  useEffect(() => {
    const stored = getStoredMonthCompletion();
    const storedHasData = stored && Object.values(stored).some((arr) => arr.length > 0);
    const currentHasData = monthCompletionByDay && Object.values(monthCompletionByDay).some((arr) => arr.length > 0);
    if (!currentHasData && storedHasData) return;
    setStoredMonthCompletion(monthCompletionByDay);
  }, [monthCompletionByDay]);

  // Distractions (dashboard sidebar)
  const [distractions, setDistractions] = useState<Distraction[]>(() => getStoredDistractions() ?? []);
  useEffect(() => {
    setStoredDistractions(distractions);
  }, [distractions]);
  const addDistraction = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDistractions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, createdAt: new Date().toISOString() },
    ]);
  };
  const removeDistraction = (id: string) => {
    setDistractions((prev) => prev.filter((d) => d.id !== id));
  };

  // Tasks (My Week bottom-right). Persist in localStorage.
  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks() ?? []);
  useEffect(() => {
    setStoredTasks(tasks);
  }, [tasks]);
  const addTask = (label: string) => {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, completed: false, createdAt: new Date().toISOString() },
    ]);
  };
  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Refs so sync can merge cloud into current local state
  const dayHabitsRef = useRef<Record<string, string[]>>(dayHabits);
  const monthCompletionByDayRef = useRef<Record<string, string[]>>(monthCompletionByDay);
  const isInitialSyncDoneRef = useRef(false);
  const lastLocalCheckChangeRef = useRef(0);
  const lastPushAtRef = useRef(0);
  const lastApplyAtRef = useRef(0);
  const mountTimeRef = useRef(0);
  if (mountTimeRef.current === 0) mountTimeRef.current = Date.now();
  dayHabitsRef.current = dayHabits;
  monthCompletionByDayRef.current = monthCompletionByDay;

  const applySyncPayload = useCallback((data: SyncPayload, _isFromVisibilityChange: boolean, fetchStartedAt?: number) => {
    if (!data) return;
    const isFirstApply = !isInitialSyncDoneRef.current;
    if (isFirstApply) isInitialSyncDoneRef.current = true;

    // Always apply habits, tasks, distractions so cross-device works on first load
    if (Array.isArray(data.habits) && data.habits.length > 0) {
      setHabits(data.habits as Habit[]);
      setStoredHabits(data.habits as Habit[]);
    }
    if (Array.isArray(data.tasks)) {
      setTasks(data.tasks as Task[]);
      setStoredTasks(data.tasks as Task[]);
    }
    if (Array.isArray(data.distractions)) {
      setDistractions(data.distractions as Distraction[]);
      setStoredDistractions(data.distractions as Distraction[]);
    }

    const now = Date.now();
    const justToggledHere = now - lastLocalCheckChangeRef.current < 10000;
    const pushIsNewerThanFetch = typeof fetchStartedAt === "number" && lastPushAtRef.current > fetchStartedAt;
    const skipCheckmarks =
      !isFirstApply && (justToggledHere || pushIsNewerThanFetch);

    if (!skipCheckmarks && data.dayHabits && typeof data.dayHabits === "object") {
      lastApplyAtRef.current = Date.now();
      const merged: Record<string, string[]> = {};
      for (const k of Object.keys(data.dayHabits)) {
        if (Array.isArray(data.dayHabits[k])) merged[normalizeDayHabitKey(k)] = data.dayHabits[k];
      }
      setDayHabits(merged);
      setStoredDayHabits(merged);
    }
    if (!skipCheckmarks && data.monthCompletionByDay && typeof data.monthCompletionByDay === "object") {
      lastApplyAtRef.current = Date.now();
      setMonthCompletionByDay({ ...data.monthCompletionByDay });
      setStoredMonthCompletion(data.monthCompletionByDay);
    }
  }, []);

  const runSyncFetch = useCallback((isFromVisibilityChange = false) => {
    if (!allowed) return;
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@") || !isSyncConfigured()) return;
    const fetchStartedAt = Date.now();
    fetchSyncDataWithStatus(email).then((result) => {
      if (result.ok && result.data) {
        applySyncPayload(result.data, isFromVisibilityChange, fetchStartedAt);
      } else if (!result.ok) {
        const status = "status" in result ? result.status : undefined;
        if (status === 401) {
          toast.error("Sync failed: check SYNC_SECRET and VITE_SYNC_SECRET match and are set in Vercel.");
        } else if (status != null && status >= 500) {
          toast.error("Sync server error. Check Vercel Blob is connected.");
        } else if (status === 404) {
          toast.error("Sync API not found. Use the deployed app URL (not localhost) for cross-device sync.");
        } else {
          toast.error("Sync fetch failed. Check Network tab for /api/data.");
        }
      }
    });
  }, [allowed, applySyncPayload]);

  // Tell user once per session if sync is off (so they know why cross-device doesn't work)
  const hasShownSyncOffRef = useRef(false);
  useEffect(() => {
    if (!allowed || hasShownSyncOffRef.current) return;
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@")) return;
    if (isSyncConfigured()) return;
    hasShownSyncOffRef.current = true;
    toast.info(
      "Cross-device sync is off. Add VITE_SYNC_SECRET in Vercel (same value as SYNC_SECRET) and redeploy.",
      { duration: 8000 }
    );
  }, [allowed]);

  // Manual "Sync now": push then fetch so user can force cross-device sync
  const handleSyncNow = useCallback(() => {
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@") || !isSyncConfigured()) {
      toast.error("Sign in with an email and set VITE_SYNC_SECRET in Vercel to sync.");
      return;
    }
    toast.info("Syncing…", { duration: 1000 });
    pushSyncData(email, {
      habits,
      dayHabits,
      monthCompletionByDay,
      tasks,
      distractions,
    }).then((pushResult) => {
      if (!pushResult.ok) {
        const status = "status" in pushResult ? pushResult.status : undefined;
        if (status === 401) toast.error("Sync save failed: secrets must match in Vercel.");
        else if (status === 404) toast.error("Sync API not found. Use the deployed URL (not localhost).");
        else if (status != null && status >= 500) toast.error("Sync save failed. Check Vercel Blob.");
        else toast.error("Sync save failed.");
        return;
      }
      lastPushAtRef.current = Date.now();
      fetchSyncDataWithStatus(email).then((fetchResult) => {
        if (fetchResult.ok && fetchResult.data) {
          applySyncPayload(fetchResult.data, true);
          toast.success("Synced: saved and loaded from cloud.", { duration: 3000 });
        } else if (!fetchResult.ok) {
          toast.success("Saved to cloud. Load failed on this device.", { duration: 3000 });
        }
      });
    });
  }, [habits, dayHabits, monthCompletionByDay, tasks, distractions, applySyncPayload]);

  // Cross-device sync: fetch on load
  useEffect(() => {
    runSyncFetch(false);
  }, [runSyncFetch]);

  // Refetch when tab becomes visible or window gains focus (e.g. tap back into app on mobile) so you see updates without refresh
  useEffect(() => {
    if (!allowed || !isSyncConfigured()) return;
    const fetchIfVisible = () => {
      if (document.visibilityState === "visible") runSyncFetch(true);
    };
    document.addEventListener("visibilitychange", fetchIfVisible);
    window.addEventListener("focus", fetchIfVisible);
    return () => {
      document.removeEventListener("visibilitychange", fetchIfVisible);
      window.removeEventListener("focus", fetchIfVisible);
    };
  }, [allowed, runSyncFetch]);

  // Cross-device sync: push to API when data changes (debounced so cloud updates quickly after toggle)
  const PUSH_DEBOUNCE_MS = 400;
  const PUSH_AFTER_MOUNT_MS = 4000;
  const PUSH_AFTER_APPLY_MS = 6000;
  useEffect(() => {
    if (!allowed) return;
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@") || !isSyncConfigured()) return;
    const t = setTimeout(() => {
      const now = Date.now();
      if (now - mountTimeRef.current < PUSH_AFTER_MOUNT_MS) return;
      if (now - lastApplyAtRef.current < PUSH_AFTER_APPLY_MS && lastLocalCheckChangeRef.current < lastApplyAtRef.current) return;
      pushSyncData(email, {
        habits,
        dayHabits,
        monthCompletionByDay,
        tasks,
        distractions,
      }).then((result) => {
        if (result.ok) {
          lastPushAtRef.current = Date.now();
        } else {
          const status = "status" in result ? result.status : undefined;
          if (status === 401) {
            toast.error("Sync save failed: SYNC_SECRET and VITE_SYNC_SECRET must match in Vercel.");
          } else if (status != null && status >= 500) {
            toast.error("Sync save failed. Check Vercel Blob is connected.");
          } else if (status === 404) {
            toast.error("Sync API not found. Use the deployed app URL (not localhost) for cross-device sync.");
          } else {
            toast.error("Sync save failed. Check Network tab for /api/data.");
          }
        }
      });
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [allowed, habits, dayHabits, monthCompletionByDay, tasks, distractions]);

  // Poll every 3s so the other device sees check/uncheck without refreshing
  const SYNC_POLL_INTERVAL_MS = 3_000;
  useEffect(() => {
    if (!allowed || !isSyncConfigured()) return;
    const id = setInterval(() => runSyncFetch(true), SYNC_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [allowed, runSyncFetch]);

  // Refetch 1.5s after load so the other device sees latest soon after opening the app
  useEffect(() => {
    if (!allowed || !isSyncConfigured()) return;
    const t = setTimeout(() => runSyncFetch(true), 1_500);
    return () => clearTimeout(t);
  }, [allowed, runSyncFetch]);

  const monthlyTrendData = useMemo(() => {
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const key = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const completed = (monthCompletionByDay[key] || []).length;
      const total = habits.filter((h) => h.isActive).length;
      const value = total ? Math.round((completed / total) * 100) : 0;
      return { day: d, value };
    });
  }, [displayYear, displayMonth, monthCompletionByDay, habits]);

  const monthTotalPossible = useMemo(() => {
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    return daysInMonth * habits.filter((h) => h.isActive).length;
  }, [displayYear, displayMonth, habits]);
  const monthCompleted = useMemo(
    () => Object.values(monthCompletionByDay).reduce((s, arr) => s + arr.length, 0),
    [monthCompletionByDay]
  );
  const monthRate = monthTotalPossible ? Math.round((monthCompleted / monthTotalPossible) * 100) : 0;

  const weeklyOverviewData = useMemo(() => {
    const weeks: { label: string; range: string; successRate: number; completed: number; total: number; dailyValues: number[] }[] = [];
    const first = new Date(displayYear, displayMonth, 1);
    const last = new Date(displayYear, displayMonth + 1, 0);
    const totalPerDay = habits.filter((h) => h.isActive).length;
    let w = 1;
    let d = 1;
    while (d <= last.getDate()) {
      const start = d;
      let end = d;
      const dailyValues: number[] = [];
      for (let i = 0; i < 7 && d <= last.getDate(); i++, d++) {
        const key = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const n = (monthCompletionByDay[key] || []).length;
        dailyValues.push(totalPerDay ? Math.round((n / totalPerDay) * 100) : 0);
      }
      end = d - 1;
      const weekDays = end - start + 1;
      const completed = Array.from({ length: weekDays }, (_, i) => {
        const key = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(start + i).padStart(2, "0")}`;
        return (monthCompletionByDay[key] || []).length;
      }).reduce((a, b) => a + b, 0);
      const total = weekDays * totalPerDay;
      weeks.push({
        label: `W${w}`,
        range: `${monthNames[displayMonth].slice(0, 3).toUpperCase()} ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")}`,
        successRate: total ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
        dailyValues: dailyValues.length ? dailyValues : [0, 0, 0, 0, 0, 0, 0],
      });
      w++;
    }
    return weeks;
  }, [displayYear, displayMonth, monthCompletionByDay, habits]);

  const toggleMonthHabit = (date: Date, habitId: string) => {
    lastLocalCheckChangeRef.current = Date.now();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setMonthCompletionByDay((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(habitId) ? cur.filter((id) => id !== habitId) : [...cur, habitId];
      return { ...prev, [key]: next };
    });
  };

  const top10Habits = useMemo(() => {
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    return habits
      .map((habit) => {
        let daysCompleted = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const key = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          if ((monthCompletionByDay[key] || []).includes(habit.id)) daysCompleted++;
        }
        return { habit, daysCompleted };
      })
      .filter((x) => x.daysCompleted > 0)
      .sort((a, b) => b.daysCompleted - a.daysCompleted);
  }, [habits, displayYear, displayMonth, monthCompletionByDay]);

  if (!allowed) return null;

  if (activeView === "month") {
    return (
      <div className="dark min-h-screen bg-background p-3 sm:p-4 lg:p-6">
        <StreakMasterDialog
          open={streakDialogOpen}
          onOpenChange={setStreakDialogOpen}
          currentStreakDays={0}
          bestEverStreak={0}
          habits={habits}
        />
        <ManageHabitsDialog
          open={manageHabitsOpen}
          onOpenChange={setManageHabitsOpen}
          habits={habits}
          onHabitsChange={setHabits}
        />
        <div className="max-w-[1800px] mx-auto space-y-4">
          <DashboardHeader
            dateLabel={getDateLabel()}
            activeView="month"
            onViewChange={handleViewChange}
            onPrev={() => setMonthOffset((m) => m - 1)}
            onNext={() => setMonthOffset((m) => m + 1)}
            signedIn={true}
            userDisplayName={getDisplayName()}
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
            onProfile={() => navigate("/profile")}
            onSyncNow={handleSyncNow}
            syncEnabled={isSyncConfigured()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <MonthViewStats
                doneCount={monthCompleted}
                rate={monthRate}
                habits={habits}
                currentStreakDays={0}
                onManageHabits={() => setManageHabitsOpen(true)}
                onStreakClick={() => setStreakDialogOpen(true)}
              />
            </div>
            <div className="lg:col-span-6">
              <MonthlyTrendsChart data={monthlyTrendData} vsLastMonth={monthRate} />
            </div>
            <div className="lg:col-span-3">
              <MonthlySuccessCard
                completed={monthCompleted}
                total={monthTotalPossible}
                percentage={monthRate}
                story={monthRate > 0 ? `You completed ${monthCompleted} habit checks this month. Keep it up!` : "Complete habits to see your story here."}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <WeeklyOverview weeks={weeklyOverviewData} />
            </div>
            <div className="lg:col-span-4">
              <Top10ThisMonth
                habits={top10Habits.length ? top10Habits : habits.map((h) => ({ habit: h, daysCompleted: 0 }))}
              />
            </div>
          </div>

          <div className="w-full min-w-0">
            <MonthCalendarGrid
              year={displayYear}
              month={displayMonth}
              monthName={monthNames[displayMonth]}
              habits={[{ id: "mood", name: "Mood", isActive: true }, ...habits]}
              completionByDay={monthCompletionByDay}
              onToggle={toggleMonthHabit}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "dashboard") {
    return (
      <div className="dark min-h-screen bg-background p-3 sm:p-4 lg:p-6">
        <StreakMasterDialog
          open={streakDialogOpen}
          onOpenChange={setStreakDialogOpen}
          currentStreakDays={0}
          bestEverStreak={0}
          habits={habits}
        />
        <div className="max-w-[1800px] mx-auto space-y-4">
          <DashboardHeader
            dateLabel={`${currentYear} DASHBOARD`}
            activeView="dashboard"
            onViewChange={handleViewChange}
            onPrev={() => {}}
            onNext={() => {}}
            signedIn={true}
            userDisplayName={getDisplayName()}
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
            onProfile={() => navigate("/profile")}
            onSyncNow={handleSyncNow}
            syncEnabled={isSyncConfigured()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <aside className="lg:col-span-3">
              <DashboardSidebar
                habits={habits}
                currentStreakDays={0}
                onManageHabits={() => setManageHabitsOpen(true)}
                onStreakClick={() => setStreakDialogOpen(true)}
                distractions={distractions}
                onAddDistraction={addDistraction}
                onRemoveDistraction={removeDistraction}
              />
            </aside>

            <main className="lg:col-span-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <AnnualTrends />
                </div>
                <div>
                  <AnnualPerformance percentage={0} completed={0} total={yearTotalPossible} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <YearRetrospective year={currentYear} donePct={0} />
                <YourStoryThisYear />
              </div>

              <MonthlyBreakdown year={currentYear} />
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <ManageHabitsDialog
        open={manageHabitsOpen}
        onOpenChange={setManageHabitsOpen}
        habits={habits}
        onHabitsChange={setHabits}
      />
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-3 space-y-4">
            <DashboardHeader
              dateLabel={getDateLabel()}
              activeView={activeView}
              onViewChange={handleViewChange}
              onPrev={() => setWeekOffset(prev => prev - 1)}
              onNext={() => setWeekOffset(prev => prev + 1)}
              onJumpToThisWeek={() => setWeekOffset(0)}
              showJumpToThisWeek={weekOffset !== 0}
              signedIn={true}
              userDisplayName={getDisplayName()}
              onSignIn={() => navigate("/")}
              onSignOut={() => { clearUser(); navigate("/"); }}
              onProfile={() => navigate("/profile")}
              onSyncNow={handleSyncNow}
              syncEnabled={isSyncConfigured()}
            />
            <HabitsPanel habits={habits} doneCount={totalCompleted} rate={weeklyRate} onManageHabits={() => setManageHabitsOpen(true)} />
          </div>
          <div className="lg:col-span-6">
            <WeeklyProgressChart data={chartData} />
          </div>
          <div className="lg:col-span-3">
            <WeeklySuccess
              percentage={weeklyRate}
              completed={totalCompleted}
              total={totalPossible}
              vsPrev={0}
              bestPercentage={weeklyRate}
              bestDateRange={formatDateRange(weekData.startDate, weekData.endDate)}
            />
          </div>
        </div>

        <div className="w-full pb-4 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-3 px-3 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:min-w-0">
            {weekData.days.map((day, index) => (
              <div key={index} className="flex-shrink-0 w-[280px] lg:w-auto lg:min-w-0">
                <DayCard
                  dayName={day.dayName}
                  date={day.date}
                  habits={habits}
                  completedHabits={dayHabits[dateToStorageKey(day.date)] || []}
                  onToggleHabit={(habitId) => toggleHabit(day.date, habitId)}
                  fillWidth
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <GoogleCalendarCard
            weekStart={weekData.startDate}
            weekEnd={weekData.endDate}
          />
          <TaskListCard
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onRemoveTask={removeTask}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
