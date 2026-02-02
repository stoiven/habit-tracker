import { Zap, Trophy, Target, Flame, Calendar } from "lucide-react";

interface YearlyStatsProps {
  annualDone: number;
  goalRate: number;
  consistency: number;
  maxStreak: number;
  strongestMonth: string;
  strongestMonthRate: number;
}

const YearlyStats = ({ 
  annualDone, 
  goalRate, 
  consistency, 
  maxStreak,
  strongestMonth,
  strongestMonthRate
}: YearlyStatsProps) => {
  return (
    <div className="bg-card rounded-sm shadow-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-today-accent" />
        <h3 className="text-lg font-display font-semibold tracking-wider text-foreground uppercase">
          My Habits
        </h3>
        <div className="ml-auto">
          <Trophy className="w-6 h-6 text-muted" />
        </div>
      </div>

      {/* Annual Done */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Annual Done</span>
          <span className="text-xl font-bold text-foreground">{annualDone}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-success rounded-full transition-all"
            style={{ width: `${Math.min((annualDone / 100) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Goal Rate */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Goal Rate</span>
          <span className="text-xl font-bold text-chart-line">{goalRate}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-chart-line rounded-full transition-all"
            style={{ width: `${goalRate}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex pt-3 border-t border-border">
        <div className="flex-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Consistency</span>
          <span className="text-2xl font-bold text-foreground">{consistency}%</span>
        </div>
        <div className="flex-1 text-right">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Max Streak</span>
          <span className="text-2xl font-bold text-today-accent">{maxStreak} Days</span>
        </div>
      </div>

      {/* Strongest Month */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Trophy className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Strongest Month</span>
        <span className="ml-auto px-3 py-1 bg-muted text-sm font-medium rounded-full">
          {strongestMonth} ({strongestMonthRate}%)
        </span>
      </div>
    </div>
  );
};

export default YearlyStats;
