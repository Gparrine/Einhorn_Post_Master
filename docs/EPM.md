# Einhorn Postmaster — Project Record (EPM)

**Last updated:** 2026-06-26  
**Purpose:** Foolproof session record — resume here next time.

---

## Live URLs

| What | URL |
|---|---|
| **App (GitHub Pages)** | https://gparrine.github.io/Einhorn_Post_Master/ |
| **API (Render)** | https://einhorn-postmaster-api.onrender.com |
| **API health check** | https://einhorn-postmaster-api.onrender.com/api/health |
| **GitHub repo** | https://github.com/Gparrine/Einhorn_Post_Master |

---

## Integration status

| Platform | Status | Notes |
|---|---|---|
| **Infrastructure** | ✅ Complete | Repo public, Pages deployed, Render API live |
| **Discord** | ✅ Working | Auto-posts to `#meetings-plans` |
| **Gemini (Refine with AI)** | ✅ Working | `GEMINI_API_KEY` on Render |
| **Facebook** | ✅ Working | Manual-assist — copy + open group |
| **Meetup** | ✅ Working | Manual-assist — `MEETUP_GROUP_URLNAME` set; accepts slug or full URL |
| **Gymdesk** | ✅ Working | Manual-assist — copy + open schedule |
| **Send to All** | ✅ Working | Discord auto; dialog with Open Facebook / Meetup / Gymdesk links |
| **API access key** | ✅ Configured | Render `API_ACCESS_KEY` + GitHub `VITE_API_ACCESS_KEY` (must match; redeploy Pages after changes) |

**Instructor handoff:** [`INSTRUCTOR_GUIDE.md`](INSTRUCTOR_GUIDE.md)

---

## Render environment (secrets on dashboard only — never commit)

Configured on **einhorn-postmaster-api**:

| Variable | Status |
|---|---|
| `DISCORD_BOT_TOKEN` | ✅ Set (rotate if ever exposed) |
| `DISCORD_CHANNEL_ID` | ✅ Set (`#meetings-plans`) |
| `DEMO_MODE` | ✅ `false` |
| `ALLOWED_ORIGINS` | ✅ Includes `https://gparrine.github.io` |
| `API_ACCESS_KEY` | ✅ Set — must match GitHub `VITE_API_ACCESS_KEY` |
| `GEMINI_API_KEY` | ✅ Set |
| `MEETUP_GROUP_URLNAME` | ✅ Set (e.g. `einhorn-la-medieval-martial-arts`) |
| `FACEBOOK_GROUP_URL` | ✅ Set (if using Facebook) |
| `GYMDESK_OPEN_URL` | Optional — bookmarked schedule URL recommended |
| `MEETUP_API_KEY` | Optional — Meetup Pro OAuth for automatic event description updates |

**GitHub Actions variables** (Settings → Actions → Variables):

| Variable | Status |
|---|---|
| `VITE_API_URL` | ✅ Render API URL (no trailing slash) |
| `VITE_API_ACCESS_KEY` | ✅ Same value as Render `API_ACCESS_KEY` |

**Local dev:** copy [`backend/.env.example`](../backend/.env.example) → `backend/.env`; optional `frontend/.env.local` with `VITE_API_ACCESS_KEY` if backend key is set.

---

## Session log (2026-06-24 → 2026-06-26)

1. **Core app** — Rich text editor, emoji picker (gold unicorn), Refine with AI, 4 platform buttons, Send to All, embed/link share
2. **Discord** — Live posting to `#meetings-plans`
3. **Facebook / Meetup / Gymdesk** — Manual-assist (copy + open browser); Meetup month/day date parsing
4. **Send to All fixes** — Popup blocker workaround → copy once + results dialog with open links
5. **Meetup URL fix** — Normalizes full Meetup URL or slug in `MEETUP_GROUP_URLNAME`
6. **Instructor guide** — [`INSTRUCTOR_GUIDE.md`](INSTRUCTOR_GUIDE.md)
7. **Security pass** — Helmet, CORS hardening, health endpoint simplified, doc redaction ([`PR #32`](https://github.com/Gparrine/Einhorn_Post_Master/pull/32))
8. **API access key speed bump** — `X-API-Key` on `/api/refine` and `/api/post` ([`PR #35`](https://github.com/Gparrine/Einhorn_Post_Master/pull/35))
9. **Unauthorized fix** — Matching `VITE_API_ACCESS_KEY` + Pages redeploy; trim keys, OPTIONS preflight ([`PR #37`](https://github.com/Gparrine/Einhorn_Post_Master/pull/37))

---

## Security reminders

- Rotate Discord bot tokens and API keys if they are ever exposed outside Render.
- Never commit `.env`, tokens, or API keys to GitHub.
- `API_ACCESS_KEY` / `VITE_API_ACCESS_KEY` reduce casual abuse but are visible in the published frontend — not a substitute for full login auth.
- If Refine or post returns **Unauthorized**, check matching keys on Render + GitHub and **re-run Deploy to GitHub Pages**.

---

## Troubleshooting quick reference

| Symptom | Fix |
|---|---|
| `Unauthorized` on refine/post | Match `API_ACCESS_KEY` (Render) and `VITE_API_ACCESS_KEY` (GitHub); redeploy Pages |
| Meetup opens wrong URL | Use slug only or full group URL in `MEETUP_GROUP_URLNAME` (both supported) |
| Send to All — only Discord works | Use the post-send dialog links; paste on each site |
| Gemini fails | Confirm `GEMINI_API_KEY` on Render (separate from `API_ACCESS_KEY`) |

---

## Optional future work

1. **Meetup automatic API** — Add `MEETUP_API_KEY` (Meetup Pro OAuth) for GraphQL `editEvent`
2. **Stronger auth** — Login/OAuth if API abuse becomes a concern (API key is only a speed bump)
3. **Instructor guide** — Add “why Discord is automatic / stay signed in” section if not yet on `main`

---

## Quick resume commands

```bash
git checkout main && git pull origin main

# Local full stack
npm run install:all   # first time
npm run dev           # frontend :5173 + backend :3001
```

---

## Key files

| File | Purpose |
|---|---|
| [`frontend/`](../../frontend/) | React UI |
| [`backend/`](../../backend/) | Express API |
| [`backend/src/middleware/apiKeyAuth.ts`](../backend/src/middleware/apiKeyAuth.ts) | API access key speed bump |
| [`backend/src/services/discord.ts`](../backend/src/services/discord.ts) | Discord integration |
| [`backend/src/services/gemini.ts`](../backend/src/services/gemini.ts) | AI refine |
| [`backend/src/services/meetup.ts`](../backend/src/services/meetup.ts) | Meetup manual-assist + optional API |
| [`frontend/src/components/SendAllResultsDialog.tsx`](../frontend/src/components/SendAllResultsDialog.tsx) | Send to All next-steps dialog |
| [`docs/INSTRUCTOR_GUIDE.md`](INSTRUCTOR_GUIDE.md) | Instructor handoff |
| [`docs/DEPLOY.md`](DEPLOY.md) | Deployment guide |
| [`render.yaml`](../render.yaml) | Render Blueprint |

---

*End of session record.*
