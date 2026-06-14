# Daily Adventure

A simple daily learning app with memory games, life-skill sequencing, Spanish cards, travel-themed Talk Time prompts with sentence helpers, money math, granola sales/marketing business practice, rewards, and a 14-day progress calendar.

Default PIN: `1234`

The PIN is meant as a simple privacy and routine screen. It is not bank-grade security because this is a static web app.

## Private Google Sheet Sync

1. Create a private Google Sheet.
2. Open Extensions > Apps Script.
3. Paste the contents of `google-apps-script.js`.
4. Change `CHANGE_THIS_TO_A_PRIVATE_CODE` to a private family code.
5. Deploy as a web app.
6. Copy the web app URL into Caregiver settings in Daily Adventure.
7. Enter the same family code in Caregiver settings.

New completed rounds will be sent to the Sheet. The app still keeps a local report on the device.

Caregiver settings include **Test sync** and **Last synced**:

- **Test sync** sends a clearly labeled test row to `Daily Adventure Log`.
- **Last synced** shows the most recent time the app sent data from that device.
- Test sync rows are ignored by the dashboard analysis.

The Apps Script also creates and refreshes these analysis tabs:

- `Dashboard`
- `Daily Summary`
- `Section Summary`
- `Recent Talk Time`

If you update `google-apps-script.js` after the first setup, paste the new script into Apps Script and redeploy the web app. After redeploying, open the Web App URL once in your browser to refresh the dashboard from existing rows.

## iPhone Sync Setup

After the Sync web app URL and family code are saved in Caregiver settings, use **Send iPhone setup link** or **Copy setup link**. Send that link by iMessage, email, or Notes, then open it on the iPhone. The iPhone will save the sync settings automatically.

On iPhone, Safari and the Home Screen app may keep separate settings. If sync settings disappear after adding the app to the Home Screen, open Caregiver settings in Safari, tap **Copy setup code**, then open the Home Screen app, paste the code into **Home Screen setup code**, and tap **Import setup code**.

## GitHub Pages

This folder is ready to publish with GitHub Pages. Put these files at the root of a GitHub repository:

- `index.html`
- `styles.css`
- `app.js`

Then enable GitHub Pages from the repository's `main` branch.
