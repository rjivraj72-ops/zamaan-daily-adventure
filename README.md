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

`question-bank.json` can regenerate itself on a schedule. A GitHub Actions workflow calls the Anthropic API with `question-generator-prompt.txt`, passes in the current set so wording is not repeated, checks the result with `scripts/validate-question-bank.mjs`, and **opens a Pull Request**. It never publishes directly: nothing reaches Zamaan until you review and merge the PR.

### Files

| File | Location |
|---|---|
| `scripts/generate-questions.mjs` | normal folder in the repo |
| `scripts/validate-question-bank.mjs` | normal folder in the repo |
| `rotate-questions.yml` | must live at `.github/workflows/rotate-questions.yml` |

GitHub's drag-and-drop upload skips hidden folders such as `.github`, so create the workflow file in the browser: **Add file > Create new file**, type `.github/workflows/rotate-questions.yml` in the name box (the folders are created as you type the slashes), paste the file's contents, and commit. A copy of the contents is in `workflow-to-create/rotate-questions.yml`; delete that copy afterwards.

### One-time setup

1. Create an API key at [console.anthropic.com](https://console.anthropic.com) (the account needs a small prepaid credit balance; $5 lasts years at this usage).
2. Repo **Settings > Secrets and variables > Actions > New repository secret**: name `ANTHROPIC_API_KEY`, paste the key.
3. Repo **Settings > Actions > General > Workflow permissions**: choose **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**. Without this the run succeeds but the Pull Request step fails.

### Running it

- **On a schedule:** the 1st and 15th of every month.
- **On demand:** **Actions** tab > **Rotate question bank** > **Run workflow**.

### Reviewing a set

A Pull Request titled "New question set ready for review" opens with you as reviewer. Open **Files changed**, skim `question-bank.json`, then **Merge pull request** or close it. Closing is always safe: the app keeps the current set.

### Checking a set by hand

```
node scripts/validate-question-bank.mjs question-bank.json
```

It reports anything the app could not play properly (duplicate card text, answer missing from the choices, wrong number of steps, and so on).

### If a run fails

No Pull Request opens and `question-bank.json` is untouched. The script retries once, feeding the problems back to the model. Open the failed run under **Actions** to see the reason.

### How new sets are used

The app plays its built-in days first and then appends every day in `question-bank.json`, repeating the whole cycle. Replacing the file replaces only the appended days, so the cycle length can change when a new set is merged.

### Model

`scripts/generate-questions.mjs` uses `claude-sonnet-5-5`. Set the `ANTHROPIC_MODEL` environment variable in the workflow to change it.
