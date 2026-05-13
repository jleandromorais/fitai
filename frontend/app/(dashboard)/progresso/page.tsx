"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { LineChart, BarChart } from "@/components/ui/Charts";
import { BENCH_PROGRESS, SQUAT_PROGRESS, DEADLIFT_PROGRESS, WEEKLY_VOLUME, BODY_WEIGHT, BODY_FAT, PRS } from "@/lib/data";

const EXERCISES = [
  { id: "bench", label: "Supino", data: BENCH_PROGRESS },
  { id: "squat", label: "Agacho", data: SQUAT_PROGRESS },
  { id: "deadlift", label: "Terra", data: DEADLIFT_PROGRESS },
];

export default function ProgressoPage() {
  const [tab, setTab] = useState("strength");
  const [exercise, setExercise] = useState("bench");

  const exData = EXERCISES.find(e => e.id === exercise)!;
  const last = exData.data[exData.data.length - 1];
  const first = exData.data[0];

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Evolução</h1>
          <div className="page-sub">Acompanhe seu progresso</div>
        </div>
        <div className="tabs">
          {[["strength", "Força"], ["volume", "Volume"], ["body", "Corpo"], ["prs", "Recordes"]].map(([id, l]) => (
            <div key={id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── Força ── */}
      {tab === "strength" && (
        <div className="grid-3">
          <div className="col-stack">
            <div className="card">
              <div className="row between" style={{ marginBottom: 18 }}>
                <div>
                  <div className="h-eyebrow">{exData.label}</div>
                  <div className="row gap-3" style={{ alignItems: "baseline", marginTop: 8 }}>
                    <div className="h-display" style={{ fontSize: 36 }}>
                      {last}<span className="stat-unit" style={{ fontSize: 16 }}>kg</span>
                    </div>
                    <span className="chip chip-accent">+{(last - first).toFixed(1)}kg</span>
                  </div>
                </div>
                <div className="row gap-2">
                  {EXERCISES.map(e => (
                    <div key={e.id} className={`chip${exercise === e.id ? " active" : ""}`} onClick={() => setExercise(e.id)}>
                      {e.label}
                    </div>
                  ))}
                </div>
              </div>
              <LineChart data={exData.data} height={240} showDots yLabel={v => `${v.toFixed(0)}kg`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              <div className="card">
                <div className="h-eyebrow">Atual</div>
                <div className="h-display" style={{ fontSize: 26, marginTop: 8 }}>{last}<span className="stat-unit">kg</span></div>
              </div>
              <div className="card">
                <div className="h-eyebrow">Inicial</div>
                <div className="h-display" style={{ fontSize: 26, marginTop: 8 }}>{first}<span className="stat-unit">kg</span></div>
              </div>
              <div className="card">
                <div className="h-eyebrow">Variação</div>
                <div className="h-display" style={{ fontSize: 26, marginTop: 8, color: "var(--accent)" }}>
                  +{(last - first).toFixed(1)}<span className="stat-unit">kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 16 }}>Todos os exercícios</div>
            <div className="col gap-3">
              {[
                { n: "Supino reto", v: 72.5, d: "+12.5kg" },
                { n: "Agachamento", v: 100, d: "+20kg" },
                { n: "Terra", v: 130, d: "+30kg" },
                { n: "Desenvolvimento", v: 50, d: "+10kg" },
                { n: "Remada", v: 75, d: "+15kg" },
              ].map(e => (
                <div key={e.n} className="row between">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{e.n}</div>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>{e.d}</div>
                  </div>
                  <div className="h-mono" style={{ fontSize: 14, fontWeight: 600 }}>{e.v}kg</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Volume ── */}
      {tab === "volume" && (
        <div className="card">
          <div className="row between" style={{ marginBottom: 18 }}>
            <div>
              <div className="h-eyebrow">Volume semanal · 14 semanas</div>
              <div className="h-display" style={{ fontSize: 36, marginTop: 8 }}>
                {(WEEKLY_VOLUME[WEEKLY_VOLUME.length - 1] / 1000).toFixed(1)}k
                <span className="stat-unit" style={{ fontSize: 16 }}>kg</span>
              </div>
            </div>
          </div>
          <BarChart data={WEEKLY_VOLUME} height={280} />
        </div>
      )}

      {/* ── Corpo ── */}
      {tab === "body" && (
        <div className="grid-3">
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 8 }}>Peso</div>
            <div className="row between" style={{ alignItems: "baseline", marginBottom: 18 }}>
              <div className="h-display" style={{ fontSize: 36 }}>
                {BODY_WEIGHT[BODY_WEIGHT.length - 1]}<span className="stat-unit">kg</span>
              </div>
              <span className="chip chip-accent">↓ 1.3 kg</span>
            </div>
            <LineChart data={BODY_WEIGHT} height={200} showDots yLabel={v => v.toFixed(1)} />
          </div>
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 8 }}>% Gordura</div>
            <div className="row between" style={{ alignItems: "baseline", marginBottom: 18 }}>
              <div className="h-display" style={{ fontSize: 36 }}>
                {BODY_FAT[BODY_FAT.length - 1]}<span className="stat-unit">%</span>
              </div>
              <span className="chip chip-accent">↓ 1.8%</span>
            </div>
            <LineChart data={BODY_FAT} height={200} showDots yLabel={v => `${v.toFixed(1)}%`} />
          </div>
        </div>
      )}

      {/* ── PRs ── */}
      {tab === "prs" && (
        <div className="col-stack">
          {PRS.map((pr, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div className="row between">
                <div className="row gap-3">
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trophy size={22} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{pr.exercise}</div>
                    <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>{pr.date}</div>
                  </div>
                </div>
                <div className="row gap-4" style={{ alignItems: "center" }}>
                  <div className="h-mono" style={{ fontSize: 20, fontWeight: 700 }}>
                    {pr.weight}<span className="stat-unit">kg × {pr.reps}</span>
                  </div>
                  <span className="chip chip-accent">{pr.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
