# Deploy Einhorn Postmaster (Step 1)

This guide walks through deploying the backend API and connecting the GitHub Pages frontend.

## Overview

| Component | Host | URL |
|---|---|---|
| Frontend | GitHub Pages | `https://gparrine.github.io/einhorn_post_master/` |
| Backend API | Render (free tier) | `https://einhorn-postmaster-api.onrender.com` (after you create it) |

The frontend calls the backend over HTTPS. API keys live **only** on Render — never in the browser or GitHub Pages build.

---

## Part A — Deploy backend to Render

### 1. Create the Render service

1. Sign in at [render.com](https://render.com) (GitHub login works well).
2. Click **New → Blueprint**.
3. Connect the **Einhorn_Post_Master** GitHub repo.
4. Render reads [`render.yaml`](../render.yaml) and creates **einhorn-postmaster-api**.
5. Click **Apply** and wait for the first deploy to finish (about 2–3 minutes).

### 2. Confirm the API is live

Open:

**https://einhorn-postmaster-api.onrender.com/api/health**

Expected response:

```json
{"status":"ok","service":"einhorn-postmaster"}
```

> **Note:** On Render’s free tier, the service sleeps after inactivity. The first request after sleep may take 30–60 seconds.

### 3. Set environment variables on Render

In Render → **einhorn-postmaster-api** → **Environment**:

| Variable | Value | Notes |
|---|---|---|
| `DEMO_MODE` | `true` | Keep `true` until you add real API keys in later steps |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://gparrine.github.io` | Add other origins comma-separated if needed |
| `NODE_ENV` | `production` | Usually set by blueprint |

Add platform credentials later (Discord, Gemini, etc.) as you complete each integration phase. Click **Save Changes** after edits — Render redeploys automatically.

### 4. Copy your API URL

After deploy, copy the service URL from Render (e.g. `https://einhorn-postmaster-api.onrender.com`). You need it for Part B.

If Render assigns a different name, use **your** URL everywhere below instead of the example.

---

## Part B — Connect GitHub Pages to the API

### 1. Set repository variable

1. GitHub repo → **Settings → Secrets and variables → Actions → Variables**.
2. Click **New repository variable**.
3. Name: `VITE_API_URL`
4. Value: your Render URL with **no trailing slash**  
   Example: `https://einhorn-postmaster-api.onrender.com`
5. Save.

### 2. Enable GitHub Pages

1. Repo → **Settings → Pages**.
2. **Build and deployment → Source:** choose **GitHub Actions**.
3. Save.

### 3. Trigger a Pages deploy

Push to `main` (already done if you merged the feature branch) or:

1. **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

When complete, the site is at:

**https://gparrine.github.io/einhorn_post_master/**

### 4. Verify end-to-end

1. Open the Pages URL above.
2. Type text in the editor and click **Refine with AI** or a platform button.
3. With `DEMO_MODE=true` on Render, you should see simulated success (spinner → green check).

If buttons fail with network errors:

- Confirm `VITE_API_URL` matches your Render URL exactly.
- Confirm `ALLOWED_ORIGINS` on Render includes `https://gparrine.github.io`.
- Re-run the **Deploy to GitHub Pages** workflow after changing `VITE_API_URL`.

---

## Part C — Local development against production API (optional)

To test the production API from your machine:

```bash
cd frontend
VITE_API_URL=https://einhorn-postmaster-api.onrender.com npm run dev
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Pages site loads but API calls fail | Set `VITE_API_URL` repo variable; redeploy Pages workflow |
| CORS error in browser console | Add your origin to `ALLOWED_ORIGINS` on Render |
| API health URL times out | Wake Render service (first request after sleep is slow) |
| 503 “not configured” on post/refine | Expected until you add credentials; ensure `DEMO_MODE=true` for simulated responses |

---

## Next steps

After deployment works in demo mode, proceed to **Phase 1 — Discord** in the main README: create a bot, set `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` on Render, set `DEMO_MODE=false` when ready for real posts.
