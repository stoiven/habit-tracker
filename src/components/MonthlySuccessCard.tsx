import ProgressCircle from "./ProgressCircle";

interface MonthlySuccessCardProps {
  completed: number;
  total: number;
  percentage: number;
  story: string;
}

const MonthlySuccessCard = ({
  completed,
  total,
  percentage,
  story,
}: MonthlySuccessCardProps) => (
  <div className="bg-card rounded-xl shadow-card p-5 h-full flex flex-col border border-border">
    <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
      Monthly Success
    </h3>
    <div className="flex flex-col items-center mb-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Month Mastery {completed}/{total}
      </p>
      <ProgressCircle percentage={percentage} size={100} isToday={false} />
    </div>
    <div className="pt-4 border-t border-border flex-1">
      <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
        Your Story This Month
      </h4>
      <p className="text-sm text-foreground leading-relaxed">{story}</p>
    </div>
  </div>
);

export default MonthlySuccessCard;
