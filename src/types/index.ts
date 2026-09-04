export interface Student {
  id: number;
  name: string;
  rollNo?: string;
}

export interface SessionData {
  students: Student[];
  askedIds: Set<number>;
  noRepeatMode: boolean;
}

export interface SessionStorage {
  students: Student[];
  askedIds: number[];
  noRepeatMode: boolean;
}
