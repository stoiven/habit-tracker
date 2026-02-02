import { useState, useMemo, useEffect } from "react";
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
import { isSignedIn, clearUser } from "@/lib/auth";
import {
  getStoredHabits,
  setStoredHabits,
  getStoredDayHabits,
  setStoredDayHabits,
  getStoredMonthCompletion,
  setStoredMonthCompletion,
} from "@/lib/storage";
import ManageHabitsDialog from "@/components/ManageHabitsDialog";
import StreakMasterDialog from "@/components/StreakMasterDialog";

type ViewType = "week" | "month" | "dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [habits, setHabits] = useState<Habit[]>(() => getStoredHabits() ?? defaultHabits);
  const [manageHabitsOpen, setManageHabitsOpen] = useState(false);
  const [streakDialogOpen, setStreakDialogOpen] = useState(false);
  const [currentYear] = useState(2026);
  const [monthOffset, setMonthOffset] = useState(0);

  // Require sign-in to view dashboard (check once so we don’t flash content)
  const allowed = useState(() => typeof window !== "undefined" && isSignedIn())[0];
  useEffect(() => {
    if (!allowed) navigate("/", { replace: true });
  }, [allowed, navigate]);

  // Week view data
  const [weekOffset, setWeekOffset] = useState(0);
  const startOfWeek = useMemo(() => {
    const now = new Date(2026, 0, 5); // Jan 5, 2026 - Monday
    now.setDate(now.getDate() + weekOffset * 7);
    return now;
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
      <div className="dark min-h-screen bg-background p-4 lg:p-6">
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
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
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
      <div className="dark min-h-screen bg-background p-4 lg:p-6">
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
            onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <aside className="lg:col-span-3">
              <DashboardSidebar habits={habits} currentStreakDays={0} onManageHabits={() => setManageHabitsOpen(true)} onStreakClick={() => setStreakDialogOpen(true)} />
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
    <div className="dark min-h-screen bg-background p-4 lg:p-6">
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
              onSignIn={() => navigate("/")}
            onSignOut={() => { clearUser(); navigate("/"); }}
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

        <div className="w-full pb-4">
          <div className="grid grid-cols-7 gap-4 w-full min-w-0">
            {weekData.days.map((day, index) => (
              <DayCard
                key={index}
                dayName={day.dayName}
                date={day.date}
                habits={habits}
                completedHabits={dayHabits[day.date.toISOString()] || []}
                onToggleHabit={(habitId) => toggleHabit(day.date, habitId)}
                fillWidth
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
