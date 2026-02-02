import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Habit, createHabitId } from "@/lib/habitData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManageHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
}

const ManageHabitsDialog = ({
  open,
  onOpenChange,
  habits,
  onHabitsChange,
}: ManageHabitsDialogProps) => {
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createHabitId(name, habits.map((h) => h.id));
    onHabitsChange([...habits, { id, name, isActive: true }]);
    setNewName("");
  };

  const handleRemove = (id: string) => {
    onHabitsChange(habits.filter((h) => h.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage habits</DialogTitle>
          <DialogDescription>
            Add new habits or remove ones you no longer track. They’ll show up in My Week and My Month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Habit name (e.g. Reading)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button type="button" onClick={handleAdd} size="icon" disabled={!newName.trim()}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add habit</span>
            </Button>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Your habits ({habits.length})
            </p>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto rounded-md border border-border p-2">
              {habits.length === 0 ? (
                <li className="text-sm text-muted-foreground py-2 text-center">
                  No habits yet. Add one above.
                </li>
              ) : (
                habits.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded px-2 py-1.5 bg-muted/50 text-sm"
                  >
                    <span className="font-medium text-foreground truncate">{h.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(h.id)}
                      aria-label={`Remove ${h.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageHabitsDialog;
