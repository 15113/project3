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
   * 2. AI LAUNCHER: Processes "New" rows one by one and launches the Gemini Bridge
   */
  launchGeminiAutomation() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = ss.getSheetByName(RAW_SHEET);
    
    // Get all data, but if there's only a header, stop early
    const fullRange = rawSheet.getDataRange();
    if (fullRange.getNumRows() < 2) return SpreadsheetApp.getUi().alert("Raw sheet is empty!");
    
    const data = fullRange.getValues();
    let prompts = [];

    // Loop through rows (starting at index 1 to skip header)
    for (let i = 1; i < data.length; i++) {
      const rowStatus = data[i][3]; // Column D
      
      if (rowStatus === "New") {
        const meetingSubject = data[i][1];
        const meetingBody = data[i][2];
        
        const prompt = `MEETING: ${meetingSubject}\nCONTENT: ${meetingBody}`;
        const instructions = "Create a table with columns: Date, Meeting Name, Accomplishments, Upcoming, Risks, Decisions. Use bullets for text within cells. Data source:\n\n" + prompt;
        
        prompts.push(instructions);
        
        // Update status in Sheet immediately
        rawSheet.getRange(i + 1, 4).setValue("Processed");
      }
    }

    // If no rows were "New", exit gracefully
    if (prompts.length === 0) {
      SpreadsheetApp.getUi().alert("No new meetings found with status 'New'.");
      return;
    }

    // Open the Gemini Bridge for each prompt
    const html = `
    <script>
      const prompts = ${JSON.stringify(prompts)};
      
      function openPrompts() {
        prompts.forEach((instructions, index) => {
          // Add a small delay between opening tabs to avoid browser blocking
          setTimeout(() => {
            const url = "https://gemini.google.com/app#" + encodeURIComponent(instructions);
            const win = window.open(url, "_blank");
            if (!win) {
              alert("Please allow popups for this sheet! Stopped at meeting " + (index + 1));
            }
            
            // Close the dialog after the last one is opened
            if (index === prompts.length - 1) {
              setTimeout(() => { google.script.host.close(); }, 1000);
            }
          }, index * 1000); 
        });
      }
      
      openPrompts();
    </script>
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <p>Opening ${prompts.length} meetings in Gemini...</p>
      <p>Please make sure popups are enabled.</p>
    </div>
    `;
    
    const gemini = HtmlService.createHtmlOutput(html)
      .setHeight(150)
      .setWidth(300);
      
    SpreadsheetApp.getUi().showModalDialog(gemini, "Processing AI Automation...");
  }
}
