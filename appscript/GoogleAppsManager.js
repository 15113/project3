/**
 * Manage sheet operations like clearing data
 */
class GoogleAppsManager {
  /**
   * Clears all rows from the RAW sheet except the title row (row 1)
   */
  truncateRawSheet() {
    this._truncateSheet(RAW_SHEET);
  }

  /**
   * Clears all rows from the PROCESSED sheet except the title row (row 1)
   */
  truncateProcessedSheet() {
    this._truncateSheet(PROCESSED_SHEET);
  }

  /**
   * Resets the labels of emails from "zoom notes processed" back to "zoom notes"
   */
  resetZoomEmails() {
    const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL);
    const sourceLabel = GmailApp.getUserLabelByName(RAW_LABEL);
    
    if (!processedLabel || !sourceLabel) return;

    const threads = processedLabel.getThreads();
    threads.forEach(thread => {
      thread.addLabel(sourceLabel);
      thread.removeLabel(processedLabel);
    });
  }

  /**
   * Internal helper to truncate a sheet while preserving the header row
   * @param {string} sheetName 
   * @private
   */
  _truncateSheet(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }
}
