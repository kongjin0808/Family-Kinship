/**
 * Family Kinship backend (Google Apps Script)
 *
 * Sheet: a tab named "People" with this header row (exact spelling):
 *   ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank
 *
 * To register another family, add a lowercase family code below and set its
 * passcode in Script Properties. Keep passcodes out of this source file.
 */
const FAMILIES = {
  chong: {
    spreadsheetId: "1QCMJeN6OLV9NoFIrbK5mqczsBRO_pFjh1VmQZs5NVY8",
    sheetName: "People",
    passcodeProperty: "FAMILY_PASSCODE"
  },
  sio: {
    spreadsheetId: "1OgYMWKipHJGPHGEB7FsSnTmPgVxAT0e-7ObIhC9FFto",
    sheetName: "People",
    passcodeProperty: "SIO_FAMILY_PASSCODE"
  }
};

function doGet(e) {
  const familyName = String((e && e.parameter && e.parameter.family) || "Chong").trim();
  const family = FAMILIES[familyName.toLowerCase()];
  if (!family) return json_({ status: "error", message: "Unknown family" });

  const given = String((e && e.parameter && e.parameter.key) || "").trim();
  const expected = String(
    PropertiesService.getScriptProperties().getProperty(family.passcodeProperty) || ""
  ).trim();

  if (!expected || given !== expected) {
    return json_({ status: "error", message: "Invalid passcode" });
  }

  const spreadsheet = family.spreadsheetId
    ? SpreadsheetApp.openById(family.spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(family.sheetName);
  if (!sheet) return json_({ status: "error", message: "Sheet not found: " + family.sheetName });

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
