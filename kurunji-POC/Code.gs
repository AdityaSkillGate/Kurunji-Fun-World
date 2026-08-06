// ==========================================
// KURUNJI FUN WORLD - APPS SCRIPT BACKEND
// ==========================================

// INSTRUCTION: 
// 1. Create a new Google Sheet.
// 2. Copy the long ID from the URL of your Google Sheet.
// 3. Paste it inside the quotes below:
var SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";

// Helper function to handle CORS and format output
function sendResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to ensure headers exist
function ensureHeaders(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return;
  }
  var firstRow = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
  if (String(firstRow[0]).indexOf("#") === 0 || firstRow[0] === "") { // Data found in row 1, headers missing
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

// Helper to get or create a sheet
function getOrCreateSheet(sheetName, headers) {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch(e) {}
  
  if (!ss) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (headers && headers.length > 0) {
    ensureHeaders(sheet, headers);
  }
  return sheet;
}

// RUN THIS FUNCTION ONCE MANUALLY TO INITIALIZE YOUR SHEETS
function initializeSetup() {
  getOrCreateSheet("Feedbacks", ["ID", "Date", "Guest Name", "Phone", "Rating", "Comments", "Status"]);
  getOrCreateSheet("Enquiries", ["ID", "Date", "Name", "Phone", "Email", "Type", "Message", "Status"]);
  
  var cmsSheet = getOrCreateSheet("CMS", ["Key", "Value"]);
  if (cmsSheet.getLastRow() <= 1) {
    var defaultCMS = [
      ["heroTitle", "Experience the Magic of Kurunji"],
      ["heroSubtitle", "Unforgettable adventures await at Kodaikanal's premier amusement park."],
      ["alertBanner", "Special Monsoon Offer: Get 20% off on all online bookings!"],
      ["seoTitle", "Kurunji Fun World | Kodaikanal"],
      ["seoDesc", "The best amusement park in Kodaikanal featuring VR arenas, 4D simulators, and family rides."],
      ["aboutIntro", "Kurunji Fun World brings cutting-edge entertainment to the serene hills of Kodaikanal."],
      ["hours", "Open Daily: 9:00 AM - 7:30 PM"]
    ];
    for (var i = 0; i < defaultCMS.length; i++) {
      cmsSheet.appendRow(defaultCMS[i]);
    }
  }

  var statsSheet = getOrCreateSheet("Statistics", ["Key", "Value"]);
  if (statsSheet.getLastRow() <= 1) {
    statsSheet.appendRow(["visitorsToday", 342]);
    statsSheet.appendRow(["visitorsMonthly", 8450]);
    statsSheet.appendRow(["averageRating", 4.8]);
    statsSheet.appendRow(["totalReviews", 1254]);
    statsSheet.appendRow(["averageHoursSpent", "3.5"]);
    statsSheet.appendRow(["repeatVisitorRate", 28]);
    statsSheet.appendRow(["mostLovedCategory", "VR Arena"]);
  }
}

// Generate unique ID
function generateId(prefix) {
  return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
}

// POST Handler (Writing Data)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = e.parameter.action;

    // 1. Submit Feedback
    if (action === "submitFeedback") {
      var sheet = getOrCreateSheet("Feedbacks", ["ID", "Date", "Guest Name", "Phone", "Email", "Rating", "Comments", "Status"]);
      var id = generateId("#F");
      var dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      var avgRating = 5;
      if (data.ratings && Object.keys(data.ratings).length > 0) {
        var sum = 0;
        var count = 0;
        for (var k in data.ratings) {
          sum += parseInt(data.ratings[k]);
          count++;
        }
        if (count > 0) avgRating = Math.round(sum / count);
      } else if (data.rating) {
        avgRating = data.rating;
      }
      
      var comments = data.suggestions || data.comments || "";
      var guestName = data.name || data.guestName || "";
      var email = data.email || "";
      var phone = data.phone || "";
      
      sheet.appendRow([id, dateStr, guestName, phone, email, avgRating, comments, "PENDING"]);
      return sendResponse({ status: "success" });
    }
    
    // 2. Submit Enquiry
    if (action === "submitEnquiry") {
      var sheet = getOrCreateSheet("Enquiries", ["ID", "Date", "Name", "Phone", "Email", "Type", "Message", "Status"]);
      var id = generateId("#E");
      var dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      sheet.appendRow([id, dateStr, data.name || "", data.phone || "", data.email || "", data.type || "", data.message || "", "NEW"]);
      return sendResponse({ status: "success" });
    }

    // 3. Update Feedback Status
    if (action === "updateFeedbackStatus") {
      var sheet = getOrCreateSheet("Feedbacks");
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheet.getRange(i + 1, 8).setValue(data.status); // Status is column 8
          return sendResponse({ success: true });
        }
      }
      return sendResponse({ success: false, message: "ID not found" });
    }

    // 4. Update Enquiry Status
    if (action === "updateEnquiryStatus") {
      var sheet = getOrCreateSheet("Enquiries");
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheet.getRange(i + 1, 8).setValue(data.status); // Status is column 8
          return sendResponse({ success: true });
        }
      }
      return sendResponse({ success: false, message: "ID not found" });
    }
    
    // 5. Update CMS Content
    if (action === "updateCMS") {
      var sheet = getOrCreateSheet("CMS");
      var rows = sheet.getDataRange().getValues();
      
      // Update existing keys
      for (var i = 1; i < rows.length; i++) {
        var key = rows[i][0];
        if (data[key] !== undefined) {
          sheet.getRange(i + 1, 2).setValue(data[key]);
        }
      }
      return sendResponse({ success: true });
    }
    
    return sendResponse({ status: "error", message: "Unknown action" });
  } catch(err) {
    return sendResponse({ status: "error", message: err.toString() });
  }
}

// GET Handler (Reading Data)
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "fetchAdminFeedbacks") {
    var sheet = getOrCreateSheet("Feedbacks", ["ID", "Date", "Guest Name", "Phone", "Email", "Rating", "Comments", "Status"]);
    var rows = sheet.getDataRange().getValues();
    var feedbacks = [];
    for (var i = rows.length - 1; i >= 0; i--) { // Reverse order (newest first)
      if (rows[i][0] && String(rows[i][0]).startsWith("#F")) {
        // Adjust for new Email column index
        feedbacks.push({
          id: rows[i][0],
          date: rows[i][1],
          guest: rows[i][2],
          phone: rows[i][3],
          email: rows[i][4],
          rating: rows[i][5],
          comments: rows[i][6],
          status: rows[i][7]
        });
      }
    }
    return sendResponse({ feedbacks: feedbacks, total: feedbacks.length, hasMore: false });
  }

  if (action === "fetchPublicFeedbacks") {
    var sheet = getOrCreateSheet("Feedbacks", ["ID", "Date", "Guest Name", "Phone", "Email", "Rating", "Comments", "Status"]);
    var rows = sheet.getDataRange().getValues();
    var feedbacks = [];
    for (var i = rows.length - 1; i >= 0; i--) { 
      if (rows[i][0] && String(rows[i][0]).startsWith("#F") && rows[i][7] === "APPROVED") {
        feedbacks.push({
          date: rows[i][1],
          guest: rows[i][2],
          rating: rows[i][5],
          comments: rows[i][6]
        });
      }
    }
    return sendResponse({ feedbacks: feedbacks });
  }
  
  if (action === "fetchAdminEnquiries") {
    var sheet = getOrCreateSheet("Enquiries", ["ID", "Date", "Name", "Phone", "Email", "Type", "Message", "Status"]);
    var rows = sheet.getDataRange().getValues();
    var enquiries = [];
    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i][0] && String(rows[i][0]).startsWith("#E")) {
        enquiries.push({
          id: rows[i][0],
          date: rows[i][1],
          name: rows[i][2],
          phone: rows[i][3],
          email: rows[i][4],
          type: rows[i][5],
          message: rows[i][6],
          status: rows[i][7]
        });
      }
    }
    return sendResponse({ enquiries: enquiries, total: enquiries.length, hasMore: false });
  }

  if (action === "fetchCMS") {
    var sheet = getOrCreateSheet("CMS");
    var rows = sheet.getDataRange().getValues();
    var cmsData = {};
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        cmsData[rows[i][0]] = rows[i][1];
      }
    }
    return sendResponse(cmsData);
  }
  
  if (action === "fetchStatistics") {
    var sheet = getOrCreateSheet("Statistics");
    var rows = sheet.getDataRange().getValues();
    var stats = {};
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        stats[rows[i][0]] = rows[i][1];
      }
    }
    // Hardcoded arrays/objects that are hard to store flat in sheets
    stats.demographics = { families: 45, tourists: 30, schoolGroups: 15, corporate: 10 };
    stats.historicalVisitors = [5000, 5200, 6100, 5800, 7200, 8450];
    
    return sendResponse(stats);
  }

  // Basic health check endpoint
  return sendResponse({ status: "success", message: "Kurunji Fun World API is active." });
}
