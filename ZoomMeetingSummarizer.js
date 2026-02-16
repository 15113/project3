class ZoomMeetingSummarizer {
  /**
   * 1. COLLECTOR: Pulls "zoom notes" from Gmail into the "Raw" sheet
   */
  collectZoomSummaries() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = ss.getSheetByName(RAW_SHEET);

    // 1. Get the labels
    const sourceLabel = GmailApp.getUserLabelByName(RAW_LABEL);
    const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL);
    
    const threads = GmailApp.search('label:"zoom notes" -label:"' + PROCESSED_LABEL + '"');
    
    threads.forEach(thread => {
      const msg = thread.getMessages()[0];
      const date = msg.getDate();
      const subject = msg.getSubject();
      const body = msg.getPlainBody();

      // 3. Save to the Raw sheet
      rawSheet.appendRow([date, subject, body, "New"]);

      thread.addLabel(processedLabel);
      thread.removeLabel(sourceLabel);
    });
  }

  /**
   * 2. AI LAUNCHER: Bundles ONLY "New" rows and launches the Gemini Bridge
   */
  launchGeminiAutomation() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = ss.getSheetByName(RAW_SHEET);
    
    // Get all data, but if there's only a header, stop early
    const fullRange = rawSheet.getDataRange();
    if (fullRange.getNumRows() < 2) return SpreadsheetApp.getUi().alert("Raw sheet is empty!");
    
    const data = fullRange.getValues();
    let masterPrompt = "";
    let rowsToMark = [];

    // Loop through rows (starting at index 1 to skip header)
    for (let i = 1; i < data.length; i++) {
      const rowStatus = data[i][3]; // Column D
      
      if (rowStatus === "New") {
        const meetingSubject = data[i][1];
        const meetingBody = data[i][2];
        
        masterPrompt += `MEETING: ${meetingSubject}\nCONTENT: ${meetingBody}\n\n`;
        rowsToMark.push(i + 1); // Store row number for status update
      }
    }

    // If no rows were "New", exit gracefully
    if (!masterPrompt) {
      SpreadsheetApp.getUi().alert("No new meetings found with status 'New'.");
      return;
    }

    // Define the instructions that match your Tampermonkey safety gate
    const instructions = "Create a table with columns: Date, Meeting Name, Accomplishments, Upcoming, Risks, Decisions. Use bullets for text within cells. Data source:\n\n" + masterPrompt;
    
    // Update status in Sheet before opening Gemini
    rowsToMark.forEach(rowNumber => {
      rawSheet.getRange(rowNumber, 4).setValue("Processed");
    });

    // Open the Gemini Bridge in a new tab
    const html = `<script>
      const win = window.open("https://gemini.google.com/app#${encodeURIComponent(instructions)}", "_blank");
      if (win) {
        setTimeout(() => { google.script.host.close(); }, 500);
      } else {
        alert("Please allow popups for this sheet!");
      }
    </script>`;
    
    const gemini = HtmlService.createHtmlOutput(html)
      .setHeight(256)
      .setWidth(256);
      
    SpreadsheetApp.getUi().showModalDialog(gemini, "Opening Gemini...");
  }
}
