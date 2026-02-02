import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

// Build a grid of daily percentages for a month. dayPcts is 1-indexed day -> percentage.
function buildMonthGrid(year: number, monthIndex: number, dayPcts: Record<number, number>) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startDow = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = last.getDate();
  const cells: { day: number; pct: number }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ day: 0, pct: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, pct: dayPcts[d] ?? 0 });
  }
  return cells;
}

interface RetrospectiveMonthGridProps {
  monthName: string;
  year: number;
  monthIndex: number;
  donePct: number;
  dayPcts?: Record<number, number>;
}

const RetrospectiveMonthGrid = ({
  monthName,
  year,
  monthIndex,
  donePct,
  dayPcts = {},
}: RetrospectiveMonthGridProps) => {
  const cells = buildMonthGrid(year, monthIndex, dayPcts);
  const rows: { day: number; pct: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return (
    <div className="bg-card rounded-sm shadow-card flex flex-col min-w-[220px] overflow-hidden">
      <div className="px-3 py-2 bg-muted/30 flex items-center justify-between">
        <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
          {monthName} {year}
        </h4>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
          {donePct}% Done
        </span>
      </div>
      <div className="p-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
          Retrospective Grid
        </p>
        <div className="flex gap-0.5 mb-1">
          {DAY_LETTERS.map((l, i) => (
            <div
              key={i}
              className="w-6 h-4 flex items-center justify-center text-[9px] text-muted-foreground font-medium"
            >
              {l}
            </div>
          ))}
        </div>
        <div className="space-y-0.5">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-0.5">
              {row.map((c, ci) => (
                <div
                  key={ci}
                  className={`w-6 h-6 flex items-center justify-center text-[8px] rounded-sm ${
                    c.pct > 0
                      ? "bg-success/80 text-primary-foreground font-semibold"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {c.day ? (c.pct > 0 ? `${c.pct}%` : "0%") : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MonthlyBreakdownProps {
  year: number;
}

const MonthlyBreakdown = ({ year }: MonthlyBreakdownProps) => {
  const [activeTab, setActiveTab] = useState<"habits" | "mood">("habits");
  const monthData: { name: string; index: number; donePct: number; dayPcts?: Record<number, number> }[] =
    MONTHS.slice(0, 6).map((name, i) => ({ name, index: i, donePct: 0 }));
  return (
    <div className="bg-card rounded-sm shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Monthly Breakdown
        </h3>
        <div className="flex rounded-sm overflow-hidden border border-border">
          {(["habits", "mood"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "bg-success text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {monthData.map((m) => (
            <RetrospectiveMonthGrid
              key={m.name}
              monthName={m.name}
              year={year}
              monthIndex={m.index}
              donePct={m.donePct}
              dayPcts={m.dayPcts}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyBreakdown;
