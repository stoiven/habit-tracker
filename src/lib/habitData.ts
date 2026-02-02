export interface Habit {
  id: string;
  name: string;
  isActive: boolean;
}

export interface DayData {
  date: Date;
  dayName: string;
  completedHabits: string[];
  tasks: string[];
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayData[];
}

export const defaultHabits: Habit[] = [
  { id: "piano", name: "Piano", isActive: true },
  { id: "hygiene", name: "Hygiene", isActive: true },
  { id: "filipino", name: "Filipino", isActive: true },
  { id: "korean", name: "Korean", isActive: true },
  { id: "programming", name: "Programming", isActive: true },
];

export const generateWeekData = (startDate: Date, habits: Habit[]): WeekData => {
  const days: DayData[] = [];
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // No mock completions — use current habit ids only so checkboxes and percentages stay in sync.
    // Completed habits come only from user toggles (dayHabits in Dashboard).
    const completedHabits: string[] = [];

    days.push({
      date,
      dayName: dayNames[i],
      completedHabits,
      tasks: [],
    });
  }
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return { startDate, endDate, days };
};

export const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", options);
  return `${startStr.toUpperCase()} - ${endStr.toUpperCase()}`;
};

export const formatDayDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/** Generate a unique id from a name for use as Habit.id. */
export function createHabitId(name: string, existingIds: string[]): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || "habit";
  const set = new Set(existingIds);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
