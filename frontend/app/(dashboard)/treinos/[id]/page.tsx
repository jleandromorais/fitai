"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Play, Timer, Dumbbell, Target, Weight, Info, RefreshCw, Check, Loader2 } from "lucide-react";
import { useWorkout, Exercise } from "@/hooks/useWorkouts";

export default function TreinoDetalhe() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { workout, loading, error } = useWorkout(id);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (workout) setExercises(workout.exercises.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s })) })));
  }, [workout]);

  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) { setTimer(null); return; }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <Loader2 size={36} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !workout) return (
    <div className="card" style={{ textAlign: "center", padding: 60 }}>
      <p style={{ color: "var(--danger)" }}>{error ?? "Treino não encontrado."}</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.back()}>Voltar</button>
    </div>
  );

  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0);
  const doneSets = exercises.reduce((s, e) =>
    s + e.sets.filter((_, i) => completed[`${e.id}-${i}`] ?? e.sets[i].done).length, 0);
  const progress = totalSets ? (doneSets / totalSets) * 100 : 0;

  const th: React.CSSProperties = {
    padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-mute)",
  };
  const td: React.CSSProperties = { padding: "12px 16px" };

  return (
    <div className="anim-up">
      <div className="row gap-3" style={{ marginBottom: 16 }}>
        <button className="icon-btn" onClick={() => router.back()}><ArrowLeft size={18} /></button>
        <div className="h-eyebrow">Voltar · Treinos</div>
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">{workout.name}</h1>
          <div className="row gap-4" style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 12 }}>
            <div className="row gap-2"><Timer size={16} /> {workout.duration} min</div>
            <div className="row gap-2"><Dumbbell size={16} /> {workout.exercises.length} ex</div>
            <div className="row gap-2"><Target size={16} /> {totalSets} séries</div>
            <div className="row gap-2"><Weight size={16} /> {(workout.volume / 1000).toFixed(1)}k kg</div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Edit2 size={14} /> Editar</button>
          <button className="btn btn-primary btn-lg"><Play size={14} fill="currentColor" /> Iniciar treino</button>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="h-eyebrow">Progresso</div>
          <div className="h-mono" style={{ fontSize: 13 }}>{doneSets} / {totalSets} séries</div>
        </div>
        <div className="bar-track" style={{ height: 8 }}>
          <div className="bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid-3">
        <div className="col-stack">
          {exercises.map((ex, exIdx) => (
            <div key={ex.id ?? exIdx} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="row between" style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-soft)" }}>
                <div className="row gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--accent)",
                  }}>
                    {String(exIdx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="h-display" style={{ fontSize: 17 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
                      {ex.muscle} · Descanso {ex.restSeconds}s
                    </div>
                  </div>
                </div>
                <div className="row gap-2">
                  <button className="icon-btn" style={{ width: 32, height: 32 }}><Info size={14} /></button>
                  <button className="icon-btn" style={{ width: 32, height: 32 }}><RefreshCw size={14} /></button>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    <th style={{ ...th, width: 60 }}>Série</th>
                    <th style={th}>Anterior</th>
                    <th style={th}>Carga</th>
                    <th style={th}>Reps</th>
                    <th style={{ ...th, width: 70, textAlign: "right" }}>✓</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completed[key] ?? s.done;
                    return (
                      <tr key={i} style={{ borderTop: "1px solid var(--border-soft)" }}>
                        <td style={{ ...td, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>{i + 1}</td>
                        <td style={{ ...td, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>
                          {s.prev ? `${s.prev}kg × ${s.reps}` : "–"}
                        </td>
                        <td style={td}>
                          <input defaultValue={s.weight} style={{ width: 56, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, outline: "none" }} />
                          <span style={{ color: "var(--text-mute)", marginLeft: 4, fontSize: 11 }}>kg</span>
                        </td>
                        <td style={td}>
                          <input defaultValue={s.reps} style={{ width: 40, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, outline: "none" }} />
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setCompleted(prev => ({ ...prev, [key]: !isDone }));
                              if (!isDone) setTimer(ex.restSeconds);
                            }}
                            style={{
                              width: 30, height: 30, borderRadius: 8, border: "none",
                              background: isDone ? "var(--accent)" : "var(--surface-2)",
                              color: isDone ? "#000" : "var(--text-mute)",
                              display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            }}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="col-stack">
          {timer !== null && (
            <div className="card card-accent">
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="h-eyebrow" style={{ color: "var(--accent)" }}>Timer de descanso</div>
                <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
              </div>
              <div className="h-display" style={{ fontSize: 56, fontFamily: "var(--font-mono)" }}>
                0:{String(timer).padStart(2, "0")}
              </div>
              <div className="row gap-2" style={{ marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm flex-1" onClick={() => setTimer(null)}>Pular</button>
                <button className="btn btn-primary btn-sm flex-1" onClick={() => setTimer((timer ?? 0) + 30)}>+30s</button>
              </div>
            </div>
          )}

          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 12 }}>Músculos trabalhados</div>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              {[...new Set(exercises.map(e => e.muscle).filter(Boolean))].map(m => (
                <span key={m} className="chip chip-accent">{m}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 12 }}>Notas</div>
            <textarea placeholder="Como foi o treino?" style={{
              width: "100%", minHeight: 80, background: "var(--surface-2)",
              border: "1px solid var(--border)", borderRadius: 10, padding: 12,
              color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13,
              resize: "vertical", outline: "none",
            }} />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
