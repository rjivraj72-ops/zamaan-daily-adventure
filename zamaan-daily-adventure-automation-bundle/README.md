# Daily Adventure

A simple daily learning app with memory games, life-skill sequencing, Spanish cards, travel-themed Talk Time prompts with first-person/third-person answer hints, money math, granola sales/marketing business practice, family words/pronouns practice, rewards, and a 14-day progress calendar.

The learner view presents one required activity at a time, shows a clear daily path, keeps extra games locked until the 12 daily rounds are finished when Focus Mode is on, offers an optional halfway movement break, uses progressive retry hints, and supports a calmer system voice when available.

After the 12 daily rounds are complete, Zamaan can tap **Send Mom & Dad my update** to open WhatsApp with a ready-to-send completion summary, including his latest Talk Time answer when available. WhatsApp still asks him to choose/send the message, giving him ownership of the update.

Default PIN: `1234`

The PIN is meant as a simple privacy and routine screen. It is not bank-grade security because this is a static web app.

## Private Google Sheet Sync

1. Create a private Google Sheet.
2. Open Extensions > Apps Script.
3. Create two script files in the project and paste in the contents of `google-apps-script.js` and `WeeklyAdventure.gs`. Both are required — they call functions defined in each other, so the project will throw errors if only one is added.
4. Change `CHANGE_THIS_TO_A_PRIVATE_CODE` to a private family code (in `google-apps-script.js`).
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
- **Save as PDF** opens a clean print-ready Parent Report that can be saved as a PDF.
- **WhatsApp** and **Email / Outlook** open a concise prefilled report summary; attach the saved PDF when needed.
- **Difficulty level** changes the challenge level without increasing the number of daily rounds.
- **Focus Mode** keeps extra games locked until Zamaan finishes the 12 daily rounds.
- Test sync rows are ignored by the dashboard analysis.
- Extra Learning Game attempts and Spanish card attempts are logged separately so caregivers can see practice patterns without inflating daily completion.

The Apps Script also creates and refreshes these analysis tabs:

- `Dashboard`
- `Daily Summary`
- `Section Summary`
- `Recent Talk Time`
- `Learning Attempts`
- `skill_mastery`

If you update `google-apps-script.js` after the first setup, paste the new script into Apps Script and redeploy the web app. After redeploying, open `YOUR_WEB_APP_URL?familyCode=YOUR_FAMILY_CODE` once in your browser to refresh the dashboard from existing rows. (The family code is required so the refresh link can't be triggered by anyone who finds the bare Web App URL.)

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

## Automatic Question Rotation

`question-bank.json` can regenerate itself on a schedule instead of being updated by hand. A GitHub Actions workflow (`.github/workflows/rotate-questions.yml`) calls the Anthropic API with the existing `question-generator-prompt.txt`, validates the result, and **opens a Pull Request** with the new `question-bank.json` — it never publishes directly. Nothing reaches Zamaan until you review the PR and merge it.

### Setup (one-time)

1. Get an API key from [console.anthropic.com](https://console.anthropic.com).
2. In the GitHub repository, go to **Settings > Secrets and variables > Actions > New repository secret**.
3. Name it `ANTHROPIC_API_KEY` and paste in the key. GitHub encrypts it — nobody, including you, can view it again after saving, only reference it in workflows.
4. That's it. The workflow is already in the repo and will start running on its schedule.

### How it runs

- **On a schedule:** the 1st and 15th of every month (roughly every two weeks), automatically.
- **On demand:** open the repo's **Actions** tab, select **Rotate question bank** in the sidebar, click **Run workflow**. Useful if you want a fresh set sooner (for example, before a special theme or if Zamaan has mastered the current set early).

### Reviewing a generated set

When the workflow runs, it opens a Pull Request titled "New question set ready for review." Open it, click the **Files changed** tab, and skim the `question-bank.json` diff — check the names, places, and wording look right. Two outcomes:

- **Looks good:** click **Merge pull request**. The new set goes live the next time the app loads `question-bank.json`.
- **Something's off:** either edit directly in the PR before merging, or close the PR without merging — the app keeps using the current `question-bank.json` and nothing changes for Zamaan.

### If a run fails

If the API call fails or the model returns something that doesn't match the expected structure, the workflow fails loudly and **no PR is opened** — GitHub emails the repository owner automatically when a scheduled workflow fails. Check the failed run's log under the **Actions** tab for the specific reason (invalid JSON, a missing field, an API error, etc.). The current `question-bank.json` is never touched by a failed run.

### Cost

Each run is a single API call (roughly 4,000–8,000 tokens). At current Anthropic pricing this is a small fraction of a cent to a few cents per run — negligible for a run every two weeks.

