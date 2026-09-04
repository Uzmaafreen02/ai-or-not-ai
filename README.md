# AI OR NOT AI? — Central Results Setup

Three files, one shared "class key":

| File | Runs where | Purpose |
|---|---|---|
| `index.html` | Every lab computer | The student game. Submits each result to your Google Sheet the moment a student finishes. |
| `google-apps-script-code.gs` | Google Apps Script (pasted in, not opened directly) | Receives submissions and writes them to the Sheet; also serves them to the dashboard. |
| `teacher-dashboard.html` | Your computer only | Reads the Sheet live and shows every student's result, sortable/filterable, with CSV export and print. |

## Step 1 — Create the Sheet and paste in the script

1. Go to [sheets.google.com](https://sheets.google.com) and create a new, blank spreadsheet. Name it something like `AI OR NOT AI - Results`.
2. In the menu, go to **Extensions → Apps Script**. A new tab opens with an empty `Code.gs`.
3. Delete anything in that editor and paste in the entire contents of `google-apps-script-code.gs`.
4. Near the top of the pasted code, change this line to your own secret passphrase (letters/numbers, no spaces needed, but avoid anything guessable):
   ```
   var DEFAULT_CLASS_KEY = "YOUR_SECRET_KEY_HERE";
   ```
5. In the toolbar at the top of the Apps Script editor, find the function dropdown (it may show `doPost` by default) and select **`setClassKey`**. Click **Run** (▶). The first time, Google will ask you to authorize the script — accept the permissions (it's your own script acting on your own Sheet).
6. You should see "Execution completed" in the log at the bottom. Your key is now stored.

## Step 2 — Deploy it as a Web App

1. Still in the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**, then authorize again if asked.
5. Copy the **Web app URL** shown (it looks like `https://script.google.com/macros/s/AKfycb.../exec`). You'll need it twice, below.

> If you ever edit the script later, you must create a **New deployment** (or a new version of the existing one) for changes to take effect — editing the code alone doesn't update a live Web App URL.

## Step 3 — Configure the student game

1. Open `index.html` in a text editor (Notepad, VS Code, etc. — not a browser).
2. Near the top of the `<script>` section, find:
   ```js
   var CONFIG = {
     GAS_WEB_APP_URL: "PASTE_YOUR_WEB_APP_URL_HERE",
     CLASS_KEY: "PASTE_YOUR_CLASS_KEY_HERE",
     ASSESSMENT_NAME: "AI OR NOT AI?"
   };
   ```
3. Replace the two placeholder strings with your real Web App URL and the exact same class key you set in Step 1.
4. Save the file, then copy this **same edited file** onto every computer in the lab (USB drive, shared network folder, or your school's usual method). Every computer needs the identical `GAS_WEB_APP_URL` and `CLASS_KEY`.

## Step 4 — Configure your dashboard

1. Open `teacher-dashboard.html` in Chrome, on your own computer.
2. Paste the same Web App URL and class key into the two fields at the top.
3. Click **Save & Load Results**. The page remembers these values locally on your computer for next time, so you won't need to re-enter them.

## Step 5 — Run the assessment

1. Put the configured `index.html` on every lab computer and have students open it and play as normal — no login, no setup on their end.
2. The moment each student finishes, the game tries to upload the result. They'll see a small status pill: "Uploaded to teacher's record" (success) or a clear warning if it failed (e.g. no internet on that PC) with a **Retry Upload** button. It never claims success when it hasn't actually uploaded.
3. If a computer was offline when a student finished, the game keeps quietly retrying that result in the background (and lets the student/teacher retry manually from the "This computer's backup" screen, reachable from the start screen) — so you don't lose results to a flaky connection.
4. From your own computer, open `teacher-dashboard.html` any time and click **Refresh** (or turn on auto-refresh) to see everyone's results as they come in — sortable by any column, filterable by class/section, with CSV export and a Print view for documentation.

## Notes on security

- No Google password, API key, or account credential is ever stored in `index.html` or `teacher-dashboard.html` — only the Web App URL and your chosen class key.
- The class key is a reasonable classroom-level safeguard, not strong security: anyone who has both the URL and the key could submit or read data. Don't post the URL publicly, and change the key (re-run `setClassKey` with a new value, then redeploy) if you ever suspect it has leaked.
- All results also remain in the Google Sheet itself permanently (until you delete rows), so the Sheet is your permanent, exportable record independent of the dashboard.
