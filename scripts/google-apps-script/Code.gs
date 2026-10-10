/**
 * ============================================================================
 * XTREAM UTD - GOOGLE APPS SCRIPT WEB APP BACKEND (100% NON-DESTRUCTIVE)
 * ============================================================================
 * 
 * Guarantees:
 * 1. ZERO automatic changes on Deploy or GET requests. doGet is 100% READ-ONLY.
 * 2. It will NEVER overwrite, remove, insert, or clear your headers or search bar.
 * 3. When saving a product:
 *    - Searches for matching Product ID (or Slug) in your sheet.
 *    - If found: updates ONLY that specific product's row in place.
 *    - If NEW: saves strictly AFTER the last row of data.
 * 4. When customer places an order:
 *    - Appends the order row after the last row of "WebSite Selling Information".
 * ============================================================================
 */

const CONFIG = {
  PRODUCTS_TAB: "Website Product Information",
  ORDERS_TAB: "WebSite Selling Information",
  GALLERY_TAB: "Product Image and Video Gallery"
};

/**
 * Handle GET Requests
 * 100% READ-ONLY. NEVER MODIFIES THE SPREADSHEET.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = {
      success: true,
      timestamp: new Date().toISOString()
    };

    const productSheet = ss.getSheetByName(CONFIG.PRODUCTS_TAB);
    if (productSheet) {
      result.productsRows = productSheet.getDataRange().getValues();
    } else {
      result.productsRows = [];
    }

    const gallerySheet = ss.getSheetByName(CONFIG.GALLERY_TAB);
    if (gallerySheet) {
      result.galleryRows = gallerySheet.getDataRange().getValues();
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST Requests
 * ONLY runs when an admin saves/deletes a product or a customer places an order.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty POST body." });
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Customer Order Checkout
    if ((payload.rows && Array.isArray(payload.rows) && !payload.action) || payload.action === "order") {
      return handleCustomerOrder(ss, payload);
    }

    // 2. Save Product (Check ID -> update in place, or append after last row)
    if (payload.action === "save_product") {
      return handleSaveProduct(ss, payload);
    }

    // 3. Delete Product (Deletes only the matching row)
    if (payload.action === "delete_product") {
      return handleDeleteProduct(ss, payload);
    }

    return jsonResponse({
      success: false,
      error: "Unrecognized action: " + (payload.action || "none")
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

/**
 * Compare two IDs (supports numbers, strings, and 'prd-' prefixes)
 */
function compareIds(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  const sa = String(a).trim().toLowerCase();
  const sb = String(b).trim().toLowerCase();
  if (!sa || !sb) return false;
  if (sa === sb) return true;
  const ca = sa.replace(/^prd-/, "");
  const cb = sb.replace(/^prd-/, "");
  return ca && cb && ca === cb;
}

/**
 * Compare two slugs
 */
function compareSlugs(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  const sa = String(a).trim().toLowerCase();
  const sb = String(b).trim().toLowerCase();
  if (!sa || !sb) return false;
  return sa === sb;
}

/**
 * Save Product:
 * Checks Product ID (Col B / index 1) or Slug (Col C / index 2).
 * - If found: updates ONLY that row.
 * - If NOT found: appends strictly after the last row of data.
 * NEVER touches headers, row 1, or search bar!
 */
function handleSaveProduct(ss, payload) {
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_TAB);
  if (!sheet) {
    return jsonResponse({
      success: false,
      error: 'Tab "' + CONFIG.PRODUCTS_TAB + '" not found.'
    });
  }

  const rowData = payload.row;
  if (!rowData || !Array.isArray(rowData)) {
    return jsonResponse({
      success: false,
      error: "Missing product row array."
    });
  }

  const targetId = String(payload.productId || (payload.product && payload.product.id) || rowData[1] || "").trim();
  const targetSlug = String(payload.slug || (payload.product && payload.product.slug) || rowData[2] || "").trim();

  const allData = sheet.getDataRange().getValues();
  let matchedRowIndex = -1; // 1-based index in sheet

  // Scan through existing data rows (skipping header row)
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const curId = row[1];   // Column B: Product No 📍
    const curSlug = row[2]; // Column C: Slug 📍

    // Don't match header row labels
    const isHeaderLabel =
      String(curSlug).toLowerCase().indexOf("slug") !== -1 ||
      String(curId).toLowerCase().indexOf("product no") !== -1;
    if (isHeaderLabel) continue;

    if (compareIds(curId, targetId) || compareSlugs(curSlug, targetSlug)) {
      matchedRowIndex = i + 1; // 1-based row number in Google Sheets
      break;
    }
  }

  // CASE 1: PRODUCT EXISTS -> UPDATE THAT ROW ONLY
  if (matchedRowIndex > 0) {
    // Keep existing Sr No (Col A) from the sheet
    const existingSr = sheet.getRange(matchedRowIndex, 1).getValue();
    if (existingSr) {
      rowData[0] = existingSr;
    }
    if (targetId && !rowData[1]) {
      rowData[1] = targetId;
    }

    sheet.getRange(matchedRowIndex, 1, 1, rowData.length).setValues([rowData]);

    return jsonResponse({
      success: true,
      action: "updated",
      rowIndex: matchedRowIndex,
      productId: targetId,
      message: 'Product ' + targetId + ' updated in row ' + matchedRowIndex
    });
  }

  // CASE 2: NEW PRODUCT -> APPEND AFTER THE LAST ROW OF DATA
  const lastRow = sheet.getLastRow();
  const appendRowIndex = lastRow + 1;

  // Determine next Sr No from previous row if possible
  const prevSr = lastRow >= 2 ? sheet.getRange(lastRow, 1).getValue() : 0;
  const nextSr = !isNaN(Number(prevSr)) && Number(prevSr) > 0 ? Number(prevSr) + 1 : appendRowIndex - 2;
  rowData[0] = nextSr;

  if (targetId && !rowData[1]) {
    rowData[1] = targetId;
  }

  sheet.getRange(appendRowIndex, 1, 1, rowData.length).setValues([rowData]);

  return jsonResponse({
    success: true,
    action: "created",
    rowIndex: appendRowIndex,
    productId: targetId,
    message: 'New product ' + targetId + ' saved after last row (row ' + appendRowIndex + ').'
  });
}

/**
 * Delete Product: Deletes only the matching row, never touches headers
 */
function handleDeleteProduct(ss, payload) {
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_TAB);
  if (!sheet) {
    return jsonResponse({ success: false, error: 'Tab "' + CONFIG.PRODUCTS_TAB + '" not found.' });
  }

  const targetId = String(payload.productId || "").trim();
  const targetSlug = String(payload.slug || "").trim();

  const allData = sheet.getDataRange().getValues();
  for (let i = 1; i < allData.length; i++) {
    const curId = allData[i][1];
    const curSlug = allData[i][2];

    const isHeaderLabel =
      String(curSlug).toLowerCase().indexOf("slug") !== -1 ||
      String(curId).toLowerCase().indexOf("product no") !== -1;
    if (isHeaderLabel) continue;

    if (compareIds(curId, targetId) || compareSlugs(curSlug, targetSlug)) {
      const deleteRow = i + 1;
      sheet.deleteRow(deleteRow);
      return jsonResponse({
        success: true,
        action: "deleted",
        rowIndex: deleteRow,
        message: 'Product deleted from row ' + deleteRow
      });
    }
  }

  return jsonResponse({ success: false, message: "Product not found to delete." });
}

/**
 * Customer Order checkout appends to "WebSite Selling Information"
 */
function handleCustomerOrder(ss, payload) {
  const sheet = ss.getSheetByName(CONFIG.ORDERS_TAB);
  if (!sheet) {
    return jsonResponse({
      success: false,
      error: 'Tab "' + CONFIG.ORDERS_TAB + '" not found.'
    });
  }

  const rows = payload.rows;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return jsonResponse({ success: false, error: "Order rows empty." });
  }

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);

  return jsonResponse({
    success: true,
    orderId: payload.orderId || "",
    rowsAppended: rows.length
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
