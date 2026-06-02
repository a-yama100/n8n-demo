"use client";

import { KIND_ACCENT, type Workflow } from "@/lib/workflows";

const NODE_W = 138;
const NODE_H = 58;

type Props = {
  workflow: Workflow;
  /** How many sequence steps have executed. -1 = idle, sequence.length = all done. */
  activeStep: number;
};

export function WorkflowCanvas({ workflow, activeStep }: Props) {
  const seqIndex = (id: string) => workflow.sequence.indexOf(id);
  const byId = (id: string) => workflow.nodes.find((n) => n.id === id)!;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div
        className="canvas-grid relative"
        style={{ width: workflow.width, height: workflow.height }}
      >
        {/* Connectors */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={workflow.width}
          height={workflow.height}
        >
          {workflow.edges.map((e) => {
            const from = byId(e.from);
            const to = byId(e.to);
            const sx = from.x + NODE_W;
            const sy = from.y + NODE_H / 2;
            const tx = to.x;
            const ty = to.y + NODE_H / 2;
            const dx = Math.max((tx - sx) / 2, 28);
            const path = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
            const active = seqIndex(e.to) <= activeStep && activeStep >= 0;
            return (
              <g key={`${e.from}-${e.to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={active ? "#34d399" : "#cbd5e1"}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? "edge-active" : ""}
                />
                <circle cx={sx} cy={sy} r={3} fill={active ? "#10b981" : "#94a3b8"} />
                <circle cx={tx} cy={ty} r={3} fill={active ? "#10b981" : "#94a3b8"} />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {workflow.nodes.map((n) => {
          const idx = seqIndex(n.id);
          const done = activeStep >= 0 && idx < activeStep;
          const running = activeStep >= 0 && idx === activeStep;
          const accent = KIND_ACCENT[n.kind];
          const borderColor = done ? "#10b981" : running ? accent : "#e2e8f0";
          return (
            <div
              key={n.id}
              className={
                "absolute rounded-lg bg-white shadow-sm transition-colors " +
                (running ? "node-running" : "")
              }
              style={{
                left: n.x,
                top: n.y,
                width: NODE_W,
                height: NODE_H,
                borderWidth: 2,
                borderStyle: "solid",
                borderColor,
              }}
            >
              <span
                className="absolute left-0 top-0 h-full w-1.5 rounded-l-md"
                style={{ background: accent }}
              />
              {done && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white shadow">
                  ✓
                </span>
              )}
              <div className="flex h-full items-center gap-2 pl-3 pr-2">
                <span className="text-lg leading-none">{n.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-800">
                    {n.title}
                  </span>
                  <span className="block truncate text-[10px] text-slate-400">
                    {n.subtitle}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
