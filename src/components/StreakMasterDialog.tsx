import { Flame, Trophy, Zap } from "lucide-react";
import { Habit } from "@/lib/habitData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  personalBest: number;
  totalHits: number;
}

const MOTIVATIONAL_QUOTES = [
  "Your future is found in your daily routine.",
  "Small daily improvements lead to stunning results.",
  "Consistency is the signature of greatness.",
  "The only bad workout is the one that didn't happen.",
  "Progress, not perfection.",
];

interface StreakMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreakDays: number;
  bestEverStreak?: number;
  habits: Habit[];
  habitStreaks?: HabitStreak[];
}

const StreakMasterDialog = ({
  open,
  onOpenChange,
  currentStreakDays,
  bestEverStreak = 0,
  habits,
  habitStreaks = [],
}: StreakMasterDialogProps) => {
  const streakByHabitId = new Map(habitStreaks.map((s) => [s.habitId, s]));
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dark sm:max-w-lg p-0 gap-0 overflow-hidden border border-border bg-card shadow-card"
        aria-describedby={undefined}
      >
        <div className="rounded-lg overflow-hidden">
          {/* Header - GitHub dark card/muted */}
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-[hsl(var(--today-accent))] shrink-0" />
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                      STREAK MASTER
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                      Your consistency records
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-card">
            {/* Total Streak & Best Ever cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/30 border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Streak
                  </p>
                  <p className="text-2xl font-bold text-[hsl(var(--today-accent))] mt-1">
                    {currentStreakDays} {currentStreakDays === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <Flame className="h-10 w-10 text-[hsl(var(--today-accent))]/40 shrink-0" />
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Best ever
                  </p>
                  <p className="text-2xl font-bold text-[hsl(var(--today-accent))] mt-1">
                    {bestEverStreak} {bestEverStreak === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <Trophy className="h-10 w-10 text-[hsl(var(--today-accent))]/40 shrink-0" />
              </div>
            </div>

            {/* All your streaks */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                <Zap className="h-4 w-4 text-[hsl(var(--today-accent))]" />
                All your streaks
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {habits.filter((h) => h.isActive).map((habit) => {
                  const s = streakByHabitId.get(habit.id);
                  const current = s?.currentStreak ?? 0;
                  const best = s?.personalBest ?? 0;
                  const hits = s?.totalHits ?? 0;
                  return (
                    <div
                      key={habit.id}
                      className="rounded-lg bg-muted/30 border border-border p-3"
                    >
                      <p className="font-semibold text-foreground text-sm truncate">
                        {habit.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                        Active habit
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-foreground">
                          <Flame className="h-3.5 w-3.5 text-[hsl(var(--today-accent))]" />
                          <span className="font-medium">{current}</span>
                        </span>
                        <span>
                          Personal best {best} {best === 1 ? "Day" : "Days"}
                        </span>
                        <span>Total hits {hits}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {habits.filter((h) => h.isActive).length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center rounded-lg bg-muted/30 border border-border">
                  Add habits in Manage Habits to track streaks.
                </p>
              )}
            </div>

            {/* Motivational quote */}
            <p className="text-sm text-muted-foreground italic text-center pt-4 border-t border-border">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakMasterDialog;
