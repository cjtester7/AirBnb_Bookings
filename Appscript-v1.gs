// Appscript-v1.gs
// AirBnb Host Booking System - Backend
// Replace YOUR_GOOGLE_SHEET_URL_HERE with your actual Google Sheet URL

// ⚠️  IMPORTANT: Replace the URL below with your GOOGLE SHEET URL (not the Apps Script URL).
// It should look like: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
// To find it: open your Google Sheet in the browser and copy the URL from the address bar.
var SHEET_URL = "REPLACE_WITH_YOUR_GOOGLE_SHEET_URL";
var BOOKINGS_SHEET = "Bookings";

function doGet(e) {
  var action = e.parameter.action;
  var result;

  try {
    if (action === "submitBooking") {
      result = submitBooking(e.parameter);
    } else if (action === "getBookings") {
      result = getBookings();
    } else if (action === "testConnection") {
      result = testConnection();
    } else if (action === "updateStatus") {
      result = updateStatus(e.parameter);
    } else {
      result = { success: false, error: "Unknown action: " + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.openByUrl(SHEET_URL);
  var sheet = ss.getSheetByName(BOOKINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(BOOKINGS_SHEET);
    sheet.appendRow([
      "UUID", "Timestamp", "Name", "Email",
      "CheckIn", "CheckOut", "Guests", "Message", "Status"
    ]);
  }
  return sheet;
}

function submitBooking(params) {
  var sheet = getSheet();
  var uuid = params.uuid || generateUUID();
  var timestamp = new Date().toISOString();

  sheet.appendRow([
    uuid,
    timestamp,
    params.name || "",
    params.email || "",
    params.checkIn || "",
    params.checkOut || "",
    params.guests || "",
    params.message || "",
    "Pending"
  ]);

  return {
    success: true,
    uuid: uuid,
    message: "Booking submitted successfully"
  };
}

function getBookings() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, bookings: [] };
  }

  var headers = data[0];
  var bookings = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    bookings.push(row);
  }

  return { success: true, bookings: bookings };
}

function updateStatus(params) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var uuidCol = headers.indexOf("UUID");
  var statusCol = headers.indexOf("Status");

  for (var i = 1; i < data.length; i++) {
    if (data[i][uuidCol] === params.uuid) {
      sheet.getRange(i + 1, statusCol + 1).setValue(params.status);
      return { success: true, message: "Status updated" };
    }
  }
  return { success: false, error: "Booking not found" };
}

function testConnection() {
  var sheet = getSheet();
  return {
    success: true,
    message: "Connected successfully",
    sheetName: sheet.getName(),
    rows: sheet.getLastRow()
  };
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
