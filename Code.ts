// Google Apps Script for Madara & Harshaka RSVP
// Paste into Extensions > Apps Script of the RSVP spreadsheet, run setup() once,
// then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).

const SPREADSHEET_ID = "1vJJ7Hix8fpNu50O55yh7HvQ9R3Ku17ng0TvcsOh4SJY";
const SHEET_NAME = "RSVP";
const HEADERS = ["Timestamp", "Name", "Attending", "Guests", "Wish"];

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

// Run once from the editor to create the RSVP sheet with headers.
function setup() {
  getSheet();
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = headerRange.getValues()[0];
  const headersOk = HEADERS.every(function (h, i) { return existing[i] === h; });

  if (!headersOk) {
    headerRange.setValues([HEADERS])
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#a8792c")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidths(2, HEADERS.length - 1, 200);
  }
  return sheet;
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = (e && e.parameter) || {};
    if (params.formName !== "rsvp") {
      return json({ result: "error", error: "Invalid formName" });
    }

    const sheet = getSheet();
    const guests = String(params["Guests"] || "");
    const attending = guests !== "0";

    sheet.appendRow([
      new Date(),
      params["Name"] || "",
      attending ? "Yes" : "No",
      attending ? Number(guests) || "" : 0,
      params["Wish"] || "",
    ]);

    return json({ result: "success", row: sheet.getLastRow() });
  } catch (error) {
    return json({ result: "error", error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
