# Meetup setup (manual-assist or API)

Einhorn Postmaster updates the **event Description** field on Meetup — not event comments.

Two modes:

| Mode | When | What happens |
|---|---|---|
| **Manual-assist** | `MEETUP_GROUP_URLNAME` only | Copy text + open your group’s events page |
| **API (automatic)** | `MEETUP_GROUP_URLNAME` + `MEETUP_API_KEY` | Match date → update description via Meetup GraphQL |

The green checkmark in manual mode means copy + open succeeded — not that Meetup saved the description automatically.

---

## Step 1 — Include a date in every post

Meetup matching relies on a **month and day** in your post text. The **current year is assumed**.

Examples:

- `June 28`
- `6/28`
- `Jun 28`

Full-year dates still work (`June 28, 2026`, `2026-06-28`).

The app matches that date to an **upcoming** group event on Meetup.

---

## Step 2 — Set Render environment variables

Render → **einhorn-postmaster-api** → **Environment**:

| Variable | Value | Required |
|---|---|---|
| `MEETUP_GROUP_URLNAME` | Group URL slug from meetup.com | **Yes** |
| `MEETUP_API_KEY` | OAuth 2.0 access token (Meetup Pro) | No — enables automatic updates |

### Find your group URL name

Open your Einhorn group on Meetup. The slug is the path segment after `/`:

- `https://www.meetup.com/einhorn-la/` → `einhorn-la`

Set:

```
MEETUP_GROUP_URLNAME=einhorn-la
```

Save changes. Render redeploys automatically.

---

## Step 3 — Manual-assist workflow (no API key)

After Postmaster copies and opens Meetup:

1. Log in to [Meetup](https://www.meetup.com/) if prompted
2. Find the **upcoming event** matching the date in your post (status bar shows the matched day)
3. Open the event → **Edit**
4. Paste (`Ctrl+V` / `Cmd+V`) into the **Description** field
5. Save / publish changes

---

## Step 4 — API workflow (Meetup Pro + OAuth)

Automatic updates require:

1. An active **Meetup Pro** subscription on the account that owns the OAuth client
2. An OAuth 2.0 consumer registered at [Meetup API settings](https://www.meetup.com/api/oauth/list/)
3. An access token with permission to edit group events

Set on Render:

```
MEETUP_API_KEY=your_oauth_access_token
MEETUP_GROUP_URLNAME=your-group-slug
```

Postmaster uses Meetup’s GraphQL API (`https://api.meetup.com/gql-ext`):

1. Lists upcoming events for your group
2. Matches the date in your post
3. Calls `editEvent` to set the **description** field

Tokens expire — use refresh tokens or regenerate as needed. See [Meetup OAuth docs](https://www.meetup.com/api/authentication).

---

## Step 5 — Test

1. Open https://gparrine.github.io/Einhorn_Post_Master/
2. Write a post that includes a date matching an upcoming Meetup event
3. Click **Meetup** → **Yes, Send**
4. **Manual:** confirm clipboard + events tab; paste into event Description
5. **API:** status bar should say posted successfully; check the event on Meetup

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Meetup group is not configured` | Set `MEETUP_GROUP_URLNAME` on Render |
| `No event date found in your post` | Add a clear month/day date to the post text |
| `No upcoming Meetup event found for …` | Create the event on Meetup first, or fix the date |
| API 401 / auth errors | Regenerate OAuth token; confirm Meetup Pro is active |
| Clipboard error | Copy manually from the editor; Meetup tab may still open |
| Wrong event updated | Ensure only one upcoming event exists on that date |

---

## Why manual-assist by default?

Meetup API access requires Meetup Pro and OAuth approval. Manual-assist works immediately with just your group URL name. Add `MEETUP_API_KEY` when you have API credentials ready.
