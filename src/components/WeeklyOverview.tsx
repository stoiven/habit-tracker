interface WeekInfo {
  label: string;
  range: string;
  successRate: number;
  completed: number;
  total: number;
  dailyValues: number[]; // 7 days, 0-100 or similar for bar heights
}

interface WeeklyOverviewProps {
  weeks: WeekInfo[];
  lightTheme?: boolean;
}

const WeeklyOverview = ({ weeks, lightTheme }: WeeklyOverviewProps) => (
  <div className="bg-card rounded-xl shadow-card p-3 sm:p-5 border border-border">
    <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-foreground uppercase mb-3 sm:mb-4">
      Weekly Overview
    </h3>
    <div className="space-y-3 sm:space-y-4">
      {weeks.map((w, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="w-14 sm:w-24 shrink-0">
            <p className="text-[10px] sm:text-xs font-medium text-foreground uppercase">{w.label}</p>
            <p className={`text-[9px] sm:text-[10px] truncate ${lightTheme ? "text-[hsl(350,30%,50%)]" : "text-muted-foreground"}`}>
              {w.range}
            </p>
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-[auto_auto_1fr] gap-2 sm:gap-3 items-center">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Rate</p>
              <span className={`text-xs sm:text-sm font-bold inline-block ${lightTheme ? "bg-[hsl(350,40%,92%)] text-foreground rounded-full px-1.5 sm:px-2 py-0.5" : ""}`}>
                {w.successRate}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Done</p>
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">{w.completed}/{w.total}</p>
            </div>
            <div className="flex gap-0.5 items-end h-5 sm:h-6 min-w-0">
              {w.dailyValues.map((v, j) => (
                <div
                  key={j}
                  className="flex-1 min-w-[3px] sm:min-w-[4px] bg-success rounded-sm transition-all"
                  style={{ height: `${Math.max(3, (v / 100) * 20)}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WeeklyOverview;
