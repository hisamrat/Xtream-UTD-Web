import "server-only";

export type SheetsAuth =
  | { kind: "apiKey"; apiKey: string }
  | { kind: "serviceAccount"; email: string; privateKey: string };

export type SheetsConfig = {
  spreadsheetId: string;
  auth: SheetsAuth;
  productsTab?: string;
  galleryTab?: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const DEFAULT_CATALOG_SPREADSHEET_ID = "10IOwFL58y9X6U5eEP24vPReFlgqZrjwsNhGRX2JUslU";
const DEFAULT_GOOGLE_SHEETS_API_KEY = "AIzaSyClMKINFTuAmLirG-oENC0MrG_kXMOF6Io";

/** Google Sheets configuration, or fallback defaults so zero configuration is needed on Vercel. */
export function getSheetsConfig(): SheetsConfig | null {
  const spreadsheetId = readEnv("GOOGLE_SHEETS_SPREADSHEET_ID") || DEFAULT_CATALOG_SPREADSHEET_ID;
  const apiKey = readEnv("GOOGLE_SHEETS_API_KEY") || DEFAULT_GOOGLE_SHEETS_API_KEY;
  const email = readEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = readEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  const auth: SheetsAuth | null = apiKey
    ? { kind: "apiKey", apiKey }
    : email && privateKey
      ? { kind: "serviceAccount", email, privateKey: privateKey.replace(/\\n/g, "\n") }
      : null;

  if (!auth) {
    return null;
  }

  return {
    spreadsheetId,
    auth,
    productsTab: readEnv("GOOGLE_SHEETS_PRODUCTS_TAB"),
    galleryTab: readEnv("GOOGLE_SHEETS_GALLERY_TAB")
  };
}

/** Seconds catalogue data may be served from cache before it is refetched. */
export const CATALOG_REVALIDATE_SECONDS = 60;
