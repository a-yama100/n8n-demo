import { Demos } from "@/components/Demos";
import { itYears } from "@/lib/profileYears";

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
        {/* eslint-disable-next-line @next/next/no-img-element -- 同じ origin の静的ファイル。next/image の最適化は使わない */}
        <img
          src="/media/hero.webp"
          alt="Illustration of an automated workflow: a contact form message passes through AI, routing, database, chat and email steps while an office worker watches"
          width={1600}
          height={679}
          className="mt-6 aspect-[1600/679] w-full rounded-xl object-cover"
        />
        <p className="mt-6 text-slate-600">
          Try two real-world <strong>n8n</strong> workflows right here in your browser.
          Each step lights up as the data moves from the trigger, through an AI step, and
          on to a database, Slack, a CMS and email. They work the same way as automations
          built for real clients, but run in a safe sandbox.
        </p>
      </section>

      {/* Simulation disclosure */}
      <div className="mb-8 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <strong className="text-slate-800">How this demo works.</strong> The steps,
        routing rules and output match a real n8n workflow. The AI step uses fixed rules
        instead of a live AI model, so the demo runs instantly with{" "}
        <strong>no API keys and no cost</strong>. In a real project, that step calls an
        AI model (Claude) from inside n8n, and the database, Slack and WordPress steps
        connect to the real services.
      </div>

      {/* Demos */}
      <Demos />

      {/* Why this matters */}
      <section className="mt-16 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          More than placing nodes: connecting your whole system
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The hard part of automation isn&apos;t placing nodes on a canvas. It&apos;s
          making the workflow fit cleanly with the rest of your tools.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            [
              "n8n as the hub, not the whole system",
              "Workflows start from a real Next.js website and pass data on to Supabase, Slack, Gmail and WordPress. n8n coordinates the steps; it doesn't work in isolation.",
            ],
            [
              "AI output in a fixed format",
              "The AI step always returns the same fields (category, priority, key details, routing), never free-form text. So the steps after it (the Switch, the CRM record and the Slack message) behave predictably and can be tested.",
            ],
            [
              "Safe and easy to review",
              "The content workflow saves a draft for a person to check instead of publishing it automatically. The intake workflow assigns an owner and a response deadline, so no enquiry gets missed.",
            ],
            [
              `${itYears()} years in IT · IBM-certified AI engineer`,
              "Built by an engineer who combines n8n with custom Next.js, RAG and API work, so the automation connects cleanly to the rest of your systems.",
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
          WordPress REST · deployed on Vercel. Want this connected to your tools?{" "}
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
