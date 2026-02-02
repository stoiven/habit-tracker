import { Zap } from "lucide-react";
import { Habit } from "@/lib/habitData";

interface HabitsPanelProps {
  habits: Habit[];
  doneCount: number;
  rate: number;
  onManageHabits?: () => void;
}

const HabitsPanel = ({ habits, doneCount, rate, onManageHabits }: HabitsPanelProps) => {
  const activeHabits = habits.filter(h => h.isActive);

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="flex gap-4">
        <div className="bg-card rounded-sm shadow-card px-4 py-3 flex-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Done</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-1 bg-success rounded-full" />
            <span className="text-2xl font-bold text-foreground">{doneCount}</span>
          </div>
        </div>
        <div className="bg-card rounded-sm shadow-card px-4 py-3 flex-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-1 bg-chart-line rounded-full" />
            <span className="text-2xl font-bold text-chart-line">{rate}%</span>
          </div>
        </div>
      </div>

      {/* My Habits */}
      <div className="bg-day-header rounded-sm shadow-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-day-header-foreground" />
            <h3 className="text-lg font-semibold tracking-wider text-day-header-foreground uppercase">
              My Habits
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-2xl font-bold text-day-header-foreground">{activeHabits.length}</span>
              <span className="text-xs text-day-header-foreground/70 uppercase tracking-wider block">Active</span>
            </div>
            {onManageHabits && (
              <button
                type="button"
                onClick={onManageHabits}
                className="text-xs font-medium text-day-header-foreground/80 hover:text-day-header-foreground uppercase tracking-wider"
              >
                Manage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsPanel;
