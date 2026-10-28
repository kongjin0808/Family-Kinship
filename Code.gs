/**
 * Single-family Google Apps Script backend.
 *
 * Copy this same file into each family's Apps Script project, opened from
 * that family's Google Sheet. Each script reads only its bound sheet and
 * uses its own FAMILY_PASSCODE Script Property.
 *
 * Required People tab header:
 * ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank
 */
const DATA_SHEET_NAME = "People";
const PASSCODE_PROPERTY = "FAMILY_PASSCODE";

function doGet(e) {
  const userKey = String((e && e.parameter && e.parameter.key) || "").trim();
  const expected = String(
    PropertiesService.getScriptProperties().getProperty(PASSCODE_PROPERTY) || ""
  ).trim();

  if (!expected || userKey !== expected) {
    return json_({ status: "error", message: "Invalid family passkey" });
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet && spreadsheet.getSheetByName(DATA_SHEET_NAME);
  if (!sheet) return json_({ status: "error", message: "Sheet not found: " + DATA_SHEET_NAME });

  const rows = sheet.getDataRange().getValues();
  if (!rows.length) return json_({ status: "error", message: "People sheet is empty" });

  const headers = rows.shift().map(function (h) { return String(h).trim(); });
  const data = rows
    .filter(function (row) { return String(row[0] || "").trim() !== ""; })
    .map(function (row) {
      const record = {};
      headers.forEach(function (header, colIndex) {
        const value = row[colIndex];
        record[header] = (value === "" || value === null || value === undefined)
          ? null
          : String(value).trim();
      });
      return record;
    });

  return json_({ status: "success", data: data });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
