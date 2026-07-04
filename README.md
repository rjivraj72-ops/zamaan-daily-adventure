# Daily Adventure

A simple daily learning app with memory games, life-skill sequencing, Spanish cards, travel-themed Talk Time prompts with first-person/third-person answer hints, money math, granola sales/marketing business practice, family words/pronouns practice, rewards, and a 14-day progress calendar.

The learner view presents one required activity at a time, shows a clear daily path, keeps extra games locked until the 12 daily rounds are finished when Focus Mode is on, offers an optional halfway movement break, uses progressive retry hints, and supports a calmer system voice when available.

After the 12 daily rounds are complete, Zamaan can tap **Send Mom & Dad my update** to open WhatsApp with a ready-to-send completion summary, including his latest Talk Time answer when available. WhatsApp still asks him to choose/send the message, giving him ownership of the update.

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
- Parent View loads automatically when sync is configured and includes this-week/last-week comparisons, skill trends, and frequently missed questions.
- **What to Practice Next** uses the `skill_mastery` table to show the top 3 parent-friendly practice priorities.
- **Parent note** is stored on the parent device and included in the copied ChatGPT weekly prompt.
- **Difficulty level** changes the challenge level without increasing the number of daily rounds.
- **Focus Mode** keeps extra games locked until Zamaan finishes the 12 daily rounds.
- **Copy weekly AI prompt** prepares a parent-friendly prompt you can paste into your ChatGPT project for a weekly summary.
- **Open ChatGPT app** copies the weekly prompt first, then tries to open the native iOS ChatGPT app. A web fallback link is shown below the button.
- Test sync rows are ignored by the dashboard analysis.
- Extra Learning Game attempts and Spanish card attempts are logged separately so caregivers can see practice patterns without inflating daily completion.

The Apps Script also creates and refreshes these analysis tabs:

- `Dashboard`
- `Daily Summary`
- `Section Summary`
- `Recent Talk Time`
- `Learning Attempts`
- `skill_mastery`
- `ChatGPT Prompt`

Use `ChatGPT Prompt` by copying the prompt into your ChatGPT project when you want a parent-friendly progress analysis.

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
