import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { defaultHabits, generateWeekData, formatDateRange, Habit } from "@/lib/habitData";
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
  const [currentYear] = useState(2026);
  const [monthOffset, setMonthOffset] = useState(0);

  // Require sign-in to view dashboard; re-check so we always enforce
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const ok = typeof window !== "undefined" && isSignedIn();
    setAllowed(ok);
    if (!ok) navigate("/", { replace: true });
  }, [navigate]);

  // Week view data: start from current week (Monday of this week), then add weekOffset for prev/next
  const [weekOffset, setWeekOffset] = useState(0);
  const startOfWeek = useMemo(() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0, Sun=6
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    const result = new Date(monday);
    result.setDate(monday.getDate() + weekOffset * 7);
    return result;
  }, [weekOffset]);

  const weekData = useMemo(() => generateWeekData(startOfWeek, habits), [startOfWeek, habits]);
  const [dayHabits, setDayHabits] = useState<Record<string, string[]>>(() => {
    const stored = getStoredDayHabits();
    if (stored != null && Object.keys(stored).length > 0) return stored;
    const initial: Record<string, string[]> = {};
    weekData.days.forEach(day => {
      initial[day.date.toISOString()] = day.completedHabits;
    });
    return initial;
  });

  const toggleHabit = (dayDate: Date, habitId: string) => {
    const key = dayDate.toISOString();
    setDayHabits(prev => {
      const current = prev[key] || [];
      const isCompleted = current.includes(habitId);
      return {
        ...prev,
        [key]: isCompleted 
          ? current.filter(id => id !== habitId)
          : [...current, habitId]
      };
    });
  };

  // Calculate stats
  const totalCompleted = Object.values(dayHabits).reduce((sum, arr) => sum + arr.length, 0);
  const totalPossible = 7 * habits.filter(h => h.isActive).length;
  const weeklyRate = Math.round((totalCompleted / totalPossible) * 100);

  const chartData = weekData.days.map(day => ({
    day: day.dayName.slice(0, 3),
    value: (dayHabits[day.date.toISOString()] || []).length,
  }));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const displayMonth = (0 + monthOffset + 12) % 12;
  const displayYear = currentYear + Math.floor((0 + monthOffset) / 12);
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

  // Month view: daily completion data (state so we can toggle). Load from storage or start empty.
  const [monthCompletionByDay, setMonthCompletionByDay] = useState<Record<string, string[]>>(() => {
    const stored = getStoredMonthCompletion();
    if (stored != null && Object.keys(stored).length > 0) return stored;
    const out: Record<string, string[]> = {};
    const yr = 2026;
    const mo = 0;
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      out[key] = [];
    }
    return out;
  });

  // Persist data to localStorage so it survives refresh and sessions
  useEffect(() => {
    setStoredHabits(habits);
  }, [habits]);
  useEffect(() => {
    setStoredDayHabits(dayHabits);
  }, [dayHabits]);
  useEffect(() => {
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

  // Refs so sync can merge cloud into current local state without wiping local keys
  const dayHabitsRef = useRef<Record<string, string[]>>(dayHabits);
  const monthCompletionByDayRef = useRef<Record<string, string[]>>(monthCompletionByDay);
  dayHabitsRef.current = dayHabits;
  monthCompletionByDayRef.current = monthCompletionByDay;

  const applySyncPayload = useCallback((data: SyncPayload) => {
    if (!data) return;
    if (Array.isArray(data.habits) && data.habits.length > 0) {
      setHabits(data.habits as Habit[]);
      setStoredHabits(data.habits as Habit[]);
    }
    // Merge cloud into local so we never remove keys the user has locally (stops refresh from unchecking)
    if (data.dayHabits && typeof data.dayHabits === "object") {
      const merged = { ...dayHabitsRef.current, ...data.dayHabits };
      setDayHabits(merged);
      setStoredDayHabits(merged);
    }
    if (data.monthCompletionByDay && typeof data.monthCompletionByDay === "object") {
      const merged = { ...monthCompletionByDayRef.current, ...data.monthCompletionByDay };
      setMonthCompletionByDay(merged);
      setStoredMonthCompletion(merged);
    }
    if (Array.isArray(data.tasks)) {
      setTasks(data.tasks as Task[]);
      setStoredTasks(data.tasks as Task[]);
    }
    if (Array.isArray(data.distractions)) {
      setDistractions(data.distractions as Distraction[]);
      setStoredDistractions(data.distractions as Distraction[]);
    }
  }, []);

  const runSyncFetch = useCallback(() => {
    if (!allowed) return;
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@") || !isSyncConfigured()) return;
    fetchSyncDataWithStatus(email).then((result) => {
      if (result.ok && result.data) {
        applySyncPayload(result.data);
      } else if (!result.ok && "status" in result) {
        const status = result.status;
        if (status === 401) {
          toast.error("Sync failed: check SYNC_SECRET and VITE_SYNC_SECRET match and are set in Vercel.");
        } else if (status != null && status >= 500) {
          toast.error("Sync server error. Check Vercel Blob is connected.");
        }
      }
    });
  }, [allowed, applySyncPayload]);

  // Cross-device sync: fetch from API when dashboard loads (cloud overwrites local)
  useEffect(() => {
    runSyncFetch();
  }, [runSyncFetch]);

  // Refetch when tab becomes visible so laptop gets latest after you update on another device
  useEffect(() => {
    if (!allowed || !isSyncConfigured()) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") runSyncFetch();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [allowed, runSyncFetch]);

  // Cross-device sync: push to API when data changes (debounced)
  useEffect(() => {
    if (!allowed) return;
    const user = getUser();
    const email = user?.email?.trim();
    if (!email || !email.includes("@") || !isSyncConfigured()) return;
    const t = setTimeout(() => {
      pushSyncData(email, {
        habits,
        dayHabits,
        monthCompletionByDay,
        tasks,
        distractions,
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [allowed, habits, dayHabits, monthCompletionByDay, tasks, distractions]);

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
            onViewChange={setActiveView}
            onPrev={() => setMonthOffset((m) => m - 1)}
            onNext={() => setMonthOffset((m) => m + 1)}
            signedIn={true}
            userDisplayName={getDisplayName()}
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
            onProfile={() => navigate("/profile")}
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
            onViewChange={setActiveView}
            onPrev={() => {}}
            onNext={() => {}}
            signedIn={true}
            userDisplayName={getDisplayName()}
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
            onProfile={() => navigate("/profile")}
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
              onViewChange={setActiveView}
              onPrev={() => setWeekOffset(prev => prev - 1)}
              onNext={() => setWeekOffset(prev => prev + 1)}
              signedIn={true}
              userDisplayName={getDisplayName()}
              onSignIn={() => navigate("/")}
              onSignOut={() => { clearUser(); navigate("/"); }}
              onProfile={() => navigate("/profile")}
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
                  completedHabits={dayHabits[day.date.toISOString()] || []}
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
