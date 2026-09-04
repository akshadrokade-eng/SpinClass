import type { Student } from "../types";

export function selectRandomStudent(
  students: Student[],
  askedIds: number[],
  noRepeatMode: boolean,
): Student | null {
  const eligible = noRepeatMode
    ? students.filter((s) => !askedIds.includes(s.id))
    : students;

  if (eligible.length === 0) return null;
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}
