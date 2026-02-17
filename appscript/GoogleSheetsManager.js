/**
 * Manage sheet operations like clearing data
 */
class GoogleSheetsManager {
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
