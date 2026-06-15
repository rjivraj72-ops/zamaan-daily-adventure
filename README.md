# Daily Adventure

A simple daily learning app with memory games, life-skill sequencing, Spanish cards, travel-themed Talk Time prompts with first-person/third-person answer hints, money math, granola sales/marketing business practice, family words/pronouns practice, rewards, and a 14-day progress calendar.

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
- **Parent view** loads a short shared Google Sheet dashboard inside the app: today, 7-day progress, top needs-practice areas, recent Talk Time, and learning-game accuracy.
- **Copy weekly AI prompt** prepares a parent-friendly prompt you can paste into ChatGPT or Gemini for a weekly summary.
- **Open ChatGPT** and **Open Gemini** copy the weekly prompt first, then open the AI assistant so you can paste it.
- Test sync rows are ignored by the dashboard analysis.
- Extra Learning Game attempts are logged separately so caregivers can see practice patterns without inflating daily completion.

The Apps Script also creates and refreshes these analysis tabs:

- `Dashboard`
- `Daily Summary`
- `Section Summary`
- `Recent Talk Time`
- `Learning Attempts`
- `Gemini Prompt`

Use `Gemini Prompt` by copying the prompt into Gemini when you want a parent-friendly progress analysis.

If you update `google-apps-script.js` after the first setup, paste the new script into Apps Script and redeploy the web app. After redeploying, open the Web App URL once in your browser to refresh the dashboard from existing rows.

## iPhone Sync Setup

After the Sync web app URL and family code are saved in Caregiver settings, use **Send iPhone setup link** or **Copy setup link**. Send that link by iMessage, email, or Notes, then open it on the iPhone. The iPhone will save the sync settings automatically.

On iPhone, Safari and the Home Screen app may keep separate settings. If sync settings disappear after adding the app to the Home Screen, open Caregiver settings in Safari, tap **Copy setup code**, then open the Home Screen app, paste the code into **Home Screen setup code**, and tap **Import setup code**.

## GitHub Pages

This folder is ready to publish with GitHub Pages. Put these files at the root of a GitHub repository:

- `index.html`
- `caregiver.html`
- `styles.css`
- `app.js`

Then enable GitHub Pages from the repository's `main` branch.
