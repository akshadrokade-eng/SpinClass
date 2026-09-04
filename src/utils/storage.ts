import type { Student, SessionStorage } from "../types";

const STORAGE_KEY = "spinclass-session";

export function saveSession(
  students: Student[],
  askedIds: number[],
  noRepeatMode: boolean,
): void {
  const data: SessionStorage = { students, askedIds, noRepeatMode };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadSession(): SessionStorage | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SessionStorage;
    if (!Array.isArray(data.students) || data.students.length === 0) {
      return null;
    }
    return {
      students: data.students,
      askedIds: Array.isArray(data.askedIds) ? data.askedIds : [],
      noRepeatMode:
        typeof data.noRepeatMode === "boolean" ? data.noRepeatMode : true,
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
