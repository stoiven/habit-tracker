interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isToday?: boolean;
}

const ProgressCircle = ({ 
  percentage, 
  size = 100, 
  strokeWidth = 6,
  isToday = false 
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.min(100, percentage);
  const offset = circumference - (pct / 100) * circumference;
  const displayPct = percentage < 1 && percentage > 0 ? percentage.toFixed(1) : Math.round(percentage);
  
  const strokeColor = isToday && percentage === 100 
    ? "hsl(var(--today-accent))" 
    : "hsl(var(--progress-ring))";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="fill-none"
          stroke="hsl(var(--progress-bg))"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-circle fill-none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <span className={`absolute text-xl font-semibold ${isToday ? "text-today-accent" : "text-foreground"}`}>
        {displayPct}%
      </span>
    </div>
  );
};

export default ProgressCircle;
