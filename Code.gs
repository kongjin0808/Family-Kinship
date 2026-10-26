/**
 * Family Kinship backend (Google Apps Script)
 *
 * Sheet: a tab named "People" with this header row (exact spelling):
 *   ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank
 *
 * Passcode: Project Settings (gear icon) > Script Properties > add
 *   FAMILY_PASSCODE = your-secret-word
 */
const SHEET_NAME = "People";

function doGet(e) {
  const given = String((e && e.parameter && e.parameter.key) || "").trim();
  const expected = String(
    PropertiesService.getScriptProperties().getProperty("FAMILY_PASSCODE") || ""
  ).trim();

  if (!expected || given !== expected) {
    return json_({ status: "error", message: "Invalid passcode" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ status: "error", message: "Sheet not found: " + SHEET_NAME });

  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(function (h) { return String(h).trim(); });

  const data = values
    .filter(function (row) { return String(row[0]).trim() !== ""; })
    .map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) {
        const v = row[i];
        obj[h] = (v === "" || v === null || v === undefined) ? null : String(v).trim();
      });
      return obj;
    });

  return json_({ status: "ok", data: data });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
