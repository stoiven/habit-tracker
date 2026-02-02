import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTrendsChartProps {
  data: { day: number; value: number }[];
  vsLastMonth?: number;
}

const MonthlyTrendsChart = ({ data, vsLastMonth = 6 }: MonthlyTrendsChartProps) => (
  <div className="bg-card rounded-xl shadow-card p-5 border border-border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
        Monthly Trends
      </h3>
      <span className="text-xs px-2 py-1 rounded-md border border-success text-foreground">
        {vsLastMonth}% vs LM
      </span>
    </div>
    <div className="h-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            domain={[1, 31]}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "4px",
              fontSize: "12px",
            }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="px-2 py-1">
                  <p className="text-muted-foreground text-xs">
                    Weekly completion % – how many habits completed out of total possible.
                  </p>
                  <p className="font-medium">Day {payload[0]?.payload?.day}: {payload[0]?.value}%</p>
                </div>
              ) : null
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        I want to do this because…
      </p>
      <input
        type="text"
        placeholder="enter your motivation here"
        className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
      />
    </div>
    <p className="text-xs text-muted-foreground mt-4">
      Toggle between Line and Bar charts in the header to visualize your progress differently.
    </p>
  </div>
);

export default MonthlyTrendsChart;
