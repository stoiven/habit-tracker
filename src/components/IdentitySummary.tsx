import { Trophy } from "lucide-react";

const IdentitySummary = () => (
  <div className="bg-card rounded-sm shadow-card p-4 space-y-4">
    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      Identity Summary
    </h3>
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Primary Identity</p>
        <p className="font-medium text-foreground">The Novice</p>
        <p className="text-xs text-muted-foreground">8% Follow-Through</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Signature Strength</p>
        <p className="font-medium text-foreground">Weekend Warrior</p>
        <p className="text-xs text-muted-foreground">15% Consistency</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Main Challenges</p>
        <p className="font-medium text-foreground">Weekdays</p>
        <p className="text-xs text-muted-foreground">5% Completion</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Days</p>
        <p className="font-medium text-foreground">5 Days</p>
        <p className="text-xs text-muted-foreground">Yearly Activity</p>
      </div>
      <div className="flex items-start gap-2 pt-2 border-t border-border">
        <Trophy className="w-4 h-4 text-today-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Proudest Achievement</p>
          <p className="font-medium text-foreground">Meditation</p>
          <p className="text-xs text-muted-foreground">5 Day Peak Streak</p>
        </div>
      </div>
    </div>
  </div>
);

export default IdentitySummary;
