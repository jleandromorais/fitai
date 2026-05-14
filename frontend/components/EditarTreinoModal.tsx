"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Search, Info, Check, Dumbbell } from "lucide-react";
import { EXERCISE_CATALOG, ExerciseSuggestion, ALL_GROUPS } from "@/lib/exercises";
import { useWorkouts, Workout } from "@/hooks/useWorkouts";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────

interface SetRow { reps: number; weight: number; rest: number; }

interface ExerciseRow {
  id: string;
  name: string;
  muscle: string;
  group: string;
  sets: SetRow[];
  tips: string;
}

interface Props {
  workout: Workout;   // treino existente que será editado
  onClose: () => void;
  onSaved: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }
function makeSet(reps = 10, weight = 0, rest = 60): SetRow { return { reps, weight, rest }; }

const DAYS_OPTIONS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const TAGS_OPTIONS = ["Força", "Hipertrofia", "Volume", "Acessório", "Resistência", "Funcional"];

/**
 * Converte os exercícios vindos do backend (Exercise[]) para o formato
 * interno do modal (ExerciseRow[]) que inclui sets com campo `rest`.
 */
function toExerciseRows(workout: Workout): ExerciseRow[] {
  return workout.exercises.map(ex => ({
    id: uid(),
    name: ex.name,
    muscle: ex.muscle ?? "",
    // Tenta inferir o grupo a partir do muscle (primeira palavra)
    group: ex.muscle?.split(" ")?.[0] ?? "",
    tips: "",
    sets: ex.sets.map(s => ({
      reps: s.reps,
      weight: s.weight,
      // Usa o restSeconds do exercício como descanso padrão para todas as séries
      rest: ex.restSeconds ?? 60,
    })),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function EditarTreinoModal({ workout, onClose, onSaved }: Props) {
  const { updateWorkout } = useWorkouts();

  // Pré-popula com os dados existentes do treino
  const [name, setName] = useState(workout.name);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    workout.schedule ? workout.schedule.split(/[,·\s]+/).map(d => d.trim()).filter(Boolean) : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(workout.tags ?? []);
  const [exercises, setExercises] = useState<ExerciseRow[]>(toExerciseRows(workout));

  // Busca e grupo ativo no catálogo
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>(ALL_GROUPS[0]);
  const [tipFor, setTipFor] = useState<string | null>(null);

  // Controla qual aba está activa: "info" ou "exercicios"
  const [tab, setTab] = useState<"info" | "exercicios">("info");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === "exercicios") searchRef.current?.focus();
  }, [tab]);

  // Fecha com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Gestão de exercícios ────────────────────────────────────────────────────

  function addExercise(sug: ExerciseSuggestion) {
    setExercises(prev => [
      ...prev,
      {
        id: uid(), name: sug.name, muscle: sug.muscle, group: sug.group, tips: sug.tips,
        sets: Array.from({ length: sug.defaultSets }, () =>
          makeSet(sug.defaultReps, sug.defaultWeight, sug.defaultRest)
        ),
      },
    ]);
    setQuery("");
  }

  function addCustomExercise() {
    const n = query.trim();
    if (!n) return;
    setExercises(prev => [...prev, { id: uid(), name: n, muscle: activeGroup, group: activeGroup, tips: "", sets: [makeSet()] }]);
    setQuery("");
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id));
  }

  function addSet(exId: string) {
    setExercises(prev => prev.map(e => e.id !== exId ? e : {
      ...e, sets: [...e.sets, makeSet(e.sets.at(-1)?.reps ?? 10, e.sets.at(-1)?.weight ?? 0, e.sets.at(-1)?.rest ?? 60)],
    }));
  }

  function removeSet(exId: string, i: number) {
    setExercises(prev => prev.map(e => e.id !== exId ? e : { ...e, sets: e.sets.filter((_, j) => j !== i) }));
  }

  function updateSet(exId: string, i: number, field: keyof SetRow, value: number) {
    setExercises(prev => prev.map(e => e.id !== exId ? e : {
      ...e, sets: e.sets.map((s, j) => j !== i ? s : { ...s, [field]: value }),
    }));
  }

  // ── Submissão ───────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!name.trim()) return setError("Dê um nome ao treino.");
    if (exercises.length === 0) return setError("Adicione pelo menos 1 exercício.");
    setError(null);
    setSaving(true);
    try {
      await updateWorkout(workout.id, {
        name: name.trim(),
        // Mantém o code original ou regenera se o nome mudou
        code: workout.code,
        schedule: selectedDays.join(", "),
        tags: selectedTags,
        exercises: exercises.map(ex => ({
          name: ex.name,
          muscle: ex.muscle,
          restSeconds: ex.sets[0]?.rest ?? 60,
          sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, done: false, prev: 0 })),
        })),
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  // ── Sugestões do catálogo ───────────────────────────────────────────────────

  const suggestions: ExerciseSuggestion[] = EXERCISE_CATALOG.filter(ex => {
    const matchGroup = activeGroup === "__all__" || ex.group === activeGroup;
    const matchQuery = query.length < 2 || ex.name.toLowerCase().includes(query.toLowerCase());
    return matchGroup && matchQuery;
  });

  const alreadyAdded = new Set(exercises.map(e => e.name));

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", zIndex: 1000,
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: tab === "exercicios" ? "min(900px, 96vw)" : "min(520px, 96vw)",
        maxHeight: "90vh",
        background: "var(--bg)", border: "1.5px solid var(--border)",
        borderRadius: 18, boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        zIndex: 1001, display: "flex", flexDirection: "column",
        overflow: "hidden", transition: "width 0.3s ease",
      }}>

        {/* Cabeçalho */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border-soft)", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
              Editar treino
            </div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
              {workout.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Abas: Informações / Exercícios */}
        <div style={{
          display: "flex", borderBottom: "1px solid var(--border-soft)",
          padding: "0 24px", flexShrink: 0,
        }}>
          {(["info", "exercicios"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "12px 16px", fontSize: 13, fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                color: tab === t ? "var(--accent)" : "var(--text-mute)",
                borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                marginBottom: -1, transition: "all 0.15s",
              }}
            >
              {t === "info" ? "Informações" : `Exercícios (${exercises.length})`}
            </button>
          ))}
        </div>

        {/* Corpo */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>

          {/* ── Aba: Informações ── */}
          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>Nome do treino</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={labelStyle}>Dias da semana</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DAYS_OPTIONS.map(d => (
                    <button key={d} onClick={() => setSelectedDays(prev =>
                      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
                    )} style={chipToggleStyle(selectedDays.includes(d))}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tipo de estímulo</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TAGS_OPTIONS.map(t => (
                    <button key={t} onClick={() => setSelectedTags(prev =>
                      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                    )} style={chipToggleStyle(selectedTags.includes(t))}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Aba: Exercícios ── */}
          {tab === "exercicios" && (
            <div style={{ display: "flex", gap: 20, minHeight: 420 }}>

              {/* Painel esquerdo: catálogo */}
              <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Busca */}
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-mute)", pointerEvents: "none" }} />
                  <input ref={searchRef} className="input" placeholder="Buscar exercício..." value={query}
                    onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>

                {/* Filtro por grupo muscular */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {ALL_GROUPS.map(g => (
                    <button key={g} onClick={() => setActiveGroup(g)} style={{
                      textAlign: "left", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                      fontWeight: activeGroup === g ? 700 : 500,
                      background: activeGroup === g ? "var(--accent-soft)" : "transparent",
                      color: activeGroup === g ? "var(--accent)" : "var(--text-dim)",
                      border: `1.5px solid ${activeGroup === g ? "var(--accent)" : "transparent"}`,
                      cursor: "pointer", transition: "all 0.12s",
                    }}>
                      {g}
                      <span style={{ float: "right", fontSize: 10, opacity: 0.6 }}>
                        {EXERCISE_CATALOG.filter(e => e.group === g).length}
                      </span>
                    </button>
                  ))}
                  <button onClick={() => setActiveGroup("__all__")} style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                    fontWeight: activeGroup === "__all__" ? 700 : 500,
                    background: activeGroup === "__all__" ? "var(--accent-soft)" : "transparent",
                    color: activeGroup === "__all__" ? "var(--accent)" : "var(--text-dim)",
                    border: `1.5px solid ${activeGroup === "__all__" ? "var(--accent)" : "transparent"}`,
                    cursor: "pointer",
                  }}>
                    Todos
                  </button>
                </div>
              </div>

              {/* Painel direito: sugestões + lista adicionada */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 500 }}>

                {/* Sugestões */}
                <div style={labelStyle}>{query.length >= 2 ? `Resultados para "${query}"` : activeGroup === "__all__" ? "Todos" : activeGroup}</div>

                {suggestions.map(sug => {
                  const added = alreadyAdded.has(sug.name);
                  return (
                    <div key={sug.name} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderRadius: 10, background: added ? "var(--accent-soft)" : "var(--surface-2)",
                      border: `1.5px solid ${added ? "var(--accent)" : "var(--border-soft)"}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: added ? "var(--accent)" : "var(--text)" }}>{sug.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                          {sug.muscle} · {sug.defaultSets}×{sug.defaultReps} · {sug.defaultWeight > 0 ? `${sug.defaultWeight}kg` : "PC"}
                        </div>
                      </div>
                      <button onClick={() => setTipFor(tipFor === sug.name ? null : sug.name)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 4 }}>
                        <Info size={14} />
                      </button>
                      <button onClick={() => !added && addExercise(sug)} disabled={added} style={{
                        padding: "4px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                        background: added ? "var(--accent)" : "var(--surface)",
                        color: added ? "#000" : "var(--accent)",
                        border: "1.5px solid var(--accent)", cursor: added ? "default" : "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {added ? <><Check size={12} /> Adicionado</> : <><Plus size={12} /> Adicionar</>}
                      </button>
                    </div>
                  );
                })}

                {/* Dica inline */}
                {tipFor && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.55, background: "var(--accent-soft)", border: "1.5px solid var(--accent)", color: "var(--accent)" }}>
                    <strong>Dica:</strong> {EXERCISE_CATALOG.find(e => e.name === tipFor)?.tips}
                  </div>
                )}

                {/* Exercício personalizado */}
                {query.trim().length >= 2 && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
                  <button className="btn btn-secondary" onClick={addCustomExercise} style={{ marginTop: 4 }}>
                    <Plus size={14} /> Adicionar &ldquo;{query.trim()}&rdquo; como personalizado
                  </button>
                )}

                {/* Exercícios já no treino */}
                {exercises.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={labelStyle}>No treino ({exercises.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {exercises.map((ex, exIdx) => (
                        <div key={ex.id} style={{ padding: 14, borderRadius: 12, background: "var(--surface-2)", border: "1.5px solid var(--border-soft)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                              {String(exIdx + 1).padStart(2, "0")}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                              <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{ex.muscle}</div>
                            </div>
                            <button onClick={() => removeExercise(ex.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Tabela de séries */}
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr>
                                {["Série", "Peso (kg)", "Reps", "Descanso (s)", ""].map(h => (
                                  <th key={h} style={{ textAlign: h === "" ? "right" : "left", padding: "4px 6px", color: "var(--text-mute)", fontWeight: 600, fontSize: 10, letterSpacing: "0.06em" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {ex.sets.map((s, i) => (
                                <tr key={i}>
                                  <td style={{ padding: "4px 6px", color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>{i + 1}</td>
                                  <td style={{ padding: "4px 6px" }}>
                                    <input type="number" min={0} step={0.5} value={s.weight}
                                      onChange={e => updateSet(ex.id, i, "weight", parseFloat(e.target.value) || 0)}
                                      style={numInputStyle} />
                                  </td>
                                  <td style={{ padding: "4px 6px" }}>
                                    <input type="number" min={1} value={s.reps}
                                      onChange={e => updateSet(ex.id, i, "reps", parseInt(e.target.value) || 1)}
                                      style={numInputStyle} />
                                  </td>
                                  <td style={{ padding: "4px 6px" }}>
                                    <input type="number" min={0} step={15} value={s.rest}
                                      onChange={e => updateSet(ex.id, i, "rest", parseInt(e.target.value) || 0)}
                                      style={numInputStyle} />
                                  </td>
                                  <td style={{ padding: "4px 6px", textAlign: "right" }}>
                                    {ex.sets.length > 1 && (
                                      <button onClick={() => removeSet(ex.id, i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 2 }}>
                                        <X size={12} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <button onClick={() => addSet(ex.id)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
                            <Plus size={12} /> Adicionar série
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exercises.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-mute)" }}>
                    <Dumbbell size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
                    <div style={{ fontSize: 13 }}>Nenhum exercício. Adicione acima.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px", borderTop: "1px solid var(--border-soft)", flexShrink: 0, gap: 12,
        }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          {error && <p style={{ fontSize: 12, color: "var(--danger)", flex: 1, textAlign: "center" }}>{error}</p>}
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações ✓"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "var(--text-mute)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 8,
};

function chipToggleStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-soft)" : "var(--surface-2)",
    color: active ? "var(--accent)" : "var(--text-dim)",
    cursor: "pointer", transition: "all 0.15s",
  };
}

const numInputStyle: React.CSSProperties = {
  width: 64, padding: "4px 8px", borderRadius: 7,
  background: "var(--surface)", border: "1px solid var(--border)",
  color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
  fontWeight: 600, outline: "none",
};
