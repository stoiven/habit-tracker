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
  const offset = circumference - (percentage / 100) * circumference;
  
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
      <span className={`absolute text-xl font-semibold ${isToday ? "text-primary-foreground" : "text-foreground"}`}>
        {percentage}%
      </span>
    </div>
  );
};

export default ProgressCircle;
