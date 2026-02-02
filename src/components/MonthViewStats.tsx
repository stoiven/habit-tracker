import { Zap } from "lucide-react";
import { Habit } from "@/lib/habitData";

interface MonthViewStatsProps {
  doneCount: number;
  rate: number;
  habits: Habit[];
  currentStreakDays: number;
  onManageHabits?: () => void;
  onStreakClick?: () => void;
}

const MonthViewStats = ({
  doneCount,
  rate,
  habits,
  currentStreakDays,
  onManageHabits,
  onStreakClick,
}: MonthViewStatsProps) => {
  const activeCount = habits.filter((h) => h.isActive).length;
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="bg-card rounded-lg shadow-card px-4 py-3 flex-1 border border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Done</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-1.5 bg-success rounded-full" />
            <span className="text-2xl font-bold text-foreground">{doneCount}</span>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-card px-4 py-3 flex-1 border border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-1.5 bg-chart-line rounded-full" />
            <span className="text-2xl font-bold text-foreground">{rate}%</span>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg shadow-card p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-foreground" />
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              My Habits {activeCount}
            </h3>
          </div>
          {onManageHabits && (
            <button
              type="button"
              onClick={onManageHabits}
              className="text-xs font-medium text-muted-foreground hover:text-foreground uppercase tracking-wider"
            >
              Manage Habits
            </button>
          )}
        </div>
      </div>
      <div
        role={onStreakClick ? "button" : undefined}
        tabIndex={onStreakClick ? 0 : undefined}
        onClick={onStreakClick}
        onKeyDown={onStreakClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onStreakClick(); } } : undefined}
        className={`bg-card rounded-lg shadow-card px-4 py-3 border border-border ${onStreakClick ? "cursor-pointer hover:bg-card/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background" : ""}`}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">
          Current Streak
        </span>
        <span className="text-xl font-bold text-foreground">{currentStreakDays} Days</span>
      </div>
    </div>
  );
};

export default MonthViewStats;
