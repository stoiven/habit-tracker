import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((month) => ({ month, value: 0 }));

const AnnualTrends = () => (
  <div className="bg-card rounded-sm shadow-card p-5">
    <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
      Annual Trends
    </h3>
    <div className="h-[120px] mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
            domain={[0, 6]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--chart-line))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        I want to do this because
      </p>
      <input
        type="text"
        placeholder="…enter your motivation here"
        className="w-full bg-transparent border-b border-dashed border-muted text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent py-1"
      />
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      <span className="text-today-accent font-medium">Did you know?</span> If you complete your day,
      you can share a HabiCard celebrating your achievement on social media.
    </p>
  </div>
);

export default AnnualTrends;
