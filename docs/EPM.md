# Einhorn Postmaster — Project Record (EPM)

**Last updated:** 2026-06-24  
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
| **Discord** | ✅ Complete | Posts to `#meetings-plans` verified working |
| **Gemini (Refine with AI)** | ⏳ Ready to configure | See [`GEMINI.md`](GEMINI.md) — set `GEMINI_API_KEY` on Render |
| **Facebook** | ⏳ Ready to configure | Manual-assist — see [`FACEBOOK.md`](FACEBOOK.md), set `FACEBOOK_GROUP_URL` on Render |
| **Gymdesk** | ⏳ Ready to configure | Manual-assist — see [`GYMDESK.md`](GYMDESK.md), optional `GYMDESK_OPEN_URL` on Render |
| **Meetup** | ✅ Ready to configure | Manual-assist by default — see [`MEETUP.md`](MEETUP.md); optional `MEETUP_API_KEY` for GraphQL auto-update |

---

## Render environment (secrets on dashboard only — never commit)

Configured on **einhorn-postmaster-api**:

| Variable | Status |
|---|---|
| `DISCORD_BOT_TOKEN` | ✅ Set (regenerate if ever exposed in chat) |
| `DISCORD_CHANNEL_ID` | ✅ `956800108375191639` (`#meetings-plans`) |
| `DEMO_MODE` | ✅ `false` (real Discord posts; other platforms need credentials or will error) |
| `ALLOWED_ORIGINS` | Should include `https://gparrine.github.io` |
| `GEMINI_API_KEY` | ❌ Set on Render to enable Refine with AI |
| `GEMINI_SYSTEM_PROMPT` | Optional override — default uses [`backend/prompts/einhorn-gem.prompt.md`](../backend/prompts/einhorn-gem.prompt.md) |
| Facebook / Meetup / Gymdesk vars | ❌ Not set — see [`FACEBOOK.md`](FACEBOOK.md), [`MEETUP.md`](MEETUP.md), [`GYMDESK.md`](GYMDESK.md) |

**Local dev:** copy [`backend/.env.example`](../backend/.env.example) → `backend/.env` (gitignored).

---

## What we built today

1. Full **Einhorn Postmaster** UI (rich text, AI refine button, 4 platform buttons, Send All, embed/link)
2. **Express backend** with platform services + demo mode
3. **Render** deployment (`npm ci` + `tsx` start — no compile step)
4. **GitHub Pages** deployment (workflow: `.github/workflows/deploy-pages.yml`)
5. **Discord** live integration to `#meetings-plans`
6. Official **logo** PNG in header
7. Docs: [`DEPLOY.md`](DEPLOY.md), this record

---

## Security reminders

- **Discord bot token was exposed in chat once** — should have been reset; if not done yet, reset in Discord Developer Portal → Bot → Reset Token, then update Render only.
- Never commit `.env`, tokens, or API keys to GitHub.
- Channel IDs are fine to document; tokens are not.

---

## Next session — recommended order

### Phase 2: Gemini Gem (AI Refine)

See **[docs/GEMINI.md](GEMINI.md)** for full setup.

1. [Google AI Studio](https://aistudio.google.com/apikey) → create API key → Render `GEMINI_API_KEY`
2. Paste Gem instructions into [`backend/prompts/einhorn-gem.prompt.md`](../backend/prompts/einhorn-gem.prompt.md) (or Render `GEMINI_SYSTEM_PROMPT`)
3. Test **Refine with AI** on live app

### Phase 3: Facebook

- Meta removed group posting API (April 2024)
- Implement **manual-assist** (copy text + open group) unless you choose browser automation

### Phase 4: Gymdesk

- Update scheduled class **Description** tab for date-matched session
- Likely manual-assist or Playwright automation — no documented public write API

### Phase 5: Meetup ✅

- Manual-assist with `MEETUP_GROUP_URLNAME` (copy + open events page)
- Optional API with `MEETUP_API_KEY` (Meetup Pro OAuth) — GraphQL `editEvent` updates description
- See [`MEETUP.md`](MEETUP.md)

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
| [`render.yaml`](../render.yaml) | Render Blueprint |
| [`docs/DEPLOY.md`](DEPLOY.md) | Step 1 deployment guide |
| [`backend/src/services/discord.ts`](../backend/src/services/discord.ts) | Discord integration (working) |
| [`backend/src/services/gemini.ts`](../backend/src/services/gemini.ts) | AI refine (next) |

---

## Open decisions (unchanged)

1. **Facebook:** manual-assist vs browser automation vs skip
2. **Gymdesk:** manual-assist vs browser automation
3. **Meetup:** set `MEETUP_GROUP_URLNAME`; add `MEETUP_API_KEY` when OAuth is ready

---

*End of session record.*
