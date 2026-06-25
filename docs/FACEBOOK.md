# Facebook setup (manual-assist)

Meta **removed the Facebook Groups API** in April 2024. Third-party apps can no longer publish to Facebook groups automatically.

Einhorn Postmaster uses **manual-assist** instead:

1. You click **Facebook** and confirm
2. Post text is **copied to your clipboard**
3. Your **Einhorn Facebook group** opens in a new tab
4. You **paste and publish** in Facebook’s composer

The green checkmark means copy + open succeeded — not that Facebook confirmed the post went live.

---

## Step 1 — Get your group URL

1. Open your Einhorn Facebook group in a browser
2. Copy the URL from the address bar

Examples:

- `https://www.facebook.com/groups/your-group-slug`
- `https://www.facebook.com/groups/1234567890123456`

You must be a **group admin** (or have posting permission) to publish.

---

## Step 2 — Set Render environment variable

Render → **einhorn-postmaster-api** → **Environment**:

| Variable | Value |
|---|---|
| `FACEBOOK_GROUP_URL` | your full group URL (no trailing slash needed) |

Save changes. Render redeploys automatically.

No access token or Graph API app is required.

---

## Step 3 — Test

1. Open https://gparrine.github.io/Einhorn_Post_Master/
2. Write or refine a post
3. Click **Facebook** → **Yes, Send**
4. Confirm:
   - Status bar: “Post text copied to clipboard…”
   - Green check on Facebook button
   - New tab opens to your group
5. Paste (`Ctrl+V` / `Cmd+V`) into the group post box and click **Post**

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Facebook group URL is not configured` | Set `FACEBOOK_GROUP_URL` on Render |
| Clipboard error | Copy text manually from the editor; group tab may still open |
| Group tab blocked | Allow pop-ups for the Postmaster site |
| Can’t post in group | Confirm you’re admin or have posting rights in Facebook |

---

## Why not automated?

Meta deprecated `publish_to_groups` and all Groups API posting. Every major scheduler (Buffer, Hootsuite, etc.) removed group posting for the same reason. Manual-assist is the compliant approach.
