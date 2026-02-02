/**
 * Persist habit data in localStorage so it survives refresh and sessions.
 * Data is per-browser (same device). For sync across devices you’d add a backend.
 */

import type { Habit } from "@/lib/habitData";

const KEY_HABITS = "habicard_habits";
const KEY_DAY_HABITS = "habicard_dayHabits";
const KEY_MONTH_COMPLETION = "habicard_monthCompletion";

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or disabled; ignore
  }
}

export function getStoredHabits(): Habit[] | null {
  const data = safeGet<Habit[]>(KEY_HABITS);
  if (!Array.isArray(data)) return null;
  return data;
}

export function setStoredHabits(habits: Habit[]): void {
  safeSet(KEY_HABITS, habits);
}

export function getStoredDayHabits(): Record<string, string[]> | null {
  const data = safeGet<Record<string, string[]>>(KEY_DAY_HABITS);
  if (data == null || typeof data !== "object") return null;
  return data;
}

export function setStoredDayHabits(dayHabits: Record<string, string[]>): void {
  safeSet(KEY_DAY_HABITS, dayHabits);
}

export function getStoredMonthCompletion(): Record<string, string[]> | null {
  const data = safeGet<Record<string, string[]>>(KEY_MONTH_COMPLETION);
  if (data == null || typeof data !== "object") return null;
  return data;
}

export function setStoredMonthCompletion(data: Record<string, string[]>): void {
  safeSet(KEY_MONTH_COMPLETION, data);
}
