import ProgressCircle from "./ProgressCircle";

interface MonthCardProps {
  monthName: string;
  year: number;
  percentage: number;
  focus?: string;
  bestStreak: string;
  perfectDays: number;
  totalActions: number;
  isCurrentMonth?: boolean;
}

const MonthCard = ({ 
  monthName, 
  year, 
  percentage, 
  focus = "-",
  bestStreak,
  perfectDays,
  totalActions,
  isCurrentMonth = false
}: MonthCardProps) => {
  return (
    <div className={`bg-card rounded-sm shadow-card flex flex-col min-w-[200px] ${isCurrentMonth ? "ring-2 ring-today-accent" : ""}`}>
      {/* Header */}
      <div className={`px-4 py-3 text-center rounded-t-sm ${isCurrentMonth ? "bg-today-header" : "bg-day-header"}`}>
        <h3 className="text-sm font-bold tracking-wider text-day-header-foreground uppercase">
          {monthName} {year}
        </h3>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center py-6">
        <ProgressCircle percentage={percentage} size={90} isToday={isCurrentMonth} />
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">Focus</span>
          <span className="font-semibold text-foreground uppercase">{focus}</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">Best Streak</span>
          <span className="font-bold text-today-accent text-lg">{bestStreak}</span>
        </div>
        <div>
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">Perfect Days</span>
          <span className="font-semibold text-foreground">{perfectDays}</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground uppercase tracking-wider block text-[10px]">Total Actions</span>
          <span className="font-semibold text-foreground">{totalActions}</span>
        </div>
      </div>
    </div>
  );
};

export default MonthCard;
