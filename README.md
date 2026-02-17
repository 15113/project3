# Zoom Meeting Summary AI Automation

This Google Apps Script project automates the process of collecting Zoom meeting summaries from Gmail, summarizing them using Google Gemini, and storing the processed results back into a Google Sheet.

## Features

- **Gmail Collector**: Automatically pulls emails labeled "zoom notes" into a "Raw" sheet and marks them as processed in Gmail.
- **AI Launcher**: Bundles new meeting summaries and opens the Google Gemini interface with a pre-configured prompt to generate a structured report.
- **Receiver (Webhook)**: A `doPost` endpoint that receives structured data (likely from a Tampermonkey script) and appends it to the "Processed" sheet.
- **Custom Menu**: Adds an `🚀 AI Automation` menu to the Google Sheet for easy execution.

## Project Structure

- `appscript/`: Subdirectory containing the Google Apps Script code.
  - `Code.js`: Contains the webhook receiver and menu creation logic.
  - `ZoomMeetingSummarizer.js`: Contains the `ZoomMeetingSummarizer` class.
  - `Constants.js`: Contains configuration constants like sheet and label names.
  - `Secrets.js`: (Ignored by Git) Contains sensitive configuration like `SECRET_KEY`.
  - `appsscript.json`: Manifest file for the Google Apps Script project.
  - `.clasp.json.template`: A template for the `clasp` configuration file.
  - `Secrets.js.template`: A template for the secrets file.
- `tampermonkey/`: Subdirectory for the Tampermonkey script to be used in Gemini.
  - `gemini-to-sheet.user.js`: UserScript to automate Gemini and send data to Sheets.
- `.gitignore`: Files to be ignored by Git.
- `README.md`: This documentation file.
- `LICENSE`: Project license.

## Configuration

The following constants can be configured in `appscript/Constants.js`:

- `SECRET_KEY`: Security key for the webhook (stored in `Secrets.js`).
- `RAW_SHEET`: Name of the sheet for raw data (stored in `Constants.js`).
- `PROCESSED_SHEET`: Name of the sheet for processed data (stored in `Constants.js`).
- `RAW_LABEL`: Gmail label to watch (stored in `Constants.js`).
- `PROCESSED_LABEL`: Gmail label to apply after collection (stored in `Constants.js`).

## Setup

### 1. Local Environment (Clasp)

This project uses [clasp](https://github.com/google/clasp) for local development and deployment.

1. **Install clasp**:
   ```bash
   npm install -g @google/clasp
   ```
2. **Enable Apps Script API**:
   You must enable the Apps Script API in your Google account. Visit [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings) and toggle the **Google Apps Script API** to "On".
3. **Login**:
   ```bash
   clasp login
   ```
4. **Initialize Configuration**:
   - Enter the `appscript/` directory: `cd appscript`
   - Copy `.clasp.json.template` to `.clasp.json`.
   - Update the `scriptId` in `.clasp.json` with the ID of your Apps Script project (found in Project Settings).

### 2. Google Sheets
   - Create a Google Sheet with two tabs named `Raw` and `Processed`.
   - The `Raw` sheet should have headers (e.g., Date, Subject, Body, Status).
   - The `Processed` sheet should have headers for: Date, Meeting Name, Accomplishments, Upcoming, Risks, Decisions, Status.

### 3. Gmail Labels
   - Create labels `zoom notes` and `zoom notes processed` in your Gmail account.

### 4. Project Configuration & Deployment
   - In the `appscript/` directory, copy `Secrets.js.template` to `Secrets.js` and update `SECRET_KEY` with your desired value.
   - Push the code to Google:
     ```bash
     clasp push
     ```
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

### Troubleshooting
- **No data sent**: Ensure you have updated `WEBAPP_URL` in `tampermonkey/gemini-to-sheet.user.js` with your deployed Apps Script URL.
- **Unauthorized**: Ensure `SECRET_KEY` in `tampermonkey/gemini-to-sheet.user.js` matches `SECRET_KEY` in `appscript/Secrets.js`.
- **Pop-ups blocked**: Allow pop-ups for your Google Sheet to let it open Gemini.