/** Generic helpers for reading a sheet tab (a 2-D array of cell strings) by header names. */

export type SheetRow = readonly string[];

export type SheetTable = {
  headerRowIndex: number;
  columns: ReadonlyMap<string, number>;
  rows: readonly SheetRow[];
};

/** Lower-cases a header and collapses non-word characters to `_` ("Old Price" → "old_price"). */
export function normalizeHeader(header: string | undefined): string {
  return (header ?? "")
    .toLowerCase()
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Finds the first row (within the first `maxScan` rows) whose normalized headers satisfy
 * `isHeaderRow`, and returns the data rows below it.
 */
export function readTable(
  values: readonly SheetRow[],
  isHeaderRow: (headers: readonly string[]) => boolean,
  maxScan = 10
): SheetTable | null {
  for (let index = 0; index < Math.min(values.length, maxScan); index += 1) {
    const headers = (values[index] ?? []).map(normalizeHeader);
    if (isHeaderRow(headers)) {
      const columns = new Map<string, number>();
      headers.forEach((header, column) => {
        if (header) columns.set(header, column);
      });
      return { headerRowIndex: index, columns, rows: values.slice(index + 1) };
    }
  }

  return null;
}

/** Returns the trimmed value of the first alias column present in the table. */
export function getCell(table: SheetTable, row: SheetRow, ...aliases: string[]): string {
  for (const alias of aliases) {
    const column = table.columns.get(alias);
    if (column !== undefined && row[column] !== undefined) {
      return row[column].trim();
    }
  }
  return "";
}

export function pipeSplit(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** "Key: Value | Key2: Value2" → { Key: "Value", Key2: "Value2" } */
export function parseKeyValueList(value: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of pipeSplit(value)) {
    const separator = pair.indexOf(":");
    if (separator > 0) {
      const key = pair.slice(0, separator).trim();
      if (key) result[key] = pair.slice(separator + 1).trim();
    }
  }
  return result;
}

export function parseBoolean(value: string, fallback = false): boolean {
  const normalized = value.trim().toUpperCase();
  if (normalized === "TRUE") return true;
  if (normalized === "FALSE") return false;
  return fallback;
}

/** Parses "৳1,290" / "1290 BDT" style numbers; returns `fallback` when no number is present. */
export function parseLooseNumber(value: string, fallback: number): number {
  if (!value.trim()) return fallback;
  const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(parsed) ? fallback : parsed;
}
