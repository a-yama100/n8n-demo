export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center space-y-3">
        <p className="text-slate-500 text-sm font-medium">
          Self-contained demonstration of an n8n automation workflow. The AI step is
          reproduced deterministically — no live LLM call, no API keys, no cost.
        </p>
        <p className="text-slate-400 text-xs max-w-2xl mx-auto">
          Not affiliated with, endorsed by, or sponsored by n8n GmbH.
          &ldquo;n8n&rdquo; is a trademark of n8n GmbH; it is referenced here only to
          describe the automation tooling used. This is an independent demonstration.
        </p>
        <p className="text-slate-400 text-sm">
          An n8n + AI engineering demo by{" "}
          <a
            href="https://www.phaiworks.com/en"
            className="hover:text-slate-700 underline"
          >
            PH AI Works
          </a>{" "}
          · {year}
        </p>
      </div>
    </footer>
  );
}
