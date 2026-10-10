# Xtream UTD - Google Apps Script Integration Guide (v2.1)

This guide explains how to connect your **Xtream UTD** Admin Panel (`/xadmin`) and Storefront to your Google Sheet for real-time synchronization, with full **Header Protection** and **Product ID-Based Saving**.

---

## 1. Sheet Tabs & Layout

### Tab 1: `Website Product Information`
- **Row 1**: Search Bar & Top Utility controls (`Search By Product Name...`, `Search By Product No...`).
- **Row 2**: **Column Headers (21 Columns)**:
  ```
  Sr No | Product No 📍 | Slug 📍 | Title | Category | Price | Old Price | Stock | Badge | Accent | Short | Featured | New Arrival | Best Seller | Poster Image URL | Gallery Images URL | Features | Specifications | Colours Or Sizes Or Variants | Tags | Related Products
  ```
- **Row 3+**: Product data records (`refillable-perfume-bottle-8ml`, `cloud-mirror-tulip-light`, etc.).

### Tab 2: `WebSite Selling Information`
- **Row 1**: Customer Order Headers (21 Columns):
  ```
  Sr No | Date 📅 | Product No 📍 | Product Name 📌 | Customer Name | Phone Number | Address | Thana | District | Delivery Zone | Product Variants 🔖 | Quantity | Product Price | Delivery Charge | Total Amount 📌with delivery Charge | Delivery Platform | Paid Delivery Charge To Courier | Amount Received after calculate COD amount with platform charge % | Final Received Amount 📌 ( After Paid Delivery Fee ) | Delivery Status | Note
  ```

---

## 2. Deploying the Updated Apps Script in Google Sheets

1. Open your Google Spreadsheet:
   [Xtream UTD Google Spreadsheet](https://docs.google.com/spreadsheets/d/15DQKQJiuK4LQCgDau3GnAUZ43b6KNqiARRQEZ4pYplc)
2. In the top menu, click **Extensions** → **Apps Script**.
3. Replace the entire contents of `Code.gs` with the updated code from:
   [`scripts/google-apps-script/Code.gs`](./Code.gs)
4. Click **Save** (`Ctrl + S`).
5. In the top right, click **Deploy** → **Manage deployments**.
6. Click the pencil/edit icon on your active deployment, select **New version**, and click **Deploy**.
   *(Or click "Deploy" → "New deployment" → Web app → Execute as: Me → Who has access: Anyone).*

---

## 3. How to Restore Your Header Row Right Now

If your header row was previously overwritten:
- **Method 1 (Instant Click in Sheet)**: Refresh your Google Sheet. You will see a new menu at the top called **"Xtream UTD"**. Click **"Xtream UTD"** → **"Restore / Fix Header Row"**. It will immediately insert the complete 21-column header row at Row 2, nicely styled with bold headers and a clean background, without touching your search bar or products!
- **Method 2 (Automatic)**: The updated `Code.gs` automatically detects if the header row is missing whenever a product is saved or requested. If missing, it automatically inserts the header row at Row 2 above your products!

---

## 4. How Product ID-Based Saving Works

- **Checking Product ID**:
  When a product is saved from `/xadmin`:
  1. The script inspects the **Product No 📍 (ID)** (Column B) and **Slug 📍** (Column C).
  2. If a product with that ID or Slug already exists:
     - It **UPDATES** that exact product row in place.
     - It preserves the existing `Sr No` (row numbering).
     - It **never** touches or alters the header row.
  3. If the product is **NEW**:
     - It automatically saves the new product **AFTER THE LAST ROW OF DATA** (`sheet.getLastRow() + 1`).
     - It calculates the next `Sr No` automatically.
- **Batch Sync ("Push All to Sheet")**:
  - Replaces **only data rows** below the header. The search bar in Row 1 and the header in Row 2 are 100% protected and never cleared or overwritten.
