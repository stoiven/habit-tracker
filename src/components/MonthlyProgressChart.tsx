import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { BarChart3 } from "lucide-react";

interface MonthlyChartProps {
  data: { month: string; value: number }[];
}

const MonthlyProgressChart = ({ data }: MonthlyChartProps) => {
  return (
    <div className="bg-card rounded-sm shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Monthly Progress This Year
        </h3>
        <button className="p-1 hover:bg-muted rounded-sm">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-line))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-line))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
              fill="url(#colorMonthly)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Motivation Quote */}
      <div className="mt-4 pt-4 border-t border-border">
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
        <p>Use the "My Habits" menu to customize your tracking and set colors that motivate you.</p>
      </div>
    </div>
  );
};

export default MonthlyProgressChart;
