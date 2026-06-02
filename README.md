# n8n-demo — n8n Automation Demo

A public, interactive demo of two production-style **n8n** workflows, deployed as a
subdomain of phaiworks.com (`n8n-demo.phaiworks.com`). It is an Upwork-facing
portfolio piece showing that the operator builds n8n automations as part of a real
system — Next.js front end, AI step, Supabase, Slack, Gmail, WordPress — not in
isolation.

## What it shows

Two workflows, each rendered as an animated n8n-style canvas that executes node by node:

1. **AI Intake Automation** — `Webhook → AI Agent (classify + extract) → Switch → Supabase (CRM) + Slack + Gmail`.
   Paste a customer enquiry; the AI step returns a strict schema (category, priority,
   sentiment, entities, routing); the lead is "written" to Supabase, a Slack message is
   composed, and an auto-acknowledgement reply is drafted.
2. **SEO Content Automation** — `Schedule → HTTP Request → AI Writer → SEO Meta → WordPress → Email + LINE`.
   Enter a topic; the pipeline produces an SEO title/meta/slug, keyword set, article
   outline + intro, a WordPress draft, and a report summary.

## Self-contained simulation (no keys, no cost)

The AI step is reproduced **deterministically** in `lib/intake.ts` and `lib/seo.ts`
from keyword signals, so the demo runs instantly with **no API keys and no cost**. The
node graph, routing logic and output shapes mirror the real workflow; in production the
AI node is a Claude call and the database/Slack/WordPress steps are live integrations.
This keeps the public endpoint key-free (nothing to leak, budget-cap, or rotate) — the
same philosophy as the sibling `rag-demo`.

## Structure

| Path | Role |
|---|---|
| `app/page.tsx` | Landing: hero, disclosure, demos, engineering notes |
| `components/Demos.tsx` | Tab switcher between the two demos |
| `components/IntakeDemo.tsx` / `SeoDemo.tsx` | Form + run animation + results |
| `components/WorkflowCanvas.tsx` | n8n-style canvas: nodes + bezier connectors + run animation |
| `lib/workflows.ts` | Node/edge/sequence definitions for both canvases |
| `lib/intake.ts` | Deterministic "AI Agent" classifier + routing/CRM/Slack output |
| `lib/seo.ts` | Deterministic SEO plan generator |
| `app/api/intake/route.ts` / `app/api/seo/route.ts` | Validated endpoints (rate-limited) |
| `lib/ratelimit.ts` | Best-effort per-IP throttle |

## Environment variables

None required. The demo is fully self-contained.

## Local dev

```powershell
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Vercel + subdomain)

1. `git init` here and push to a new repo (this folder is its own project, like the
   other apps under `D:\サイト管理\PHAIWorks`).
2. Import the repo into Vercel as a new project. No env vars needed.
3. **Settings → Domains → Add** `n8n-demo.phaiworks.com`. Vercel shows a CNAME to
   `cname.vercel-dns.com`.
4. Value Domain → DNS settings for `phaiworks.com` → add `cname n8n-demo cname.vercel-dns.com.`
   (same format as the other subdomain rows).
5. Redeploy. The demo is live at `https://n8n-demo.phaiworks.com`.
