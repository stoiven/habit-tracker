import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/storage";

interface TaskListCardProps {
  tasks: Task[];
  onAddTask: (label: string) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

const TaskListCard = ({ tasks, onAddTask, onToggleTask, onRemoveTask }: TaskListCardProps) => {
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (trimmed) {
      onAddTask(trimmed);
      setNewLabel("");
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">
        Tasks
      </h3>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="Add a task..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" disabled={!newLabel.trim()}>
          <Plus className="w-4 h-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </form>

      <ul className="space-y-2 flex-1 overflow-y-auto max-h-64">
        {tasks.length === 0 ? (
          <li className="text-sm text-muted-foreground py-4 text-center">
            No tasks yet. Add one above.
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 group rounded-md py-1.5 px-2 hover:bg-muted/50"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task.id)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span
                className={`flex-1 text-sm truncate ${
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.label}
              </span>
              <button
                type="button"
                onClick={() => onRemoveTask(task.id)}
                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${task.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TaskListCard;
