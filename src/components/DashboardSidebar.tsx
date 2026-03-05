import { useState } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { Habit } from "@/lib/habitData";
import { cn } from "@/lib/utils";
import type { Distraction } from "@/lib/storage";
import IdentitySummary from "./IdentitySummary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardSidebarProps {
  habits: Habit[];
  currentStreakDays?: number;
  onManageHabits?: () => void;
  onStreakClick?: () => void;
  distractions?: Distraction[];
  onAddDistraction?: (name: string) => void;
  onRemoveDistraction?: (id: string) => void;
}

const DashboardSidebar = ({
  habits,
  currentStreakDays = 0,
  onManageHabits,
  onStreakClick,
  distractions = [],
  onAddDistraction,
  onRemoveDistraction,
}: DashboardSidebarProps) => {
  const [addDistractionOpen, setAddDistractionOpen] = useState(false);
  const [newDistractionName, setNewDistractionName] = useState("");

  const activeCount = habits.filter((h) => h.isActive).length;

  const handleAddDistraction = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDistractionName.trim();
    if (name && onAddDistraction) {
      onAddDistraction(name);
      setNewDistractionName("");
      setAddDistractionOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-sm shadow-card p-4">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
          My Habits
        </h3>
        <p className="text-3xl font-bold text-foreground">{activeCount}</p>
        {onManageHabits && (
          <button type="button" onClick={onManageHabits} className="text-xs text-muted-foreground hover:text-foreground mt-1 uppercase tracking-wider">
            Manage Habits
          </button>
        )}
      </div>

      <div
        role={onStreakClick ? "button" : undefined}
        tabIndex={onStreakClick ? 0 : undefined}
        onClick={onStreakClick}
        onKeyDown={onStreakClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onStreakClick(); } } : undefined}
        className={cn(
          "bg-card rounded-sm shadow-card p-4",
          onStreakClick && "cursor-pointer hover:bg-card/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        )}
      >
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
          Current Streak
        </h3>
        <p className="text-2xl font-bold text-foreground">{currentStreakDays} Days</p>
      </div>

      <IdentitySummary />

      <div className="bg-card rounded-sm shadow-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Play className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
              Distraction
            </h3>
            {onAddDistraction && (
              <button
                type="button"
                onClick={() => setAddDistractionOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add to your stream
              </button>
            )}
          </div>
        </div>
        {distractions.length > 0 && (
          <ul className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
            {distractions.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5 bg-muted/50 text-sm"
              >
                <span className="truncate text-foreground">{d.name}</span>
                {onRemoveDistraction && (
                  <button
                    type="button"
                    onClick={() => onRemoveDistraction(d.id)}
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${d.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {onAddDistraction && (
        <Dialog open={addDistractionOpen} onOpenChange={setAddDistractionOpen}>
          <DialogContent className="dark sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-foreground font-semibold">
                Add distraction
              </DialogTitle>
              <DialogDescription className="text-foreground/80">
                What pulled your attention? Add it to your stream.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDistraction} className="flex gap-2 mt-2">
              <Input
                placeholder="e.g. Social media, YouTube"
                value={newDistractionName}
                onChange={(e) => setNewDistractionName(e.target.value)}
                className="flex-1 bg-muted/50 border-border text-foreground placeholder:text-foreground/60 focus-visible:ring-foreground/20"
                autoFocus
              />
              <Button type="submit" disabled={!newDistractionName.trim()}>
                Add
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardSidebar;
