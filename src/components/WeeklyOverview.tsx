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
  <div className="bg-card rounded-xl shadow-card p-5 border border-border">
    <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">
      Weekly Overview
    </h3>
    <div className="space-y-4">
      {weeks.map((w, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-24 shrink-0">
            <p className="text-xs font-medium text-foreground uppercase">{w.label}</p>
            <p className={`text-[10px] ${lightTheme ? "text-[hsl(350,30%,50%)]" : "text-muted-foreground"}`}>
              {w.range}
            </p>
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-[auto_auto_1fr] gap-3 items-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Success Rate</p>
              <span className={`text-sm font-bold inline-block ${lightTheme ? "bg-[hsl(350,40%,92%)] text-foreground rounded-full px-2 py-0.5" : ""}`}>
                {w.successRate}%
              </span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Completed</p>
              <p className="text-sm font-bold text-foreground">{w.completed}/{w.total}</p>
            </div>
            <div className="flex gap-0.5 items-end h-6">
              {w.dailyValues.map((v, j) => (
                <div
                  key={j}
                  className="flex-1 min-w-[4px] bg-success rounded-sm transition-all"
                  style={{ height: `${Math.max(4, (v / 100) * 24)}px` }}
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
