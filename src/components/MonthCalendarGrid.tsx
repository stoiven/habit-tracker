import { Check } from "lucide-react";
import { Habit } from "@/lib/habitData";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): { date: Date; weekIndex: number; dayInWeek: number }[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: { date: Date; weekIndex: number; dayInWeek: number }[] = [];
  let weekIndex = 0;
  let dayInWeek = first.getDay(); // 0 Sun .. 6 Sat
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), weekIndex, dayInWeek });
    dayInWeek++;
    if (dayInWeek > 6) {
      dayInWeek = 0;
      weekIndex++;
    }
  }
  return days;
}

function weekRanges(days: { date: Date; weekIndex: number }[]): { weekIndex: number; start: number; end: number }[] {
  const byWeek = new Map<number, { date: Date }[]>();
  days.forEach(({ date, weekIndex }) => {
    if (!byWeek.has(weekIndex)) byWeek.set(weekIndex, []);
    byWeek.get(weekIndex)!.push({ date });
  });
  return Array.from(byWeek.entries()).map(([weekIndex, arr]) => ({
    weekIndex,
    start: arr[0]!.date.getDate(),
    end: arr[arr.length - 1]!.date.getDate(),
  }));
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface MonthCalendarGridProps {
  year: number;
  month: number;
  monthName: string;
  habits: Habit[];
  completionByDay: Record<string, string[]>; // dateKey -> habitId[]
  onToggle?: (date: Date, habitId: string) => void;
  lightTheme?: boolean;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const MonthCalendarGrid = ({
  year,
  month,
  monthName,
  habits,
  completionByDay,
  onToggle,
  lightTheme,
}: MonthCalendarGridProps) => {
  const days = getDaysInMonth(year, month);
  const weeks = weekRanges(days);
  const today = new Date();

  // Build row for each habit: summary done/miss and success %
  const totalPossible = days.length * habits.filter((h) => h.isActive).length;
  const habitStats = habits.map((h) => {
    const done = days.filter((d) => (completionByDay[dateKey(d.date)] || []).includes(h.id)).length;
    const miss = days.length - done;
    const pct = days.length ? Math.round((done / days.length) * 100) : 0;
    return { habit: h, done, miss, pct };
  });

  return (
    <div className={`overflow-x-auto overflow-y-hidden border border-success ${lightTheme ? "bg-card rounded-xl shadow-card" : "bg-card rounded-sm shadow-card"}`}>
      <div className="flex w-full min-w-0" style={{ minWidth: "640px" }}>
        {/* Left: habit list — spacer matches table thead (3 rows) so first habit name aligns with first data row */}
        <div className="w-16 sm:w-24 lg:w-36 shrink-0 border-r border-success bg-card flex flex-col">
          <div className="p-2 sm:p-3 pb-1 sm:pb-1.5">
            <button type="button" className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider w-full text-left truncate">
              + Habits
            </button>
          </div>
          <div className="shrink-0 h-[4.5rem] sm:h-[5.25rem]" aria-hidden />
          <div className="flex-1 flex flex-col">
            {habits.map((h) => (
              <div
                key={h.id}
                className="h-6 sm:h-7 flex items-center px-2 sm:px-3 border-b border-success text-[10px] sm:text-xs text-foreground truncate"
              >
                {h.name}
              </div>
            ))}
          </div>
        </div>

        {/* Center: calendar grid with WEEK labels */}
        <div className="flex-1 min-w-[200px] overflow-x-auto bg-card">
          <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: "max-content" }}>
            <thead>
              {/* WEEK 1, WEEK 2, ... row */}
              <tr>
                {weeks.map(({ weekIndex, start, end }) => (
                  <th
                    key={weekIndex}
                    colSpan={end - start + 1}
                    className="text-[8px] sm:text-[10px] font-semibold text-foreground border-b border-r border-success px-0.5 sm:px-1 py-1 sm:py-1.5 text-left"
                  >
                    <span className="hidden sm:inline">WEEK </span>{weekIndex + 1}
                  </th>
                ))}
              </tr>
              <tr>
                {days.map((d) => (
                  <th
                    key={dateKey(d.date)}
                    className="text-[8px] sm:text-[10px] font-medium text-muted-foreground border-b border-r border-success first:border-l px-0.5 py-1 sm:py-2 w-6 min-w-6 sm:w-7 sm:min-w-7 text-center"
                  >
                    {DAY_LETTERS[d.dayInWeek]}
                  </th>
                ))}
              </tr>
              <tr>
                {days.map((d) => {
                  const isCurrentDay = isSameDay(d.date, today);
                  return (
                    <th
                      key={dateKey(d.date)}
                      className={`text-[8px] sm:text-[10px] font-medium border-b border-r border-success first:border-l px-0.5 py-0.5 sm:py-1 w-6 min-w-6 sm:w-7 sm:min-w-7 text-center ${
                        isCurrentDay
                          ? "bg-[hsl(150,60%,28%)] text-white"
                          : "text-foreground"
                      }`}
                    >
                      {d.date.getDate()}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  {days.map((d) => {
                    const key = dateKey(d.date);
                    const completed = (completionByDay[key] || []).includes(h.id);
                    return (
                      <td
                        key={key}
                        className="border-b border-r border-success first:border-l p-0.5 w-6 min-w-6 sm:w-7 sm:min-w-7 h-6 sm:h-7 align-middle"
                      >
                        <button
                          type="button"
                          onClick={() => onToggle?.(d.date, h.id)}
                          className={`w-full h-5 sm:h-6 flex items-center justify-center rounded border transition-colors ${
                            lightTheme
                              ? completed
                                ? "bg-muted/60 text-foreground border-border"
                                : "bg-muted/30 border-border hover:bg-muted/50"
                              : completed
                                ? "bg-success text-primary-foreground border-success"
                                : "bg-muted/30 border-transparent hover:bg-muted/60"
                          }`}
                        >
                          {completed ? <Check className="w-3.5 h-3.5" /> : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: monthly summary */}
        <div className="w-20 sm:w-28 lg:w-40 shrink-0 border-l border-success p-2 sm:p-3 bg-card">
          <h4 className="text-[10px] sm:text-xs font-semibold tracking-wider text-foreground uppercase mb-2 sm:mb-3 truncate">
            Summary
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {habitStats.map(({ habit, done, miss, pct }) => (
              <div key={habit.id} className="text-[10px] sm:text-xs">
                <p className="font-medium text-foreground truncate">{habit.name}</p>
                <p className="text-muted-foreground">{pct}%</p>
                <p className="text-muted-foreground">
                  {done}/{miss}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendarGrid;
