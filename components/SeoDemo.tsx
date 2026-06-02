"use client";

import { useState } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { SEO_WORKFLOW } from "@/lib/workflows";
import type { SeoResult } from "@/lib/seo";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EXAMPLES: { topic: string; audience: string }[] = [
  { topic: "n8n workflow automation for small business", audience: "operations teams" },
  { topic: "AI customer support chatbot", audience: "SaaS founders" },
  { topic: "how to reduce cloud costs", audience: "CTOs" },
  { topic: "best CRM for freelancers", audience: "solo consultants" },
];

export function SeoDemo() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);

  async function run() {
    if (running) return;
    const t = topic.trim();
    if (!t) {
      setError("Enter a topic or keyword (or pick an example) to run the workflow.");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    setStep(-1);

    const pending = fetch("/api/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: t, audience }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .catch(() => ({ ok: false, data: { error: "Network error." } }));

    const seq = SEO_WORKFLOW.sequence;
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
    setResult(data.result as SeoResult);
    setRunning(false);
  }

  return (
    <div>
      <p className="text-sm text-slate-600">
        A <strong>Schedule</strong> trigger runs daily. n8n makes an{" "}
        <strong>HTTP Request</strong> to pull trend/SERP data, an{" "}
        <strong>AI Writer</strong> drafts the article, an <strong>SEO Meta</strong> step
        generates the title, slug and schema, then a <strong>WordPress</strong> draft is
        created and a summary is sent over <strong>Email + LINE</strong> for human
        review before publishing.
      </p>

      {/* Form */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={160}
            placeholder="Topic or target keyword…"
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            maxLength={80}
            placeholder="Target audience (optional)"
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
        </div>
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
              key={ex.topic}
              onClick={() => {
                setTopic(ex.topic);
                setAudience(ex.audience);
                setResult(null);
                setStep(-1);
                setError("");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {ex.topic}
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
          <h3 className="text-sm font-semibold text-slate-700">Workflow canvas</h3>
          <span className="text-xs text-slate-400">
            {step < 0
              ? "idle"
              : result
              ? "✓ executed · 6 nodes"
              : `running… node ${Math.min(step + 1, SEO_WORKFLOW.sequence.length)}/6`}
          </span>
        </div>
        <WorkflowCanvas workflow={SEO_WORKFLOW} activeStep={step} />
      </div>

      {/* Results */}
      {result && <SeoResults result={result} />}
    </div>
  );
}

function SeoResults({ result }: { result: SeoResult }) {
  return (
    <div className="mt-6 space-y-4">
      {/* SEO meta */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
          🏷️ SEO Meta · generated
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="text-slate-400">Title</span>
            <p className="font-medium text-slate-800">{result.seo_title}</p>
          </div>
          <div>
            <span className="text-slate-400">Meta description</span>
            <p className="text-slate-700">{result.meta_description}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-slate-700">
            <span>
              <span className="text-slate-400">Slug:</span>{" "}
              <code className="font-mono text-xs">/{result.slug}</code>
            </span>
            <span>
              <span className="text-slate-400">Intent:</span> {result.search_intent}
            </span>
            <span>
              <span className="text-slate-400">Word target:</span>{" "}
              {result.word_count_target}
            </span>
          </div>
          <div className="pt-1">
            <span className="text-slate-400">Keywords:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {result.primary_keyword}
              </span>
              {result.secondary_keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* AI Writer draft */}
        <div className="rounded-xl border border-violet-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
            🤖 AI Writer · draft outline
          </div>
          <p className="mt-3 text-sm italic leading-relaxed text-slate-600">
            {result.intro_paragraph}
          </p>
          <ol className="mt-3 space-y-1.5 text-sm text-slate-700">
            {result.outline.map((s, i) => (
              <li key={s.h2}>
                <span className="font-medium text-slate-800">
                  {i + 1}. {s.h2}
                </span>
                <span className="block text-xs text-slate-400">{s.note}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* WordPress + report */}
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
              📝 WordPress · draft created
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">Platform:</span>{" "}
                {result.publish.platform}
              </li>
              <li>
                <span className="text-slate-400">Status:</span> {result.publish.status}
              </li>
              <li className="truncate">
                <span className="text-slate-400">Preview:</span>{" "}
                <code className="font-mono text-xs">{result.publish.url}</code>
              </li>
            </ul>
            <div className="mt-3 text-xs text-slate-500">
              Internal links suggested:{" "}
              {result.internal_links.map((l) => (
                <code key={l} className="font-mono text-[11px] text-slate-600">
                  {l}{" "}
                </code>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
              📧 Report · {result.report.channels.join(" + ")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {result.report.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
