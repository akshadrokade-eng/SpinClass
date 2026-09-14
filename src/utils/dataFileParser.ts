import Papa from "papaparse";
import * as XLSX from "xlsx";

export class DataParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataParseError";
  }
}

export type ColumnType = "student" | "topic";

const STUDENT_NAME_COLUMNS = [
  "name",
  "student name",
  "full name",
  "student",
  "member name",
  "student_name",
  "studentname",
];

const STUDENT_ROLL_COLUMNS = [
  "roll no",
  "roll number",
  "roll_no",
  "rollnumber",
  "roll",
  "roll no.",
  "roll number.",
];

const TOPIC_NAME_COLUMNS = [
  "topic",
  "topics",
  "title",
  "topic name",
  "name",
  "subject",
  "question topic",
];

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_]+/g, " ");
}

function getNameColumns(type: ColumnType): string[] {
  return type === "student" ? STUDENT_NAME_COLUMNS : TOPIC_NAME_COLUMNS;
}

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const pipeCount = (firstLine.match(/\|/g) ?? []).length;

  if (tabCount > 0 && tabCount >= commaCount && tabCount >= semicolonCount && tabCount >= pipeCount) {
    return "\t";
  }
  if (pipeCount > 0 && pipeCount >= commaCount && pipeCount >= semicolonCount) {
    return "|";
  }
  if (semicolonCount > commaCount) return ";";
  if (commaCount > 0) return ",";
  return ",";
}

function hasAnyDelimiter(line: string): boolean {
  return /[,;\t|]/.test(line);
}

function findColumnIndex(
  headers: string[],
  candidates: string[],
): number {
  const normalized = headers.map(normalizeHeader);
  for (const c of candidates) {
    const idx = normalized.indexOf(c);
    if (idx >= 0) return idx;
  }
  return -1;
}

function isHeaderRow(cells: string[], nameColumns: string[]): boolean {
  return cells.some((cell) => {
    const n = normalizeHeader(cell);
    return nameColumns.includes(n) || STUDENT_ROLL_COLUMNS.includes(n);
  });
}

interface ExtractedEntry {
  name: string;
  rollNo?: string;
}

function parseTextRows(
  content: string,
  nameColumns: string[],
): ExtractedEntry[] {
  let text = stripBom(content);
  text = normalizeLineEndings(text);
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0].trim();
  const singleColumn = !hasAnyDelimiter(firstLine);

  if (singleColumn) {
    const firstLower = normalizeHeader(lines[0]);
    const isHeader = nameColumns.some((c) => firstLower === c);
    const dataLines = isHeader ? lines.slice(1) : lines;
    return dataLines
      .map((l) => ({ name: l.trim() }))
      .filter((e) => e.name.length > 0);
  }

  const delimiter = detectDelimiter(firstLine);

  const result = Papa.parse<string[]>(trimmed, {
    header: false,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (h: string) => h.trim(),
  });

  const rows = result.data.filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  const hasHeader = isHeaderRow(firstRow, nameColumns);

  if (hasHeader) {
    const nameIdx = findColumnIndex(firstRow, nameColumns);
    const rollIdx = findColumnIndex(firstRow, STUDENT_ROLL_COLUMNS);
    const dataRows = rows.slice(1);
    if (dataRows.length === 0) return [];

    if (nameIdx >= 0) {
      return dataRows
        .map((row) => ({
          name: (row[nameIdx] ?? "").trim(),
          rollNo: rollIdx >= 0 ? (row[rollIdx] ?? "").trim() : undefined,
        }))
        .filter((e) => e.name.length > 0);
    }

    return dataRows
      .map((row) => {
        const cells = row.map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          return { name: cells[1], rollNo: cells[0] };
        }
        return { name: cells[0] ?? "" };
      })
      .filter((e) => e.name.length > 0);
  }

  return rows
    .map((row) => {
      const cells = row.map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        return { name: cells[1], rollNo: cells[0] };
      }
      return { name: cells[0] ?? "" };
    })
    .filter((e) => e.name.length > 0);
}

function parseJsonEntries(
  content: string,
  nameColumns: string[],
): ExtractedEntry[] {
  const data = JSON.parse(content) as unknown;

  let items: unknown[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0) {
        items = val;
        break;
      }
    }
  }

  if (items.length === 0) return [];

  const first = items[0];

  if (typeof first === "string") {
    return items
      .filter((item): item is string => typeof item === "string" && (item as string).trim().length > 0)
      .map((s) => ({ name: (s as string).trim() }));
  }

  if (typeof first === "object" && first !== null) {
    const keys = Object.keys(first as Record<string, unknown>);
    const normalizedKeys = keys.map(normalizeHeader);

    let nameKey: string | null = null;
    let rollKey: string | null = null;

    for (const candidate of nameColumns) {
      const idx = normalizedKeys.indexOf(candidate);
      if (idx >= 0) {
        nameKey = keys[idx];
        break;
      }
    }

    for (const candidate of STUDENT_ROLL_COLUMNS) {
      const idx = normalizedKeys.indexOf(candidate);
      if (idx >= 0) {
        rollKey = keys[idx];
        break;
      }
    }

    if (nameKey) {
      return items
        .map((item) => {
          const obj = item as Record<string, unknown>;
          const val = obj[nameKey!];
          const name = typeof val === "string" ? val.trim() : "";
          let rollNo: string | undefined;
          if (rollKey) {
            const rVal = obj[rollKey];
            rollNo = typeof rVal === "string" ? rVal.trim() : typeof rVal === "number" ? String(rVal) : undefined;
            if (rollNo === "") rollNo = undefined;
          }
          return { name, rollNo };
        })
        .filter((e) => e.name.length > 0);
    }

    return items
      .map((item) => {
        const obj = item as Record<string, unknown>;
        const name = Object.values(obj)
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter(Boolean)
          .join(" ");
        return { name };
      })
      .filter((e) => e.name.length > 0);
  }

  return [];
}

function parseSpreadsheetEntries(
  buffer: ArrayBuffer,
  nameColumns: string[],
): ExtractedEntry[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
  });

  if (jsonData.length === 0) return [];

  const firstRow = jsonData[0];
  if (!Array.isArray(firstRow)) return [];

  const headers = firstRow.map((h) => String(h ?? "").trim());
  const hasHeader = isHeaderRow(headers, nameColumns);

  if (hasHeader) {
    const nameIdx = findColumnIndex(headers, nameColumns);
    const rollIdx = findColumnIndex(headers, STUDENT_ROLL_COLUMNS);
    const dataRows = jsonData.slice(1);

    if (nameIdx >= 0) {
      return dataRows
        .map((row) => {
          if (!Array.isArray(row)) return { name: "" };
          const name = String(row[nameIdx] ?? "").trim();
          let rollNo: string | undefined;
          if (rollIdx >= 0) {
            const raw = row[rollIdx];
            rollNo = String(raw ?? "").trim() || undefined;
          }
          return { name, rollNo };
        })
        .filter((e) => e.name.length > 0);
    }

    return dataRows
      .map((row) => {
        if (!Array.isArray(row)) return { name: "" };
        const cells = row.map((c) => String(c ?? "").trim()).filter(Boolean);
        if (cells.length >= 2) {
          return { name: cells[1], rollNo: cells[0] };
        }
        return { name: cells[0] ?? "" };
      })
      .filter((e) => e.name.length > 0);
  }

  return jsonData
    .map((row) => {
      if (!Array.isArray(row)) return { name: "" };
      const cells = row.map((c) => String(c ?? "").trim()).filter(Boolean);
      if (cells.length >= 2) {
        return { name: cells[1], rollNo: cells[0] };
      }
      return { name: cells[0] ?? "" };
    })
    .filter((e) => e.name.length > 0);
}

function deduplicateEntries(entries: ExtractedEntry[]): ExtractedEntry[] {
  const seen = new Set<string>();
  const result: ExtractedEntry[] = [];
  for (const entry of entries) {
    const key = entry.name;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result;
}

function extractEntries(
  content: string,
  fileName: string,
  columnType: ColumnType,
  isBase64 = false,
): ExtractedEntry[] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const nameColumns = getNameColumns(columnType);

  try {
    let entries: ExtractedEntry[] = [];

    if (ext === "json") {
      entries = parseJsonEntries(content, nameColumns);
    } else if (ext === "xlsx" || ext === "xls") {
      let buffer: ArrayBuffer;
      if (isBase64) {
        const binary = atob(content);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        buffer = bytes.buffer;
      } else {
        buffer = Uint8Array.from(content, (c) => c.charCodeAt(0)).buffer;
      }
      entries = parseSpreadsheetEntries(buffer, nameColumns);
    } else {
      entries = parseTextRows(content, nameColumns);
    }

    entries = deduplicateEntries(entries);

    if (entries.length === 0) {
      if (columnType === "student") {
        throw new DataParseError("No students were found in this file.");
      }
      throw new DataParseError("No topics were found in this file.");
    }

    return entries;
  } catch (err) {
    if (err instanceof DataParseError) throw err;
    if (err instanceof SyntaxError) {
      throw new DataParseError("Unable to read this file.");
    }
    throw new DataParseError("Unsupported or corrupted file.");
  }
}

export function parseStudentFile(
  content: string,
  fileName: string,
  isBase64 = false,
): string[] {
  return extractEntries(content, fileName, "student", isBase64).map(
    (e) => e.name,
  );
}

export function parseTopicFile(
  content: string,
  fileName: string,
  isBase64 = false,
): string[] {
  return extractEntries(content, fileName, "topic", isBase64).map(
    (e) => e.name,
  );
}

export function extractStudentEntries(
  content: string,
  fileName: string,
  isBase64 = false,
): ExtractedEntry[] {
  return extractEntries(content, fileName, "student", isBase64);
}
