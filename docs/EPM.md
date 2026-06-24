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
| **Gemini (Refine with AI)** | ⏳ Not configured | Needs `GEMINI_API_KEY` + Gem instructions in `GEMINI_SYSTEM_PROMPT` |
| **Facebook** | ⏳ Not started | Groups API deprecated — plan uses manual-assist or automation |
| **Gymdesk** | ⏳ Not started | No public write API — plan uses manual-assist or automation |
| **Meetup** | ⏳ Not started | Needs Meetup Pro OAuth; code must update event description (not comments) |

---

## Render environment (secrets on dashboard only — never commit)

Configured on **einhorn-postmaster-api**:

| Variable | Status |
|---|---|
| `DISCORD_BOT_TOKEN` | ✅ Set (regenerate if ever exposed in chat) |
| `DISCORD_CHANNEL_ID` | ✅ `956800108375191639` (`#meetings-plans`) |
| `DEMO_MODE` | ✅ `false` (real Discord posts; other platforms need credentials or will error) |
| `ALLOWED_ORIGINS` | Should include `https://gparrine.github.io` |
| `GEMINI_API_KEY` | ❌ Not set |
| Facebook / Meetup / Gymdesk vars | ❌ Not set |

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

1. [Google AI Studio](https://aistudio.google.com/apikey) → create API key
2. Copy your **Gem instructions** from Gemini Gem manager → paste into Render `GEMINI_SYSTEM_PROMPT`
3. Set `GEMINI_API_KEY` on Render
4. Test **Refine with AI** on live app  
   *Note: Gems are not callable by ID via API — instructions must be replicated in `GEMINI_SYSTEM_PROMPT`*

### Phase 3: Facebook

- Meta removed group posting API (April 2024)
- Implement **manual-assist** (copy text + open group) unless you choose browser automation

### Phase 4: Gymdesk

- Update scheduled class **Description** tab for date-matched session
- Likely manual-assist or Playwright automation — no documented public write API

### Phase 5: Meetup

- Requires **Meetup Pro** + OAuth token
- Rewrite service to `POST /2/event/{id}` with `description` (not event comments)

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
3. **Meetup:** confirm Meetup Pro subscription for API access

---

*End of session record.*
