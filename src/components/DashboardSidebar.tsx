import { Play } from "lucide-react";
import { Habit } from "@/lib/habitData";
import { cn } from "@/lib/utils";
import IdentitySummary from "./IdentitySummary";

interface DashboardSidebarProps {
  habits: Habit[];
  currentStreakDays?: number;
  onManageHabits?: () => void;
  onStreakClick?: () => void;
}

const DashboardSidebar = ({ habits, currentStreakDays = 0, onManageHabits, onStreakClick }: DashboardSidebarProps) => {
  const activeCount = habits.filter((h) => h.isActive).length;
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-sm shadow-card p-4">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
          My Habits
        </h3>
        <p className="text-3xl font-bold text-foreground">{activeCount}</p>
        {onManageHabits && (
          <button type="button" onClick={onManageHabits} className="text-xs text-muted-foreground hover:text-foreground mt-1 uppercase tracking-wider">
            Manage Habits
          </button>
        )}
      </div>

      <div
        role={onStreakClick ? "button" : undefined}
        tabIndex={onStreakClick ? 0 : undefined}
        onClick={onStreakClick}
        onKeyDown={onStreakClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onStreakClick(); } } : undefined}
        className={cn(
          "bg-card rounded-sm shadow-card p-4",
          onStreakClick && "cursor-pointer hover:bg-card/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        )}
      >
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
          Current Streak
        </h3>
        <p className="text-2xl font-bold text-foreground">{currentStreakDays} Days</p>
      </div>

      <IdentitySummary />

      <div className="bg-card rounded-sm shadow-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Play className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
            Distraction
          </h3>
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider">
            Add to your stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
