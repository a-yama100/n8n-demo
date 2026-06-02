export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="https://www.phaiworks.com/"
            className="font-bold text-slate-900 hover:text-n8n transition-colors"
          >
            PH AI Works
          </a>
          <span className="text-xs font-semibold uppercase tracking-wide text-n8n bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
            n8n Automation Demo
          </span>
        </div>
        <a
          href="https://www.phaiworks.com/en"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          phaiworks.com
        </a>
      </div>
    </header>
  );
}
