import "server-only";
import { google, type sheets_v4 } from "googleapis";
import type { SheetsConfig } from "@/server/env";
import type { SheetRow } from "./table";

type SheetTab = { title: string; sheetId: number | null };

function createSheetsApi(config: SheetsConfig): sheets_v4.Sheets {
  if (config.auth.kind === "apiKey") {
    return google.sheets({ version: "v4", auth: config.auth.apiKey });
  }

  const auth = new google.auth.JWT({
    email: config.auth.email,
    key: config.auth.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
  return google.sheets({ version: "v4", auth });
}

export type SheetsReader = {
  listTabs: () => Promise<SheetTab[]>;
  readTab: (title: string) => Promise<SheetRow[]>;
};

export function createSheetsReader(config: SheetsConfig): SheetsReader {
  const api = createSheetsApi(config);

  return {
    async listTabs() {
      const response = await api.spreadsheets.get({ spreadsheetId: config.spreadsheetId });
      return (response.data.sheets ?? []).map((sheet) => ({
        title: sheet.properties?.title ?? "",
        sheetId: sheet.properties?.sheetId ?? null
      }));
    },
    async readTab(title: string) {
      const response = await api.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `'${title.replace(/'/g, "''")}'!A1:Z`
      });
      const values: unknown[][] = response.data.values ?? [];
      return values.map((row) => row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))));
    }
  };
}

/** Explicit tab name first, then a tab whose title mentions "product", then the first tab. */
export function pickProductsTab(tabs: readonly SheetTab[], preferred?: string): string | null {
  if (preferred && tabs.some((tab) => tab.title === preferred)) return preferred;
  const byTitle = tabs.find((tab) => {
    const title = tab.title.toLowerCase();
    return title.includes("product") && !title.includes("gallery") && !title.includes("image");
  });
  return (byTitle ?? tabs.find((tab) => tab.sheetId === 0) ?? tabs[0])?.title ?? null;
}

/** Explicit tab name first, then a tab whose title mentions gallery/showcase/media. */
export function pickGalleryTab(tabs: readonly SheetTab[], preferred?: string): string | null {
  if (preferred && tabs.some((tab) => tab.title === preferred)) return preferred;
  return tabs.find((tab) => /gallery|showcase|media/i.test(tab.title))?.title ?? null;
}
