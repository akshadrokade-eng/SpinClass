import * as XLSX from "xlsx";

export class DataParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataParseError";
  }
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

const STUDENT_COLUMNS = [
  "name",
  "student name",
  "full name",
  "student",
  "member name",
];

const TOPIC_COLUMNS = [
  "topic",
  "topics",
  "subject",
  "title",
  "question topic",
];

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const tabCount = (firstLine.match(/\t/g) ?? []).length;

  if (tabCount > 0 && tabCount >= commaCount && tabCount >= semicolonCount) {
    return "\t";
  }
  if (semicolonCount > commaCount) return ";";
  return ",";
}

function hasAnyDelimiter(line: string): boolean {
  return /[,;\t]/.test(line);
}

function findColumnIndex(
  headers: string[],
  candidates: string[],
): number {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const idx = lower.indexOf(c);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseTextContent(content: string, columnNames: string[]): string[] {
  let text = stripBom(content);
  text = normalizeLineEndings(text);
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0].trim();
  const singleColumn = !hasAnyDelimiter(firstLine);

  if (singleColumn) {
    const firstLower = lines[0].trim().toLowerCase();
    const isHeader = columnNames.some((c) => firstLower === c);
    const dataLines = isHeader ? lines.slice(1) : lines;
    return dataLines.map((l) => l.trim()).filter(Boolean);
  }

  const delimiter = detectDelimiter(firstLine);
  const rows: string[][] = [];
  for (const line of lines) {
    const cells = line.split(delimiter).map((c) => c.trim());
    rows.push(cells);
  }

  if (rows.length === 0) return [];

  const firstRow = rows[0];
  const hasHeader = firstRow.some((cell) =>
    columnNames.some((c) => cell.trim().toLowerCase() === c),
  );

  if (hasHeader) {
    const nameIdx = findColumnIndex(firstRow, columnNames);
    const dataRows = rows.slice(1);
    if (nameIdx >= 0) {
      return dataRows
        .map((row) => (row[nameIdx] ?? "").trim())
        .filter(Boolean);
    }
    return dataRows
      .map((row) => row.filter(Boolean).join(" ").trim())
      .filter(Boolean);
  }

  return rows
    .map((row) => row.filter(Boolean).join(" ").trim())
    .filter(Boolean);
}

function parseJsonContent(content: string, columnNames: string[]): string[] {
  const data = JSON.parse(content) as unknown;

  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    const first = data[0];
    if (typeof first === "string") {
      return data.filter((item): item is string => typeof item === "string" && (item as string).trim().length > 0).map((s) => s.trim());
    }
    if (typeof first === "object" && first !== null) {
      const keys = Object.keys(first as Record<string, unknown>);
      const nameKey = keys.find((k) =>
        columnNames.includes(k.trim().toLowerCase()),
      );
      if (nameKey) {
        return data
          .map((item) => {
            const obj = item as Record<string, unknown>;
            const val = obj[nameKey];
            return typeof val === "string" ? val.trim() : "";
          })
          .filter(Boolean);
      }
      return data
        .map((item) => {
          const obj = item as Record<string, unknown>;
          return Object.values(obj)
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean)
            .join(" ");
        })
        .filter(Boolean);
    }
  }

  return [];
}

function parseSpreadsheetContent(
  buffer: ArrayBuffer,
  columnNames: string[],
): string[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
  });

  if (jsonData.length === 0) return [];

  const firstRow = jsonData[0];
  if (!Array.isArray(firstRow)) return [];

  const headers = firstRow.map((h) => String(h ?? "").trim());
  const hasHeader = headers.some((h) =>
    columnNames.includes(h.toLowerCase()),
  );

  if (hasHeader) {
    const nameIdx = findColumnIndex(headers, columnNames);
    const dataRows = jsonData.slice(1);
    if (nameIdx >= 0) {
      return dataRows
        .map((row) => {
          if (Array.isArray(row)) {
            return String(row[nameIdx] ?? "").trim();
          }
          return "";
        })
        .filter(Boolean);
    }
    return dataRows
      .map((row) => {
        if (Array.isArray(row)) {
          return row
            .map((c) => String(c ?? "").trim())
            .filter(Boolean)
            .join(" ");
        }
        return "";
      })
      .filter(Boolean);
  }

  return jsonData
    .map((row) => {
      if (Array.isArray(row)) {
        return row
          .map((c) => String(c ?? "").trim())
          .filter(Boolean)
          .join(" ");
      }
      return "";
    })
    .filter(Boolean);
}

function deduplicate(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}

export function parseStudentFile(
  content: string,
  fileName: string,
  isBase64 = false,
): string[] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  try {
    let items: string[] = [];

    if (ext === "json") {
      items = parseJsonContent(content, STUDENT_COLUMNS);
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
      items = parseSpreadsheetContent(buffer, STUDENT_COLUMNS);
    } else {
      items = parseTextContent(content, STUDENT_COLUMNS);
    }

    items = deduplicate(items);

    if (items.length === 0) {
      throw new DataParseError(
        "Could not find any students in this file.",
      );
    }

    return items;
  } catch (err) {
    if (err instanceof DataParseError) throw err;
    if (err instanceof SyntaxError) {
      throw new DataParseError("Could not read this file.");
    }
    throw new DataParseError("Could not read this file.");
  }
}

export function parseTopicFile(
  content: string,
  fileName: string,
  isBase64 = false,
): string[] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  try {
    let items: string[] = [];

    if (ext === "json") {
      items = parseJsonContent(content, TOPIC_COLUMNS);
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
      items = parseSpreadsheetContent(buffer, TOPIC_COLUMNS);
    } else {
      items = parseTextContent(content, TOPIC_COLUMNS);
    }

    items = deduplicate(items);

    if (items.length === 0) {
      throw new DataParseError("Could not find any topics in this file.");
    }

    return items;
  } catch (err) {
    if (err instanceof DataParseError) throw err;
    if (err instanceof SyntaxError) {
      throw new DataParseError("Could not read this file.");
    }
    throw new DataParseError("Could not read this file.");
  }
}
