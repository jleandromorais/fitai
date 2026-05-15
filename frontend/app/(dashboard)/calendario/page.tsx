"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";

const CODE_COLORS: Record<string, string> = {
  A: "var(--accent)",
  B: "#7DD3FC",
  C: "#FBBF24",
  D: "#F472B6",
};

const DAY_NAMES = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function CalendarioPage() {
  const { workouts, loading } = useWorkouts();
  const [mesOffset, setMesOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + mesOffset, 1);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const mesLabel = baseDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Build a code map per day of the current month using workout code cycling
  const calendarCells: (string | null)[] = Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(null);
  }

  const totalSets = workouts.reduce((s, w) => s + w.totalSets, 0);
  const totalVolume = workouts.reduce((s, w) => s + w.volume, 0);

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Histórico</h1>
          <div className="page-sub">Seus treinos cadastrados</div>
        </div>
        <div className="row gap-2">
          <button className="icon-btn" onClick={() => setMesOffset(o => o - 1)}><ChevronLeft size={16} /></button>
          <div className="btn btn-secondary btn-sm" style={{ pointerEvents: "none", textTransform: "capitalize" }}>{mesLabel}</div>
          <button className="icon-btn" onClick={() => setMesOffset(o => o + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="h-eyebrow">Treinos</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {loading ? "–" : workouts.length}
            <span className="stat-unit"> cadastrados</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Exercícios</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8, color: "var(--accent)" }}>
            {loading ? "–" : workouts.reduce((s, w) => s + w.exercises.length, 0)}
            <span className="stat-unit"> no total</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Séries</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {loading ? "–" : totalSets}
            <span className="stat-unit"> no total</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Volume</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {loading ? "–" : totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}k`
              : totalVolume.toFixed(0)}
            <span className="stat-unit">kg</span>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {!loading && (
        <div className="grid-3">
          {/* Calendar — decorativo por enquanto, sem datas de execução */}
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 16, textTransform: "capitalize" }}>{mesLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
              {DAY_NAMES.map((d, i) => (
                <div key={i} style={{
                  fontSize: 10, color: "var(--text-mute)", textAlign: "center",
                  fontWeight: 700, letterSpacing: "0.1em",
                }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
              {calendarCells.map((c, i) => (
                <div key={i} style={{
                  aspectRatio: "1", borderRadius: 8,
                  background: i < firstDayOfWeek ? "transparent" : "var(--surface-2)",
                  border: i < firstDayOfWeek ? "none" : "1px dashed var(--border-soft)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {i >= firstDayOfWeek && (
                    <span style={{ fontSize: 11, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>
                      {i - firstDayOfWeek + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="row gap-3" style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, flexWrap: "wrap" }}>
              {Object.entries(CODE_COLORS).map(([code, color]) => (
                <div key={code} className="row gap-2" style={{ fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
                  <span style={{ color: "var(--text-dim)" }}>Treino {code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treinos cadastrados */}
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 14 }}>Treinos cadastrados</div>
            {workouts.length === 0 ? (
              <div style={{ color: "var(--text-mute)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                Nenhum treino ainda.
              </div>
            ) : (
              <div className="col gap-3">
                {workouts.map((w, i) => (
                  <Link key={w.id} href={`/treinos/${w.id}`} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", textDecoration: "none",
                    borderBottom: i < workouts.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                      color: CODE_COLORS[w.code] ?? "var(--accent)", flexShrink: 0,
                    }}>{w.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                        {w.exercises.length} ex · {w.totalSets} séries · {w.duration} min
                      </div>
                    </div>
                    <div className="h-mono" style={{ fontSize: 12, color: "var(--accent)", flexShrink: 0 }}>
                      {w.volume >= 1000 ? `${(w.volume / 1000).toFixed(1)}k` : w.volume.toFixed(0)} kg
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
