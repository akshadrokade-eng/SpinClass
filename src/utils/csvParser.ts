import { extractStudentEntries, DataParseError } from "./dataFileParser";
import type { Student } from "../types";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

export function parseFile(
  content: string,
  fileName: string,
  isBase64 = false,
): Student[] {
  try {
    const entries = extractStudentEntries(content, fileName, isBase64);
    if (entries.length === 0) {
      throw new CsvParseError("No students were found in this file.");
    }
    return entries.map((entry, i) => ({
      id: i + 1,
      name: entry.name,
      rollNo: entry.rollNo || undefined,
    }));
  } catch (err) {
    if (err instanceof CsvParseError) throw err;
    if (err instanceof DataParseError) {
      throw new CsvParseError(err.message);
    }
    throw new CsvParseError("Could not read this file.");
  }
}
