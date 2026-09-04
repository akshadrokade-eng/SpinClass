import Papa from "papaparse";
import type { Student } from "../types";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const tabCount = (firstLine.match(/\t/g) ?? []).length;

  if (tabCount > 0 && tabCount >= commaCount && tabCount >= semicolonCount) {
    return "\t";
  }
  if (semicolonCount > commaCount) return ";";
  if (commaCount > 0) return ",";
  return ",";
}

function hasAnyDelimiter(line: string): boolean {
  return /[,;\t]/.test(line);
}

function detectHeader(
  headers: string[],
): "name-only" | "roll-name" | "none" {
  const h = headers.map((x) => x.trim().toLowerCase());
  if (
    h.includes("student name") ||
    h.includes("name") ||
    h.includes("student")
  ) {
    if (
      h.includes("roll no") ||
      h.includes("roll number") ||
      h.includes("roll")
    ) {
      return "roll-name";
    }
    return "name-only";
  }
  if (
    h.includes("roll no") ||
    h.includes("roll number") ||
    h.includes("roll")
  ) {
    return "roll-name";
  }
  return "none";
}

export function parseCsv(content: string): Student[] {
  let text = stripBom(content);
  text = normalizeLineEndings(text);
  const trimmed = text.trim();
  if (!trimmed) {
    throw new CsvParseError("CSV file is empty.");
  }

  const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new CsvParseError("CSV file is empty.");
  }

  const firstLine = lines[0].trim();
  const singleColumn = !hasAnyDelimiter(firstLine);

  if (singleColumn) {
    const firstLower = lines[0].trim().toLowerCase();
    const isHeader =
      firstLower === "name" ||
      firstLower === "student name" ||
      firstLower === "student";
    const nameLines = isHeader ? lines.slice(1) : lines;
    const names = nameLines.map((l) => l.trim()).filter(Boolean);
    if (names.length === 0) {
      throw new CsvParseError("No valid student names found.");
    }
    return names.map((name, i) => ({ id: i + 1, name }));
  }

  const delimiter = detectDelimiter(firstLine);

  const result = Papa.parse<string[]>(trimmed, {
    header: false,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (h: string) => h.trim(),
  });

  if (result.errors.length > 0) {
    const critical = result.errors.filter(
      (e) => e.type !== "Delimiter" && e.type !== "FieldMismatch",
    );
    if (critical.length > 0) {
      throw new CsvParseError(
        `CSV parsing error: ${critical[0].message}`,
      );
    }
  }

  const rows = result.data.filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );
  if (rows.length === 0) {
    throw new CsvParseError("No data rows found in CSV.");
  }

  const firstRow = rows[0];
  const hasHeader = firstRow.some((cell) =>
    /name|student|roll|number/i.test(cell.trim()),
  );

  let students: Student[] = [];

  if (hasHeader) {
    const headerType = detectHeader(firstRow);
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      throw new CsvParseError("No student data found after header.");
    }

    if (headerType === "roll-name") {
      const nameIdx = firstRow.findIndex((h) =>
        /name|student/i.test(h.trim()),
      );
      const rollIdx = firstRow.findIndex((h) =>
        /roll|number/i.test(h.trim()),
      );

      students = dataRows
        .map((row, i) => {
          const name = (row[nameIdx] ?? row[1] ?? "").trim();
          const rollNo = (row[rollIdx] ?? row[0] ?? "").trim();
          return { id: i + 1, name, rollNo: rollNo || undefined };
        })
        .filter((s) => s.name.length > 0);
    } else {
      const nameIdx = firstRow.findIndex((h) =>
        /name|student/i.test(h.trim()),
      );
      students = dataRows
        .map((row, i) => {
          const name = (row[nameIdx] ?? row[0] ?? "").trim();
          return { id: i + 1, name };
        })
        .filter((s) => s.name.length > 0);
    }
  } else {
    students = rows
      .map((row, i) => {
        const cells = row.map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          return { id: i + 1, rollNo: cells[0], name: cells[1] };
        }
        return { id: i + 1, name: cells[0] ?? "" };
      })
      .filter((s) => s.name.length > 0);
  }

  if (students.length === 0) {
    throw new CsvParseError(
      "No valid student names found. Ensure each row has a name.",
    );
  }

  return students;
}
