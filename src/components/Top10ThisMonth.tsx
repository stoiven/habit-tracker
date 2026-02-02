import { Habit } from "@/lib/habitData";

interface Top10ThisMonthProps {
  habits: { habit: Habit; daysCompleted: number }[];
}

const Top10ThisMonth = ({ habits }: Top10ThisMonthProps) => {
  const maxDays = Math.max(...habits.map((h) => h.daysCompleted), 1);
  return (
    <div className="bg-card rounded-xl shadow-card p-5 border border-border h-full">
      <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">
        Top 10 This Month
      </h3>
      <div className="space-y-3">
        {habits.slice(0, 10).map(({ habit, daysCompleted }) => (
          <div key={habit.id}>
            <div className="flex justify-between items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground truncate uppercase">
                {habit.name}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                ({daysCompleted} {daysCompleted === 1 ? "Day" : "Days"})
              </span>
            </div>
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-muted rounded-full transition-all"
                style={{ width: `${(daysCompleted / maxDays) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Top10ThisMonth;
