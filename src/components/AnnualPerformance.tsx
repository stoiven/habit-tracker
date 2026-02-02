import ProgressCircle from "./ProgressCircle";

interface AnnualPerformanceProps {
  percentage: number;
  completed: number;
  total: number;
}

const AnnualPerformance = ({ percentage, completed, total }: AnnualPerformanceProps) => {
  return (
    <div className="bg-success rounded-sm shadow-card p-5 text-center">
      <h3 className="text-sm font-semibold tracking-wider text-primary-foreground uppercase mb-4">
        Annual Performance
      </h3>
      
      <div className="flex justify-center mb-4">
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
                strokeDasharray: 52 * 2 * Math.PI,
                strokeDashoffset: 52 * 2 * Math.PI - (percentage / 100) * 52 * 2 * Math.PI,
              }}
            />
          </svg>
          <span className="absolute text-2xl font-bold text-primary-foreground">
            {percentage}%
          </span>
        </div>
      </div>

      <p className="text-sm text-primary-foreground/80">
        {completed} / {total} Completed
      </p>
    </div>
  );
};

export default AnnualPerformance;
