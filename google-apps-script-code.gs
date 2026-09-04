/**
 * AI OR NOT AI? — Central results backend
 * -----------------------------------------
 * Paste this entire file into: your Google Sheet → Extensions → Apps Script
 * (replace whatever is in Code.gs by default).
 *
 * ONE-TIME SETUP (see README.md for full walkthrough):
 *   1. Run the `setClassKey` function once (pick any menu item, then Run ▶) to store
 *      your secret class key. Change YOUR_SECRET_KEY_HERE below first.
 *   2. Deploy ▶ New deployment ▶ Type: Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   3. Copy the resulting Web App URL into:
 *        - index.html          → CONFIG.GAS_WEB_APP_URL
 *        - teacher-dashboard.html → same URL, entered into the "Web App URL" field
 *      Use the SAME class key you chose below in both places too.
 *
 * The sheet named "Results" is created automatically on first submission.
 */

// ⚠️ Change this to your own secret class key before running setClassKey().
var DEFAULT_CLASS_KEY = "YOUR_SECRET_KEY_HERE";

/**
 * Run this once from the Apps Script editor (select this function in the
 * toolbar dropdown, then click Run). It stores your class key so the web app
 * can check it on every request without hardcoding it in a public deployment.
 */
function setClassKey(){
  PropertiesService.getScriptProperties().setProperty('TEACHER_KEY', DEFAULT_CLASS_KEY);
}

var SHEET_NAME = "Results";
var HEADERS = [
  "Server Timestamp",
  "Submission Time (device)",
  "Student Name",
  "Class",
  "Section",
  "Assessment",
  "Score",
  "Total Marks",
  "Correct Answers",
  "Wrong Attempts",
  "Time Taken",
  "Date"
];

function getOrCreateSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet){
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getTeacherKey(){
  return PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');
}

function jsonResponse(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Called by the STUDENT GAME when a student finishes the assessment.
 * Expects a JSON body (sent as text/plain to avoid CORS preflight issues).
 */
function doPost(e){
  try{
    if (!e || !e.postData || !e.postData.contents){
      return jsonResponse({ status: "error", message: "No data received." });
    }
    var body = JSON.parse(e.postData.contents);
    var teacherKey = getTeacherKey();

    if (!teacherKey){
      return jsonResponse({ status: "error", message: "Server not configured: run setClassKey() first." });
    }
    if (body.key !== teacherKey){
      return jsonResponse({ status: "error", message: "Invalid class key." });
    }

    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),                       // Server Timestamp
      body.submissionTime || "",        // Submission Time (device)
      body.studentName || "",
      body.studentClass || "",
      body.studentSection || "",
      body.assessment || "AI OR NOT AI?",
      body.score,
      body.total,
      body.correct,
      body.wrongAttempts,
      body.timeTaken || "",
      body.date || ""
    ]);

    return jsonResponse({ status: "ok" });
  } catch (err){
    return jsonResponse({ status: "error", message: String(err) });
  }
}

/**
 * Called by the TEACHER DASHBOARD to fetch every submitted result.
 * Requires ?key=<your class key> as a query parameter.
 */
function doGet(e){
  try{
    var teacherKey = getTeacherKey();
    var suppliedKey = (e && e.parameter && e.parameter.key) ? e.parameter.key : "";

    if (!teacherKey){
      return jsonResponse({ status: "error", message: "Server not configured: run setClassKey() first." });
    }
    if (suppliedKey !== teacherKey){
      return jsonResponse({ status: "error", message: "Invalid or missing key." });
    }

    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length < 2){
      return jsonResponse({ status: "ok", results: [] });
    }

    var headers = data[0];
    var results = [];
    for (var i = 1; i < data.length; i++){
      var row = {};
      for (var j = 0; j < headers.length; j++){
        var val = data[i][j];
        row[headers[j]] = (val instanceof Date) ? val.toLocaleString() : val;
      }
      results.push(row);
    }
    return jsonResponse({ status: "ok", results: results });
  } catch (err){
    return jsonResponse({ status: "error", message: String(err) });
  }
}
