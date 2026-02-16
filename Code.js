/**
 * Summarize weekly meeting notes and send to Gemini for AI processing
 */
function createMeetingSummaryTable() {
  const summarizer = new ZoomMeetingSummarizer();
  summarizer.collectZoomSummaries();
  summarizer.launchGeminiAutomation();
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
    parsedSheet.appendRow([row[0], row[1], row[2], row[3], row[4], row[5], "New"]);
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
      .addToUi();
}
