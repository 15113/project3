// ==UserScript==
// @name         Gemini-to-Sheet Bridge (Safari Optimized)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automates Gemini prompt injection and sends results back to Google Sheets
// @author       You
// @match        https://gemini.google.com/app*
// @updateURL    https://raw.githubusercontent.com/15113/project3/main/tampermonkey/gemini-to-sheet.user.js
// @downloadURL  https://raw.githubusercontent.com/15113/project3/main/tampermonkey/gemini-to-sheet.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      script.google.com
// @connect      script.googleusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    // Configuration priority:
    // 1. Tampermonkey Storage (GM_getValue)
    let WEBAPP_URL = GM_getValue("WEBAPP_URL", "");
    let SECRET_KEY = GM_getValue("SECRET_KEY", "");

    // Register menu commands to set config manually if needed
    GM_registerMenuCommand("Set Web App URL", () => {
        const url = prompt("Enter your Google Apps Script Web App URL:", WEBAPP_URL);
        if (url !== null) {
            GM_setValue("WEBAPP_URL", url);
            location.reload();
        }
    });

    GM_registerMenuCommand("Set Secret Key", () => {
        const key = prompt("Enter your Secret Key:", SECRET_KEY);
        if (key !== null) {
            GM_setValue("SECRET_KEY", key);
            location.reload();
        }
    });

    function checkConfig() {
        if (!WEBAPP_URL || !SECRET_KEY) {
            console.warn("Gemini-to-Sheet: Configuration missing. Use the Tampermonkey menu to set WEBAPP_URL and SECRET_KEY.");
            return false;
        }
        return true;
    }

    function runAutomation() {
        if (!checkConfig()) return;
        const hash = window.location.hash;

        // Only run if the URL has a prompt (the hash)
        if (!hash || hash.length < 10) return;

        // 1. Extract the prompt and clear the URL hash for cleanliness
        const prompt = decodeURIComponent(hash.substring(1));
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt.toLowerCase().startsWith("create a table with columns")) {
            console.log("Hash detected, but it's not a report prompt. Skipping automation.");
            return;
        }
        
        window.history.replaceState(null, null, ' ');

        console.log("Automation triggered. Waiting for Gemini UI...");

        // 2. Wait for the text box and send button to load
        const checkUI = setInterval(() => {
            const textBox = document.querySelector('div[contenteditable="true"]');
            const sendButton = document.querySelector('button[aria-label="Send message"]');

            if (textBox && sendButton) {
                clearInterval(checkUI);

                // Inject text
                textBox.innerText = cleanPrompt;
                textBox.dispatchEvent(new Event('input', { bubbles: true }));

                // Click send after a brief delay
                setTimeout(() => {
                    sendButton.click();
                    console.log("Prompt sent. Watching for table response...");
                    watchForResponse();
                }, 800);
            }
        }, 1000);
    }

    function watchForResponse() {
        // Wait for Gemini to stop "typing" and for a table to appear with the export icon
        const checkFinish = setInterval(() => {
            const isGenerating = document.querySelector('button[aria-label="Stop generating"]');
            const table = document.querySelector('table');
            const exportIcon = document.querySelector('span.export-sheets-icon');

            if (!isGenerating && table && exportIcon) {
                clearInterval(checkFinish);
                console.log("Table and export icon found. Scraping data...");
                // Add a larger delay to ensure table rendering is complete
                setTimeout(() => scrapeAndSend(table), 5000);
            }
        }, 2000);
    }

    function scrapeAndSend(tableElement) {
        // Convert table rows to a 2D Array, skipping the header row
        const rows = Array.from(tableElement.querySelectorAll('tr')).slice(1);
        const tableData = rows.map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        );

        console.log("Sending data to Google Sheets...");

        // Use GM_xmlhttpRequest to bypass Safari CORS restrictions
        GM_xmlhttpRequest({
            method: "POST",
            url: WEBAPP_URL,
            data: JSON.stringify({
                key: SECRET_KEY,
                tableData: tableData
            }),
            headers: {
                "Content-Type": "application/json"
            },
            onload: function(response) {
                if (response.responseText.includes("Success")) {
                    console.log("Data successfully sent! Closing tab in 2 seconds...");
                    // Give the user a moment to see the success message in console
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    alert("❌ Error: " + response.responseText);
                }
            },
            onerror: function(err) {
                alert("❌ Connection failed. Check your Web App URL and Safari permissions.\n\nDetails: " + (err.error || err.statusText || "Unknown error"));
            }
        });
    }

    // Initialize on load and on URL changes (since Gemini is a Single Page App)
    window.addEventListener('load', runAutomation);
    window.addEventListener('hashchange', runAutomation);

})();