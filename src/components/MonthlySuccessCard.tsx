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
}: MonthlySuccessCardProps) => {
  const circumference = 52 * 2 * Math.PI;
  const displayPct = percentage < 1 && percentage > 0 ? percentage.toFixed(1) : Math.round(percentage);
  return (
  <div className="bg-card rounded-xl shadow-card p-5 h-full flex flex-col border border-border">
    <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
      Monthly Success
    </h3>
    <div className="flex flex-col items-center mb-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Month Mastery {completed}/{total}
      </p>
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <svg className="progress-ring" width={120} height={120}>
          <circle
            className="fill-none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={8}
            r={52}
            cx={60}
            cy={60}
          />
          <circle
            className="progress-ring-circle fill-none"
            stroke="white"
            strokeWidth={8}
            strokeLinecap="round"
            r={52}
            cx={60}
            cy={60}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference - (Math.min(100, percentage) / 100) * circumference,
            }}
          />
        </svg>
        <span className="absolute text-2xl font-bold text-foreground">
          {displayPct}%
        </span>
      </div>
    </div>
    <div className="pt-4 border-t border-border flex-1">
      <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
        Your Story This Month
      </h4>
      <p className="text-sm text-foreground leading-relaxed">{story}</p>
    </div>
  </div>
  );
};

export default MonthlySuccessCard;
