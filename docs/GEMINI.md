# Gemini setup (Refine with AI)

Einhorn Postmaster uses the **Google Gemini API** to power **Refine with AI**. This replicates your Gemini Gem behavior using the same instructions — Gems cannot be called by ID from the API.

---

## Step 1 — Get an API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API key**
4. Copy the key (starts with `AIza...`)

Keep this key secret. Add it only to Render, never to GitHub.

---

## Step 2 — Copy your Gem instructions (optional but recommended)

1. Open [Gemini](https://gemini.google.com) → **Gem manager**
2. Open your Einhorn editing Gem
3. Copy the full **Instructions** text

You can use either:

| Method | Best for |
|---|---|
| **A. Edit repo file** | Long instructions, version controlled |
| **B. Render env var** | Quick changes without redeploying code |

### Method A — Edit the prompt file in GitHub (recommended)

1. Edit [`backend/prompts/einhorn-gem.prompt.md`](../backend/prompts/einhorn-gem.prompt.md)
2. Paste your Gem instructions at the bottom (below the `---` line)
3. Commit and push to `main` — Render auto-redeploys

### Method B — Render environment variable

On Render → **einhorn-postmaster-api** → **Environment**:

- Key: `GEMINI_SYSTEM_PROMPT`
- Value: paste your full Gem instructions (single block of text)

This **overrides** the prompt file if set.

---

## Step 3 — Set Render environment variables

Render → **einhorn-postmaster-api** → **Environment** → add:

| Variable | Value | Required |
|---|---|---|
| `GEMINI_API_KEY` | your API key from Step 1 | **Yes** |
| `GEMINI_MODEL` | `gemini-2.0-flash` | No (default) |
| `GEMINI_TEMPERATURE` | `0.7` | No (default) |
| `GEMINI_SYSTEM_PROMPT` | your Gem instructions | No if using prompt file |

Click **Save Changes**. Render redeploys (~1–2 min).

> **Note:** `DEMO_MODE=false` is fine. Gemini works independently — it only needs `GEMINI_API_KEY`.

---

## Step 4 — Test

### Live app

1. Open https://gparrine.github.io/Einhorn_Post_Master/
2. Type a rough draft in the editor
3. Click **Refine with AI**
4. Refined HTML should replace the editor content

### API test (optional)

```bash
curl -X POST https://einhorn-postmaster-api.onrender.com/api/refine \
  -H 'Content-Type: application/json' \
  -d '{"plainText":"Open mat this Saturday June 28 at 10am. Bring water and gi.","content":"<p>Open mat this Saturday June 28 at 10am. Bring water and gi.</p>"}'
```

Expected: JSON with `"content": "<p>...</p>..."` refined HTML.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Gemini API is not configured` | Set `GEMINI_API_KEY` on Render |
| `API key not valid` | Regenerate key in AI Studio; update Render |
| `429` / quota errors | Check AI Studio quota; wait or upgrade billing |
| Output unlike your Gem | Paste exact Gem instructions into prompt file or `GEMINI_SYSTEM_PROMPT` |
| Empty response | Shorten draft; retry |

---

## How it maps to your Gem

| Gemini Gem | Postmaster |
|---|---|
| Gem instructions | `backend/prompts/einhorn-gem.prompt.md` or `GEMINI_SYSTEM_PROMPT` |
| Gem model choice | `GEMINI_MODEL` (default `gemini-2.0-flash`) |
| Gem web search | Enabled via Google Search grounding on every refine |
| Uploaded knowledge files | Not yet supported — key facts are in the prompt file |

Each refine runs **two mandatory web searches** (hydration history + idiom/quote) before writing the post. Examples in the prompt are forbidden outputs.
