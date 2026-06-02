import { Demos } from "@/components/Demos";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="text-center mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-n8n">
          Built with n8n · workflow automation
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
          n8n Automation Demo
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
          Two production-style <strong>n8n</strong> workflows you can run right here in
          the browser. Watch each node light up as data flows from a trigger, through an
          AI step, out to a database, Slack, a CMS and email — exactly how these
          automations run for real clients, only wired into a sandbox.
        </p>
      </section>

      {/* Simulation disclosure */}
      <div className="mb-8 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <strong className="text-slate-800">Self-contained demo.</strong> The
        orchestration, routing logic and output structure mirror a real n8n workflow.
        The AI step is reproduced deterministically so the demo runs instantly with{" "}
        <strong>no API keys and no cost</strong> — in production it is an LLM (Claude)
        call inside an n8n node, and the database/Slack/WordPress steps are live
        integrations.
      </div>

      {/* Demos */}
      <Demos />

      {/* Why this matters */}
      <section className="mt-16 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Not just &ldquo;can use n8n&rdquo; — system integration
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The hard part of automation isn&apos;t dragging nodes onto a canvas. It&apos;s
          the integration discipline around them.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            [
              "n8n as the hub, not the whole system",
              "Workflows are triggered by a real Next.js front end and fan out to Supabase, Slack, Gmail and WordPress — n8n orchestrates, it doesn't live in isolation.",
            ],
            [
              "AI with a strict output contract",
              "The AI node returns a fixed schema (category, priority, entities, routing) so the downstream Switch, CRM insert and Slack payload are deterministic and testable — not free text.",
            ],
            [
              "Idempotent, reviewable, safe",
              "The content pipeline publishes a draft for human review rather than auto-posting blindly; the intake flow assigns owners and SLAs so nothing silently falls through.",
            ],
            [
              "35 years in IT · IBM-certified AI engineer",
              "Built by an engineer who pairs n8n with custom Next.js, RAG and API work — so the automation connects cleanly to the rest of your stack.",
            ],
          ].map(([title, body]) => (
            <li key={title} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-medium text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-slate-500">
          Stack: <strong>n8n</strong> · Next.js · Supabase · Slack / Gmail APIs ·
          WordPress REST · deployed on Vercel. Want this wired into your tools?{" "}
          <a
            href="https://www.phaiworks.com/en"
            className="font-medium text-n8n hover:text-n8n-dark underline"
          >
            Talk to PH AI Works
          </a>
          .
        </p>
      </section>
    </div>
  );
}
