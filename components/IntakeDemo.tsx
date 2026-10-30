"use client";

import { useState } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { INTAKE_WORKFLOW } from "@/lib/workflows";
import type { IntakeResult } from "@/lib/intake";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Example = {
  label: string;
  name: string;
  company: string;
  email: string;
  message: string;
};

const EXAMPLES: Example[] = [
  {
    label: "🟢 Hot lead (n8n project)",
    name: "Maria Santos",
    company: "Cebu Logistics Co.",
    email: "maria@cebulogistics.example",
    message:
      "Hi! We get dozens of enquiries a day through our website and they all land in one inbox. We'd like an n8n workflow that classifies each submission with AI and pushes qualified leads into our CRM, with a Slack ping to the sales team. Budget is around $4,000 and we'd love to start next month.",
  },
  {
    label: "🔴 Angry support ticket",
    name: "Tom",
    company: "",
    email: "tom@shop.example",
    message:
      "URGENT — our checkout has been completely broken since this morning and customers can't pay. This is unacceptable, we're losing sales. Fix it ASAP!",
  },
  {
    label: "💳 Billing question",
    name: "Aiko",
    company: "",
    email: "aiko@example.com",
    message:
      "I think I was charged twice for my subscription this month. Could you check and refund the extra charge? My invoice reference is INV-2231.",
  },
  {
    label: "🤝 Partnership",
    name: "David Lin",
    company: "CloudPay",
    email: "david@cloudpay.example",
    message:
      "We're a fintech SaaS and would love to explore a reseller partnership for your AI automation services. Who's the right person to talk to?",
  },
  {
    label: "🗑️ Spam",
    name: "",
    company: "",
    email: "",
    message: "check this out http://promo.example/win",
  },
];

export function IntakeDemo() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);

  function fillExample(ex: Example) {
    setName(ex.name);
    setCompany(ex.company);
    setEmail(ex.email);
    setMessage(ex.message);
    setResult(null);
    setStep(-1);
    setError("");
  }

  async function run() {
    if (running) return;
    const msg = message.trim();
    if (!msg) {
      setError("Enter a message (or pick an example) to run the workflow.");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    setStep(-1);

    const pending = fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, email, message: msg }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .catch(() => ({ ok: false, data: { error: "Network error." } }));

    const seq = INTAKE_WORKFLOW.sequence;
    for (let i = 0; i < seq.length; i++) {
      setStep(i);
      await sleep(i === 0 ? 350 : 520);
    }

    const { ok, data } = await pending;
    if (!ok) {
      setError(data.error || "Something went wrong.");
      setStep(-1);
      setRunning(false);
      return;
    }
    setStep(seq.length);
    setResult(data.result as IntakeResult);
    setRunning(false);
  }

  return (
    <div>
      <p className="text-sm text-slate-600">
        A website contact form is the <strong>Webhook trigger</strong>. n8n calls an{" "}
        <strong>AI Agent</strong> to classify the message and extract structured
        fields, a <strong>Switch</strong> routes by category, then the lead is written
        to <strong>Supabase</strong>, the team is pinged in <strong>Slack</strong>, and
        the sender gets an auto-acknowledgement by <strong>Gmail</strong>.
      </p>

      {/* Form */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <input aria-label="Name (optional)" name="name" autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            placeholder="Name (optional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input aria-label="Company (optional)" name="company" autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={120}
            placeholder="Company (optional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input aria-label="Email (optional)" name="email" autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            placeholder="Email (optional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
        </div>
        <textarea aria-label="Customer enquiry" name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1200}
          rows={4}
          placeholder="Paste a customer enquiry here…"
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={run}
            disabled={running}
            className="rounded-lg bg-n8n px-5 py-2.5 text-sm font-medium text-white hover:bg-n8n-dark disabled:opacity-50 transition-colors"
          >
            {running ? "Running workflow…" : "▶ Run workflow"}
          </button>
          <span className="text-xs text-slate-400">or try an example:</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => fillExample(ex)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Canvas */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Workflow canvas
          </h3>
          <span className="text-xs text-slate-400">
            {step < 0
              ? "idle"
              : result
              ? "✓ executed · 6 nodes"
              : `running… node ${Math.min(step + 1, INTAKE_WORKFLOW.sequence.length)}/6`}
          </span>
        </div>
        <WorkflowCanvas workflow={INTAKE_WORKFLOW} activeStep={step} />
      </div>

      {/* Results */}
      {result && <IntakeResults result={result} />}
    </div>
  );
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + tone}>
      {children}
    </span>
  );
}

function IntakeResults({ result }: { result: IntakeResult }) {
  const priorityTone =
    result.priority === "high"
      ? "bg-red-100 text-red-700"
      : result.priority === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";
  const sentimentTone =
    result.sentiment === "negative"
      ? "bg-red-100 text-red-700"
      : result.sentiment === "positive"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="mt-6 space-y-4">
      {/* AI Agent output */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
          🤖 AI Agent · structured output
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="bg-violet-100 text-violet-700">{result.category_label}</Badge>
          <Badge tone={priorityTone}>priority: {result.priority}</Badge>
          <Badge tone={sentimentTone}>sentiment: {result.sentiment}</Badge>
          <Badge tone="bg-slate-100 text-slate-600">lang: {result.language}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-700">{result.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-500">Extracted</div>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">Services:</span>{" "}
                {result.entities.requested_services.length
                  ? result.entities.requested_services.join(", ")
                  : "—"}
              </li>
              <li>
                <span className="text-slate-400">Budget:</span>{" "}
                {result.entities.budget ?? "—"}
              </li>
              <li>
                <span className="text-slate-400">Timeline:</span>{" "}
                {result.entities.timeline ?? "—"}
              </li>
              <li>
                <span className="text-slate-400">Company:</span>{" "}
                {result.entities.company ?? "—"}
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Routing decision</div>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">Slack:</span>{" "}
                {result.routing.slack_channel}
              </li>
              <li>
                <span className="text-slate-400">CRM stage:</span>{" "}
                {result.routing.crm_stage}
              </li>
              <li>
                <span className="text-slate-400">Assignee:</span>{" "}
                {result.routing.assignee}
              </li>
              <li>
                <span className="text-slate-400">SLA:</span> {result.routing.sla_hours}h
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Supabase row */}
        <div className="rounded-xl border border-emerald-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            🗄️ Supabase · row inserted into <code className="font-mono">leads</code>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
            {JSON.stringify(result.crm_record, null, 2)}
          </pre>
        </div>

        {/* Slack message */}
        <div className="rounded-xl border border-indigo-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            💬 Slack · posted to {result.routing.slack_channel}
          </div>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-sm leading-relaxed text-slate-700">
            {result.slack_message}
          </pre>
        </div>
      </div>

      {/* Suggested reply */}
      <div className="rounded-xl border border-teal-200 bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
          ✉️ Gmail · AI-drafted auto-acknowledgement
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {result.suggested_reply}
        </p>
      </div>
    </div>
  );
}
