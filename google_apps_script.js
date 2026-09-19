/**
 * =========================================================================
 * BRAIN AI CLUB - GOOGLE SHEET INTEGRATION SCRIPT
 * =========================================================================
 * 
 * Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1ixdeiHk5y0UbghqRyD4Qql29zdBNw_bFZeE4zvJC5j0/edit
 * 
 * -------------------------------------------------------------------------
 * HINDI / ENGLISH INSTRUCTIONS (KAISE SETUP KAREIN):
 * -------------------------------------------------------------------------
 * 1. Apni Google Sheet open karein:
 *    https://docs.google.com/spreadsheets/d/1ixdeiHk5y0UbghqRyD4Qql29zdBNw_bFZeE4zvJC5j0/edit
 * 
 * 2. Top menu me "Extensions" par click karein -> aur "Apps Script" choose karein.
 * 
 * 3. Jo bhi default code wahan ho use DELETE karein, aur ye poora code wahan PASTE kar dein.
 * 
 * 4. Save icon (💾) par click karke save karein.
 * 
 * 5. Upar right corner me blue color ka "Deploy" button hoga -> click karein aur "New deployment" select karein.
 * 
 * 6. Left side me gear icon (⚙️) "Select type" par click karein -> "Web app" choose karein.
 * 
 * 7. Settings me ye select karein:
 *    - Description: Brain AI Club Form
 *    - Execute as: Me (<your-email>)
 *    - Who has access: Anyone   <--- [IMPORTANT: Isko "Anyone" hi rakhna hai!]
 * 
 * 8. "Deploy" button par click karein.
 * 
 * 9. Agar Google permission maange to:
 *    - "Authorize access" par click karein.
 *    - Apna Google account select karein.
 *    - "Advanced" link par click karein.
 *    - "Go to Untitled project (unsafe)" par click karein.
 *    - "Allow" par click karein.
 * 
 * 10. Ab aapko ek "Web app URL" milega (jo https://script.google.com/macros/s/... se start hota hai).
 *     Usko COPY kar lijiye.
 * 
 * 11. Apne `index.html` file me `GOOGLE_SHEET_SCRIPT_URL` ki jagah apna Web App URL paste kar dijiye!
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 10 second wait to prevent race conditions
  
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // Table Headers
    var headers = [
      "Timestamp",
      "Full Name",
      "Email Address",
      "WhatsApp Number",
      "Department / Branch",
      "Academic Year",
      "Roll No / PRN",
      "Technical Interests",
      "Why Join / Statement",
      "Portfolio / LinkedIn URL"
    ];
    
    // Auto create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#2563EB");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    
    var data = e.parameter;
    
    var newRow = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.fullName || "",
      data.email || "",
      "'" + (data.phone || ""), // Prefix with ' so Google Sheets doesn't remove leading 0
      data.department || "",
      data.year || "",
      "'" + (data.rollNo || ""),
      data.interests || "",
      data.whyJoin || "",
      data.portfolio || ""
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "message": "Registered successfully!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("BRAIN AI CLUB Registration API is active! Use POST method to submit form data.")
    .setMimeType(ContentService.MimeType.TEXT);
}
