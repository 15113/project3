# Zoom Meeting Summary AI Automation

This Google Apps Script project automates the process of collecting Zoom meeting summaries from Gmail, summarizing them using Google Gemini, and storing the processed results back into a Google Sheet.

## Features

- **Gmail Collector**: Automatically pulls emails labeled "zoom notes" into a "Raw" sheet and marks them as processed in Gmail.
- **AI Launcher**: Bundles new meeting summaries and opens the Google Gemini interface with a pre-configured prompt to generate a structured report.
- **Receiver (Webhook)**: A `doPost` endpoint that receives structured data (likely from a Tampermonkey script) and appends it to the "Processed" sheet.
- **Custom Menu**: Adds an `🚀 AI Automation` menu to the Google Sheet for easy execution.

## Project Structure

- `Code.js`: Contains the main logic for collection, AI automation launching, and the webhook receiver.
- `Secrets.js`: (Ignored by Git) Contains sensitive configuration like `SECRET_KEY`.
- `appsscript.json`: Manifest file for the Google Apps Script project.
- `.clasp.json.template`: A template for the `clasp` configuration file. Copy this to `.clasp.json` and insert your `scriptId`.
- `Secrets.js.template`: A template for the secrets file. Copy this to `Secrets.js` and insert your `SECRET_KEY`.

## Configuration

The following constants can be configured:

- `SECRET_KEY`: Security key for the webhook (stored in `Secrets.js`).
- `RAW_SHEET`: Name of the sheet for raw data (default: `Raw`).
- `PROCESSED_SHEET`: Name of the sheet for processed data (default: `Processed`).
- `RAW_LABEL`: Gmail label to watch (default: `zoom notes`).
- `PROCESSED_LABEL`: Gmail label to apply after collection (default: `zoom notes processed`).

## Setup

1. **Google Sheets**:
   - Create a Google Sheet with two tabs named `Raw` and `Processed`.
   - The `Raw` sheet should have headers (e.g., Date, Subject, Body, Status).
   - The `Processed` sheet should have headers for: Date, Meeting Name, Accomplishments, Upcoming, Risks, Decisions, Status.

2. **Gmail Labels**:
   - Create labels `zoom notes` and `zoom notes processed` in your Gmail account.

3. **Apps Script Deployment**:
   - Copy `Secrets.js.template` to `Secrets.js` and update `SECRET_KEY` with your desired value.
   - Copy `.clasp.json.template` to `.clasp.json` and update `scriptId`.
   - Copy the code to a new Apps Script project bound to your spreadsheet.
   - Deploy as a **Web App**:
     - Execute as: `User accessing the web app` (or `Me` depending on preference).
     - Who has access: `Anyone` (if using with external tools like Tampermonkey) or `Myself`.
   - Note: The current `appsscript.json` is configured to execute as `USER_DEPLOYING` and access `MYSELF`.

## Usage

1. Open the Google Sheet.
2. Click on the `🚀 AI Automation` menu.
3. Select `Generate Weekly Report`.
4. The script will:
   - Collect emails from Gmail.
   - Update the `Raw` sheet.
   - Open a new tab with Gemini and the prompt ready.
   - Once Gemini generates the table, your external tool (Tampermonkey) should send the data back to the script's Web App URL.