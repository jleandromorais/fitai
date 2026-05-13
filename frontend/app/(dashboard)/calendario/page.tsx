"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HISTORY_30, WORKOUTS } from "@/lib/data";

const CODE_COLORS: Record<string, string> = {
  A: "var(--accent)",
  B: "#7DD3FC",
  C: "#FBBF24",
  D: "#F472B6",
};

const DAY_NAMES = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function CalendarioPage() {
  const [mes] = useState("Maio 2026");

  const counts = HISTORY_30.reduce<Record<string, number>>((acc, c) => {
    if (c) acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const recent = [
    { d: "Ontem", w: WORKOUTS[0], v: "4.3k", dur: "58 min" },
    { d: "Há 2 dias", w: WORKOUTS[1], v: "4.9k", dur: "62 min" },
    { d: "Há 4 dias", w: WORKOUTS[2], v: "6.1k", dur: "72 min" },
    { d: "Há 5 dias", w: WORKOUTS[0], v: "4.2k", dur: "55 min" },
  ];

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Histórico</h1>
          <div className="page-sub">Seu mês em treinos</div>
        </div>
        <div className="row gap-2">
          <button className="icon-btn"><ChevronLeft size={16} /></button>
          <div className="btn btn-secondary btn-sm" style={{ pointerEvents: "none" }}>{mes}</div>
          <button className="icon-btn"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="h-eyebrow">Treinos</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>14<span className="stat-unit">/22 dias</span></div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Streak atual</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8, color: "var(--accent)" }}>12<span className="stat-unit">dias</span></div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Melhor streak</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>18<span className="stat-unit">dias</span></div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Volume</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>58k<span className="stat-unit">kg</span></div>
        </div>
      </div>

      <div className="grid-3">
        {/* Calendar */}
        <div className="card">
          <div className="h-eyebrow" style={{ marginBottom: 16 }}>{mes}</div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
            {DAY_NAMES.map((d, i) => (
              <div key={i} style={{
                fontSize: 10, color: "var(--text-mute)", textAlign: "center",
                fontWeight: 700, letterSpacing: "0.1em",
              }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
            {HISTORY_30.map((c, i) => (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 8,
                background: c ? "var(--surface-2)" : "transparent",
                border: c ? "1px solid var(--border)" : "1px dashed var(--border-soft)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", position: "relative",
              }}>
                <span style={{ fontSize: 11, color: c ? "var(--text-dim)" : "var(--text-mute)", fontFamily: "var(--font-mono)" }}>
                  {i + 1}
                </span>
                {c && (
                  <span style={{ position: "absolute", bottom: 4, fontSize: 8, fontWeight: 700, color: CODE_COLORS[c] }}>{c}</span>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="row gap-3" style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, flexWrap: "wrap" }}>
            {Object.entries(counts).map(([code, n]) => (
              <div key={code} className="row gap-2" style={{ fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CODE_COLORS[code], display: "inline-block" }} />
                <span style={{ color: "var(--text-dim)" }}>{code}</span>
                <span className="h-mono" style={{ color: "var(--text)", fontWeight: 600 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>Atividade recente</div>
          <div className="col gap-3">
            {recent.map((h, i) => (
              <Link key={i} href={`/treinos/${h.w.id}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", textDecoration: "none",
                borderBottom: i < recent.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                  color: CODE_COLORS[h.w.code], flexShrink: 0,
                }}>{h.w.code}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{h.w.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{h.d} · {h.dur}</div>
                </div>
                <div className="h-mono" style={{ fontSize: 12, color: "var(--accent)", flexShrink: 0 }}>{h.v} kg</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
