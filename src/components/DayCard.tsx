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
      <div className={`px-4 py-3 text-center rounded-t-sm ${today ? "bg-today-header" : "bg-day-header"}`}>
        <h3 className="text-sm font-bold tracking-wider text-day-header-foreground uppercase">
          {dayName}
        </h3>
        <p className={`text-xs ${today ? "text-today-accent" : "text-day-header-foreground/70"}`}>
          {formatDayDate(date)}
        </p>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center py-6">
        <ProgressCircle percentage={progress} size={90} isToday={today} />
      </div>

      {/* Habits List */}
      <div className="px-4 pb-4 flex-1">
        <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3">
          Daily Habits
        </h4>
        <div className="space-y-2">
          {activeHabits.map((habit) => {
            const isCompleted = completedHabits.includes(habit.id);
            return (
              <div key={habit.id} className="flex items-center gap-2">
                <span className={`text-sm flex-1 ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {habit.name}
                </span>
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => onToggleHabit(habit.id)}
                  className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Achievement Button (only for perfect days) */}
      {isPerfectDay && (
        <button className="mx-4 mb-4 py-2 px-3 bg-today-header text-primary-foreground rounded-sm flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary transition-colors">
          <Share2 className="w-4 h-4" />
          Share Achievement
        </button>
      )}

      {/* Stats */}
      <div className={`px-4 py-3 flex text-xs border-t border-border ${today ? "bg-today-header/5" : ""}`}>
        <div className="flex-1">
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">
            Habits Maintained
          </span>
          <span className={`font-bold text-lg ${today ? "text-today-accent" : "text-success"}`}>
            {habitsMaintained}
          </span>
        </div>
        <div className="flex-1 text-right">
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">
            To Build
          </span>
          <span className="font-bold text-lg text-foreground">{habitsToBuild}</span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Tasks
          </span>
          <button className="text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground italic">Click + to add a task</p>
      </div>
    </div>
  );
};

export default DayCard;
