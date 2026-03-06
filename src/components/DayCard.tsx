import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Share2 } from "lucide-react";
import ProgressCircle from "./ProgressCircle";
import { Habit, isToday, formatDayDate, calculateProgress } from "@/lib/habitData";

interface DayCardProps {
  dayName: string;
  date: Date;
  habits: Habit[];
  completedHabits: string[];
  onToggleHabit: (habitId: string) => void;
  fillWidth?: boolean;
}

const DayCard = ({ dayName, date, habits, completedHabits, onToggleHabit, fillWidth }: DayCardProps) => {
  const today = isToday(date);
  const activeHabits = habits.filter(h => h.isActive);
  const progress = calculateProgress(completedHabits.length, activeHabits.length);
  const habitsMaintained = completedHabits.length;
  const habitsToBuild = activeHabits.length - completedHabits.length;
  const isPerfectDay = progress === 100;

  return (
    <div
      className={`bg-card rounded-sm shadow-card flex flex-col ${fillWidth ? "w-full min-w-0" : "min-w-[180px]"} ${today ? "ring-2 ring-today-accent" : ""}`}
    >
      {/* Header */}
      <div className={`px-3 py-2.5 sm:px-4 sm:py-3 text-center rounded-t-sm ${today ? "bg-today-header" : "bg-day-header"}`}>
        <h3 className="text-xs sm:text-sm font-bold tracking-wider text-day-header-foreground uppercase truncate">
          {dayName}
        </h3>
        <p className={`text-[10px] sm:text-xs truncate ${today ? "text-today-accent" : "text-day-header-foreground/70"}`}>
          {formatDayDate(date)}
        </p>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center py-4 sm:py-6">
        <ProgressCircle percentage={progress} size={80} isToday={today} />
      </div>

      {/* Habits List — centered under the date above */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex-1 min-w-0 text-center">
        <h4 className="text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 sm:mb-3">
          Daily Habits
        </h4>
        <div className="space-y-1.5 sm:space-y-2 flex flex-col items-center">
          {activeHabits.map((habit) => {
            const isCompleted = completedHabits.includes(habit.id);
            return (
              <div key={habit.id} className="flex items-center gap-2 w-full max-w-[160px]">
                <span className={`text-xs sm:text-sm flex-1 min-w-0 truncate text-left ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {habit.name}
                </span>
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => onToggleHabit(habit.id)}
                  className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Achievement Button (only for perfect days) */}
      {isPerfectDay && (
        <button className="mx-3 mb-3 sm:mx-4 sm:mb-4 py-1.5 sm:py-2 px-2 sm:px-3 bg-today-header text-primary-foreground rounded-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium hover:bg-primary transition-colors">
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Share
        </button>
      )}

      {/* Stats */}
      <div className={`px-3 py-2 sm:px-4 sm:py-3 flex text-xs border-t border-border ${today ? "bg-today-header/5" : ""}`}>
        <div className="flex-1 min-w-0">
          <span className="text-muted-foreground uppercase tracking-wider block text-[9px] sm:text-[10px] truncate">
            Maintained
          </span>
          <span className={`font-bold text-base sm:text-lg ${today ? "text-today-accent" : "text-success"}`}>
            {habitsMaintained}
          </span>
        </div>
        <div className="flex-1 text-right min-w-0">
          <span className="text-muted-foreground uppercase tracking-wider block text-[9px] sm:text-[10px] truncate">
            To Build
          </span>
          <span className="font-bold text-base sm:text-lg text-foreground">{habitsToBuild}</span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-border">
        <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase truncate">
            Tasks
          </span>
          <button className="text-muted-foreground hover:text-foreground flex-shrink-0" aria-label="Add task">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground italic truncate">Tap + to add</p>
      </div>
    </div>
  );
};

export default DayCard;
