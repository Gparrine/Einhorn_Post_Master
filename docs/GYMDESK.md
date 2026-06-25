# Gymdesk setup (manual-assist)

Gymdesk does **not** offer a public API for updating a scheduled class **Description** field. Einhorn Postmaster uses **manual-assist**, similar to Facebook:

1. You click **Gymdesk** and confirm
2. Post text is **copied to your clipboard**
3. **Gymdesk** opens in a new tab (login or schedule)
4. You find the session for the **date in your post**, open **Edit Session → Description**, paste, and save

The green checkmark means copy + open succeeded — not that Gymdesk saved the description automatically.

---

## Step 1 — Include a date in every post

Gymdesk matching relies on a **month and day** in your post text. The **current year is assumed**.

Examples:

- `June 28`
- `6/28`
- `Jun 28`

Full-year dates still work (`June 28, 2026`, `2026-06-28`).

The app uses that date to suggest which Einhorn session to edit (Wednesday / Sunday / first or third Monday).

---

## Step 2 — Set Render environment variables

Render → **einhorn-postmaster-api** → **Environment**:

| Variable | Value | Required |
|---|---|---|
| `GYMDESK_OPEN_URL` | URL to open after copy | No — defaults to `https://app.gymdesk.com/login` |
| `GYMDESK_MEMBER_SIGNUP_URL` | Member signup link (reference only) | No — defaults to Einhorn signup URL |

### Recommended: bookmark your schedule

For faster workflow, log into Gymdesk, navigate to **Gym → Schedule**, bookmark that page, and set:

```
GYMDESK_OPEN_URL=https://app.gymdesk.com/...
```

Use whatever URL your browser shows on the schedule screen (your bookmarked admin schedule page).

Save changes. Render redeploys automatically.

---

## Step 3 — Update a class description in Gymdesk

After Postmaster copies and opens Gymdesk:

1. Log in if prompted ([app.gymdesk.com/login](https://app.gymdesk.com/login))
2. Go to **Gym → Schedule**
3. Find the session matching the date in your post (status bar shows the matched day + hint)
4. Click the session → **Edit Session**
5. Open the **Description** tab
6. Paste (`Ctrl+V` / `Cmd+V`) and **Save**

---

## Einhorn schedule hints (used in status messages)

| Day | Session |
|---|---|
| **Wednesday** | 8:15–10:15 PM, Elevate Fitness Complex (PT area) |
| **Sunday** | 10:00 AM–1:00 PM, Verdugo Woodlands Dad's Club |
| **First Monday** | 8:30–10:30 PM, Elevate (rear basketball court) |
| **Third Monday** | 8:30–10:30 PM, Elevate (advanced / open sparring) |

---

## Step 4 — Test

1. Open https://gparrine.github.io/Einhorn_Post_Master/
2. Write a post that includes a **Wednesday, Sunday, or Monday** date
3. Click **Gymdesk** → **Yes, Send**
4. Confirm clipboard + new Gymdesk tab
5. Paste into the session **Description** tab

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No class date found in your post` | Add a clear date to the post text |
| Clipboard error | Copy manually from the editor |
| Wrong session day | Check the date matches Wed/Sun/Mon class |
| Opens login every time | Set `GYMDESK_OPEN_URL` to your bookmarked schedule URL |

---

## Why not automated?

Gymdesk schedule editing is done through the admin dashboard. Third-party write APIs for class descriptions are not documented. Manual-assist keeps the workflow reliable and compliant.
