import "server-only";
import { google } from "googleapis";
import {
  formatOrderRowsForSheet,
  generateOrderId,
  type OrderRecord
} from "@/domain/commerce/order-record";

export type SaveOrderResult = {
  success: boolean;
  orderId: string;
  saved: boolean;
  destination: "apps-script-webhook" | "google-sheets-api" | "local-log";
  rowsCount: number;
  message?: string;
  error?: string;
};

const DEFAULT_ORDERS_SPREADSHEET_ID = "15DQKQJiuK4LQCgDau3GnAUZ43b6KNqiARRQEZ4pYplc";
const DEFAULT_ORDERS_SHEET_TAB = "WebSite Selling Information";

/**
 * Saves a customer order into the Google Sheet.
 * Supports:
 * 1. Google Apps Script Web App Webhook (ORDER_SHEET_WEBHOOK_URL) - Recommended, no GCP credentials needed.
 * 2. Google Sheets API v4 via Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).
 * 3. Fallback: logs locally to avoid blocking checkout if sheet sync is not yet configured.
 */
export async function saveOrder(order: OrderRecord): Promise<SaveOrderResult> {
  const orderId = order.orderId?.trim() || generateOrderId();
  const orderWithId: OrderRecord = { ...order, orderId };
  const rows = formatOrderRowsForSheet(orderWithId);

  // Method 1: Google Apps Script Web App Webhook (Recommended)
  const webhookUrl =
    process.env.ORDER_SHEET_WEBHOOK_URL?.trim() ||
    process.env.GOOGLE_SHEETS_ORDERS_WEBHOOK_URL?.trim();

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          createdAt: orderWithId.createdAt,
          customer: orderWithId.customer,
          items: orderWithId.items,
          financials: orderWithId.financials,
          orderMessage: orderWithId.orderMessage,
          rows
        }),
        redirect: "follow",
        signal: AbortSignal.timeout(20000)
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status} ${response.statusText}`);
      }

      return {
        success: true,
        orderId,
        saved: true,
        destination: "apps-script-webhook",
        rowsCount: rows.length,
        message: "Order successfully synced via Google Apps Script Webhook."
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[Orders] Failed to sync order to Google Apps Script webhook:", errorMessage);
      return {
        success: true,
        orderId,
        saved: false,
        destination: "apps-script-webhook",
        rowsCount: rows.length,
        error: errorMessage
      };
    }
  }

  // Method 2: Direct Google Sheets API via Service Account
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

  if (serviceAccountEmail && serviceAccountKey) {
    try {
      const spreadsheetId =
        process.env.ORDERS_SPREADSHEET_ID?.trim() || DEFAULT_ORDERS_SPREADSHEET_ID;
      const sheetTab =
        process.env.ORDERS_SHEET_TAB?.trim() || DEFAULT_ORDERS_SHEET_TAB;

      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      });

      const sheets = google.sheets({ version: "v4", auth });
      const range = `'${sheetTab.replace(/'/g, "''")}'!A:R`;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: rows
        }
      });

      return {
        success: true,
        orderId,
        saved: true,
        destination: "google-sheets-api",
        rowsCount: rows.length,
        message: "Order successfully appended to Google Sheet via Google Sheets API."
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[Orders] Failed to append order to Google Sheets API:", errorMessage);
      return {
        success: true,
        orderId,
        saved: false,
        destination: "google-sheets-api",
        rowsCount: rows.length,
        error: errorMessage
      };
    }
  }

  // Fallback: Local logging
  console.info(
    `[Orders Local Log] Order ${orderId} received for ${order.customer.fullName} (${order.customer.phone}). ` +
      `Configure ORDER_SHEET_WEBHOOK_URL in .env.local to sync directly to Google Sheet.`
  );

  return {
    success: true,
    orderId,
    saved: false,
    destination: "local-log",
    rowsCount: rows.length,
    message: "Order logged locally. Configure ORDER_SHEET_WEBHOOK_URL to sync to Google Sheet."
  };
}
