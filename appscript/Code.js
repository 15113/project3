/**
 * Summarize weekly meeting notes and send to Gemini for AI processing
 */
function createMeetingSummaryTable() {
  ZoomMeetingSummarizer.collectZoomSummaries();
  ZoomMeetingSummarizer.launchGeminiAutomation();
}

/**
 * UTILITY: Reset sheets and Gmail labels
 */
function reset() {
  GoogleAppsManager.truncateRawSheet();
  GoogleAppsManager.truncateProcessedSheet();
  GoogleAppsManager.resetZoomEmails();
}

/**
 * RECEIVER (Webhook): Catch data sent back from Tampermonkey
 */
function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  const result = ZoomMeetingSummarizer.processGeminiSummary(contents);
  return ContentService.createTextOutput(result);
}

/**
 * UI: Add custom menu to trigger the summarization process
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 AI Automation')
      .addItem('Generate Weekly Report', 'createMeetingSummaryTable')
      .addSeparator()
      .addItem('Reset', 'reset')
      .addToUi();
}
