import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface WeeklyChartProps {
  data: { day: string; value: number }[];
}

const WeeklyProgressChart = ({ data }: WeeklyChartProps) => {
  return (
    <div className="bg-card rounded-sm shadow-card p-6">
      <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
        Daily Progress This Week
      </h3>
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-line))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-line))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-line))"
              strokeWidth={2}
              fill="url(#colorProgress)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Motivation Quote */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          ❝ I want to do this because
        </p>
        <input
          type="text"
          placeholder="...enter your motivation here"
          className="w-full bg-transparent border-b border-dashed border-muted text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent py-1"
        />
      </div>

      {/* Tip */}
      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <span className="text-today-accent">💡</span>
        <p>Did you know? If you complete your day, you can share a HabiCard celebrating your achievement on social media.</p>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
