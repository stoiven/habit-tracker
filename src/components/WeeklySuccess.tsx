import ProgressCircle from "./ProgressCircle";
import { ArrowUp, ArrowDown } from "lucide-react";

interface WeeklySuccessProps {
  percentage: number;
  completed: number;
  total: number;
  vsPrev: number;
  bestPercentage: number;
  bestDateRange: string;
}

const WeeklySuccess = ({ 
  percentage, 
  completed, 
  total, 
  vsPrev,
  bestPercentage,
  bestDateRange 
}: WeeklySuccessProps) => {
  const isPositive = vsPrev >= 0;

  return (
    <div className="bg-card rounded-sm shadow-card p-6">
      <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 text-center">
        Weekly Success
      </h3>
      
      <div className="flex justify-center mb-4">
        <ProgressCircle percentage={percentage} size={120} strokeWidth={8} />
      </div>

      <p className="text-center text-sm text-muted-foreground mb-4">
        {completed} / {total} Completed
      </p>

      {/* Stats */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">VS Prev</span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(vsPrev)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Best</span>
          <div className="text-right">
            <span className="text-sm font-semibold text-destructive flex items-center gap-1">
              <ArrowDown className="w-3 h-3" />
              {bestPercentage}%
            </span>
            <span className="text-[10px] text-muted-foreground">{bestDateRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySuccess;
