import { Sparkles, ArrowDown } from "lucide-react";

interface HabitOutcome {
  name: string;
  percentage: number;
  change: number;
  isActive: boolean;
}

interface HabitOutcomesProps {
  habits: HabitOutcome[];
}

const HabitOutcomes = ({ habits }: HabitOutcomesProps) => {
  return (
    <div className="bg-card rounded-sm shadow-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Yearly Identity: Habit Outcomes
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {habits.map((habit, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground uppercase text-sm">{habit.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{habit.percentage}%</span>
                <span className="flex items-center text-destructive text-sm">
                  <ArrowDown className="w-3 h-3" />
                  {habit.change}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-chart-line rounded-full transition-all"
                style={{ width: `${habit.percentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 text-xs rounded ${habit.isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                {habit.isActive ? "☰ ACTIVE HABIT" : "INACTIVE"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitOutcomes;
