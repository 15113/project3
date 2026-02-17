/**
 * Summarize weekly meeting notes and send to Gemini for AI processing
 */
function createMeetingSummaryTable() {
  const summarizer = new ZoomMeetingSummarizer();
  summarizer.collectZoomSummaries();
  summarizer.launchGeminiAutomation();
}

/**
 * UTILITY: Truncate Raw and Processed sheets
 */
function truncateSheets() {
  const manager = new GoogleSheetsManager();
  manager.truncateRawSheet();
  manager.truncateProcessedSheet();
}

/**
 * RECEIVER (Webhook): Catch data sent back from Tampermonkey
 */
function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  if (contents.key !== SECRET_KEY) return ContentService.createTextOutput("Unauthorized");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const parsedSheet = ss.getSheetByName(PROCESSED_SHEET);

  contents.tableData.forEach(row => {
    // Ensure we have at least 6 columns, pad with empty strings if needed
    const rowData = [...row];
    while (rowData.length < 6) rowData.push("");
    
    parsedSheet.appendRow([
      rowData[0], // Date
      rowData[1], // Meeting Name
      rowData[2], // Accomplishments
      rowData[3], // Upcoming
      rowData[4], // Risks
      rowData[5], // Decisions
      "New"       // Status
    ]);
  });

  return ContentService.createTextOutput("Success");
}

/**
 * UI: Add custom menu to trigger the summarization process
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 AI Automation')
      .addItem('Generate Weekly Report', 'createMeetingSummaryTable')
      .addSeparator()
      .addItem('Clear Spreadsheet', 'truncateSheets')
      .addToUi();
}
