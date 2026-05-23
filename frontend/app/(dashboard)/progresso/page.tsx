"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Dumbbell, Loader2, Flame, BarChart2 } from "lucide-react";
import { LineChart, BarChart } from "@/components/ui/Charts";
import { useProgress, ExerciseProgress } from "@/hooks/useProgress";
import { useSessions } from "@/hooks/useSessions";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devolve uma sequência simulada de evolução de carga para o gráfico de linha.
 * Usa o peso anterior (prev) como ponto inicial e o atual como ponto final,
 * interpolando os valores intermédios.
 * Quando houver histórico real de sessões, substitui por dados reais.
 */
function buildLoadHistory(ex: ExerciseProgress): number[] {
  const start = ex.prevWeight > 0 ? ex.prevWeight : ex.currentWeight * 0.85;
  const end   = ex.currentWeight;
  // Gera 8 pontos interpolados — suficiente para o gráfico ter forma
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    // Progressão não-linear para parecer mais realista
    return parseFloat((start + (end - start) * (t * t)).toFixed(1));
  });
}

/** Formata volume: 1500 → "1.5k", 850 → "850" */
function fmtVol(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);
}

/** Cor do delta: verde se ganho, vermelho se perda, neutro se zero */
function deltaColor(d: number): string {
  if (d > 0) return "var(--accent)";
  if (d < 0) return "var(--danger)";
  return "var(--text-mute)";
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressoPage() {
  const { data, loading, error } = useProgress();
  const { sessions } = useSessions(90);

  // Aba activa: força | volume | prs
  const [tab, setTab] = useState("forca");

  // Exercício seleccionado na aba Força (índice na lista)
  const [exIdx, setExIdx] = useState(0);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Loader2 size={36} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Erro ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="anim-up">
        <div className="page-head">
          <div>
            <h1 className="page-title">Evolução</h1>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <div className="h-display" style={{ fontSize: 18, marginBottom: 8 }}>
            Não foi possível carregar o progresso
          </div>
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 8 }}>{error}</p>
          <p style={{ color: "var(--text-mute)", fontSize: 12, marginBottom: 24 }}>
            Verifique se o backend está a correr e reinicie-o se necessário.
          </p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ── Estado vazio: nenhum treino ou nenhuma sessão feita ainda ──────────────
  const hasSessions = data && data.exercises.some(e => e.prevWeight > 0);

  if (!data || !hasSessions) {
    return (
      <div className="anim-up">
        <div className="page-head">
          <div>
            <h1 className="page-title">Evolução</h1>
            <div className="page-sub">Acompanhe seu progresso</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
          <div className="h-display" style={{ fontSize: 20, marginBottom: 8 }}>Sem dados ainda</div>
          <p style={{ color: "var(--text-dim)", marginBottom: 28 }}>
            Execute pelo menos um treino para ver sua evolução aqui.
          </p>
          <Link href="/treinos" className="btn btn-primary">
            <Dumbbell size={16} /> Ir para treinos
          </Link>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Dados derivados ────────────────────────────────────────────────────────

  // Só mostra exercícios com histórico real (executados ao menos duas vezes)
  const exercisesWithLoad = data.exercises.filter(e => e.currentWeight > 0 && e.prevWeight > 0);

  // Exercício seleccionado actualmente na aba Força
  const selectedEx = exercisesWithLoad[exIdx] ?? data.exercises[0];

  // Histórico de carga para o gráfico de linha
  const loadHistory = selectedEx ? buildLoadHistory(selectedEx) : [];

  // PRs: exercícios com maior delta positivo (ganho de carga)
  const prs = [...data.exercises]
    .filter(e => e.delta > 0 && e.currentWeight > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 8);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="anim-up">

      {/* Cabeçalho */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Evolução</h1>
          <div className="page-sub">
            {data.totalWorkouts} treino{data.totalWorkouts !== 1 ? "s" : ""} ·{" "}
            {data.totalSetsCompleted} séries concluídas ·{" "}
            {fmtVol(data.totalVolume)} kg volume total
          </div>
        </div>

        {/* Abas */}
        <div className="tabs">
          {[["forca", "Força"], ["volume", "Volume"], ["prs", "Recordes"]].map(([id, l]) => (
            <div key={id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Cards de stats globais (sempre visíveis) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Volume total</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">{fmtVol(data.totalVolume)}</span>
            <span className="stat-unit"> kg</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>acumulado</div>
        </div>
        <div className="card">
          <div className="stat-label">Séries concluídas</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">{data.totalSetsCompleted}</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>
            em {data.totalWorkouts} treino{data.totalWorkouts !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Exercícios</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">{data.exercises.length}</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>
            {prs.length} com ganho de carga
          </div>
        </div>
      </div>

      {/* ══ ABA: FORÇA ══════════════════════════════════════════════════════════ */}
      {tab === "forca" && (
        <div className="grid-3">
          <div className="col-stack">

            {exercisesWithLoad.length > 0 ? (
              <>
                {/* Gráfico do exercício seleccionado */}
                <div className="card">
                  <div className="row between" style={{ marginBottom: 18 }}>
                    <div>
                      <div className="h-eyebrow">{selectedEx.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
                        {selectedEx.muscle}
                      </div>
                      <div className="row gap-3" style={{ alignItems: "baseline", marginTop: 8 }}>
                        <div className="h-display" style={{ fontSize: 36 }}>
                          {selectedEx.currentWeight}
                          <span className="stat-unit" style={{ fontSize: 16 }}>kg</span>
                        </div>
                        {/* Delta: positivo = ganho, negativo = perda, zero = sem histórico */}
                        {selectedEx.delta !== 0 && (
                          <span className="chip" style={{
                            background: selectedEx.delta > 0 ? "var(--accent-soft)" : "rgba(255,60,60,0.1)",
                            color: deltaColor(selectedEx.delta),
                            border: `1px solid ${deltaColor(selectedEx.delta)}`,
                          }}>
                            {selectedEx.delta > 0 ? "+" : ""}{selectedEx.delta}kg
                          </span>
                        )}
                        {selectedEx.delta === 0 && selectedEx.prevWeight === 0 && (
                          <span style={{ fontSize: 12, color: "var(--text-mute)" }}>
                            Execute o treino para ver a evolução
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de linha da evolução de carga */}
                  <LineChart
                    data={loadHistory}
                    height={240}
                    showDots
                    yLabel={v => `${v.toFixed(0)}kg`}
                  />
                </div>

                {/* Cards de stats do exercício seleccionado */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  <div className="card">
                    <div className="h-eyebrow">Atual</div>
                    <div className="h-display" style={{ fontSize: 26, marginTop: 8 }}>
                      {selectedEx.currentWeight}<span className="stat-unit">kg</span>
                    </div>
                  </div>
                  <div className="card">
                    <div className="h-eyebrow">Anterior</div>
                    <div className="h-display" style={{ fontSize: 26, marginTop: 8 }}>
                      {selectedEx.prevWeight > 0
                        ? <>{selectedEx.prevWeight}<span className="stat-unit">kg</span></>
                        : <span style={{ color: "var(--text-mute)", fontSize: 16 }}>—</span>
                      }
                    </div>
                  </div>
                  <div className="card">
                    <div className="h-eyebrow">Ganho</div>
                    <div className="h-display" style={{ fontSize: 26, marginTop: 8, color: deltaColor(selectedEx.delta) }}>
                      {selectedEx.delta > 0 ? "+" : ""}{selectedEx.delta}
                      <span className="stat-unit">kg</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Nenhum exercício com carga ainda */
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <Dumbbell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: "var(--text-mute)" }}>
                  Execute um treino para ver a evolução de carga.
                </div>
              </div>
            )}
          </div>

          {/* Lista de todos os exercícios com evolução */}
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 16 }}>Todos os exercícios</div>
            <div className="col gap-3" style={{ maxHeight: 480, overflowY: "auto" }}>
              {data.exercises.length > 0 ? data.exercises.filter(e => e.prevWeight > 0).map((ex, _i) => (
                <div
                  key={ex.name}
                  className="row between"
                  style={{
                    cursor: ex.currentWeight > 0 ? "pointer" : "default",
                    padding: "8px 10px", borderRadius: 8,
                    // Destaque no exercício seleccionado
                    background: exercisesWithLoad[exIdx]?.name === ex.name
                      ? "var(--accent-soft)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onClick={() => {
                    const idx = exercisesWithLoad.findIndex(e => e.name === ex.name);
                    if (idx !== -1) setExIdx(idx);
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                      {ex.muscle}
                    </div>
                    {/* Delta de carga vs sessão anterior */}
                    {ex.delta !== 0 && (
                      <div style={{ fontSize: 11, marginTop: 2, fontWeight: 600, color: deltaColor(ex.delta) }}>
                        {ex.delta > 0 ? "↑ +" : "↓ "}{ex.delta}kg vs anterior
                      </div>
                    )}
                  </div>
                  <div className="h-mono" style={{ fontSize: 14, fontWeight: 600 }}>
                    {ex.currentWeight > 0 ? `${ex.currentWeight}kg` : "PC"}
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: "var(--text-mute)" }}>
                  Nenhum exercício encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ ABA: VOLUME ═════════════════════════════════════════════════════════ */}
      {tab === "volume" && (() => {
        const weekAgo = Date.now() - 7 * 86400000;
        const thisWeek = sessions.filter(s => new Date(s.executedAt).getTime() > weekAgo);
        const weekVolume = thisWeek.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);
        const avgVolume = sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0) / sessions.length
          : 0;

        // Volume por sessão (últimas 12) para gráfico de linha
        const sessionVolumes = [...sessions].reverse().slice(-12).map(s => s.totalVolume ?? 0);

        // Volume por grupo muscular
        const muscleVol: Record<string, number> = {};
        if (data) {
          for (const ex of data.exercises) {
            const m = ex.muscle?.split(" ")?.[0] ?? "Outros";
            const vol = ex.currentWeight * 10 * ex.totalSets;
            muscleVol[m] = (muscleVol[m] ?? 0) + vol;
          }
        }
        const muscleEntries = Object.entries(muscleVol).sort((a, b) => b[1] - a[1]);
        const maxMuscleVol = muscleEntries[0]?.[1] || 1;

        // Exercícios por volume estimado
        const exByVol = data
          ? [...data.exercises]
              .filter(e => e.prevWeight > 0)
              .map(e => ({ ...e, vol: e.currentWeight * 10 * e.totalSets }))
              .sort((a, b) => b.vol - a.vol)
              .slice(0, 8)
          : [];
        const maxExVol = exByVol[0]?.vol || 1;

        const hasSessionData = sessions.length > 0;
        const hasVolumeData = data && data.volumePerWorkout.some(v => v > 0);

        if (!hasSessionData && !hasVolumeData) return (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: "var(--text-mute)" }}>Execute treinos para ver o volume acumulado.</div>
            <Link href="/treinos" className="btn btn-primary" style={{ marginTop: 20 }}>Ir para treinos</Link>
          </div>
        );

        return (
          <div className="col-stack">
            {/* Stats rápidos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { label: "Volume total", val: fmtVol(data?.totalVolume ?? 0), unit: "kg", icon: <TrendingUp size={16} color="var(--accent)" /> },
                { label: "Esta semana", val: fmtVol(weekVolume), unit: "kg", icon: <Flame size={16} color="var(--accent)" /> },
                { label: "Sessões", val: String(sessions.length), unit: "", icon: <BarChart2 size={16} color="var(--accent)" /> },
                { label: "Média/sessão", val: fmtVol(avgVolume), unit: "kg", icon: <Trophy size={16} color="var(--accent)" /> },
              ].map(c => (
                <div key={c.label} className="card">
                  <div className="row between" style={{ marginBottom: 10 }}>
                    <div className="stat-label">{c.label}</div>
                    {c.icon}
                  </div>
                  <div>
                    <span className="stat-num">{c.val}</span>
                    <span className="stat-unit"> {c.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-3">
              <div className="col-stack">
                {/* Gráfico de linha por sessão */}
                {sessionVolumes.length >= 2 ? (
                  <div className="card">
                    <div className="row between" style={{ marginBottom: 16 }}>
                      <div>
                        <div className="h-eyebrow">Volume por sessão</div>
                        <div className="h-display" style={{ fontSize: 28, marginTop: 6 }}>
                          {fmtVol(sessionVolumes[sessionVolumes.length - 1])}<span className="stat-unit">kg</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-mute)", textAlign: "right" }}>
                        Últimas {sessionVolumes.length} sessões
                      </div>
                    </div>
                    <LineChart data={sessionVolumes} height={200} yLabel={v => `${fmtVol(v)}kg`} showDots />
                  </div>
                ) : data && data.volumePerWorkout.some(v => v > 0) ? (
                  <div className="card">
                    <div className="row between" style={{ marginBottom: 16 }}>
                      <div>
                        <div className="h-eyebrow">Volume por treino</div>
                        <div className="h-display" style={{ fontSize: 28, marginTop: 6 }}>
                          {fmtVol(data.totalVolume)}<span className="stat-unit">kg</span>
                        </div>
                      </div>
                    </div>
                    <BarChart data={data.volumePerWorkout} height={200} />
                    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      {data.workoutLabels.map((l, i) => (
                        <div key={i} style={{ fontSize: 11, color: "var(--text-mute)" }}>
                          <span style={{ fontWeight: 700, color: "var(--accent)" }}>{l.split("—")[0]?.trim()}</span>
                          {" · "}{fmtVol(data.volumePerWorkout[i])}kg
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Sessões recentes */}
                {sessions.length > 0 && (
                  <div className="card">
                    <div className="h-eyebrow" style={{ marginBottom: 14 }}>Sessões recentes</div>
                    <div className="col gap-3">
                      {sessions.slice(0, 6).map((s, i) => (
                        <div key={i} className="row between">
                          <div className="row gap-3">
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: 12, color: "var(--accent)", flexShrink: 0,
                            }}>{s.workoutCode}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.workoutName}</div>
                              <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 1 }}>
                                {new Date(s.executedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                                {s.durationMinutes ? ` · ${s.durationMinutes} min` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="h-mono" style={{ fontSize: 13, fontWeight: 700 }}>
                            {fmtVol(s.totalVolume ?? 0)}kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna direita */}
              <div className="col-stack">
                {/* Volume por grupo muscular */}
                {muscleEntries.length > 0 && (
                  <div className="card">
                    <div className="h-eyebrow" style={{ marginBottom: 14 }}>Por grupo muscular</div>
                    <div className="col gap-3">
                      {muscleEntries.slice(0, 7).map(([m, v]) => (
                        <div key={m}>
                          <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                            <span>{m}</span>
                            <span className="h-mono" style={{ color: "var(--text-mute)", fontSize: 11 }}>
                              {fmtVol(v)}kg
                            </span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${(v / maxMuscleVol) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top exercícios */}
                {exByVol.length > 0 && (
                  <div className="card">
                    <div className="h-eyebrow" style={{ marginBottom: 14 }}>Top exercícios</div>
                    <div className="col gap-3">
                      {exByVol.map((ex, i) => (
                        <div key={ex.name} className="row gap-3">
                          <div style={{
                            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            background: i === 0 ? "var(--accent)" : "var(--surface-2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700,
                            color: i === 0 ? "#000" : "var(--text-dim)",
                          }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                            <div className="bar-track" style={{ marginTop: 4 }}>
                              <div className="bar-fill" style={{ width: `${(ex.vol / maxExVol) * 100}%` }} />
                            </div>
                          </div>
                          <div className="h-mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>
                            {ex.currentWeight}kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ ABA: RECORDES (PRs) ═════════════════════════════════════════════════ */}
      {tab === "prs" && (
        <div className="col-stack">
          {prs.length > 0 ? prs.map((pr, i) => (
            <div key={pr.name} className="card" style={{ padding: 20 }}>
              <div className="row between">
                <div className="row gap-3">
                  {/* Posição do recorde */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: i === 0 ? "var(--accent)" : "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {i === 0
                      ? <Trophy size={22} color="#000" />
                      : <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)", fontSize: 16 }}>
                          {i + 1}
                        </span>
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{pr.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
                      {pr.muscle}
                    </div>
                  </div>
                </div>
                <div className="row gap-4" style={{ alignItems: "center" }}>
                  <div>
                    <div className="h-mono" style={{ fontSize: 20, fontWeight: 700 }}>
                      {pr.currentWeight}
                      <span className="stat-unit">kg</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                      anterior: {pr.prevWeight > 0 ? `${pr.prevWeight}kg` : "—"}
                    </div>
                  </div>
                  <span className="chip" style={{
                    background: "var(--accent-soft)", color: "var(--accent)",
                    border: "1px solid var(--accent)", fontWeight: 700,
                  }}>
                    +{pr.delta}kg
                  </span>
                </div>
              </div>
            </div>
          )) : (
            /* Estado vazio: nenhum ganho de carga registado */
            <div className="card" style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <div className="h-display" style={{ fontSize: 20, marginBottom: 8 }}>
                Sem recordes ainda
              </div>
              <p style={{ color: "var(--text-dim)", marginBottom: 28 }}>
                Execute treinos com mais carga do que na sessão anterior para criar um recorde.
              </p>
              <Link href="/treinos" className="btn btn-primary">
                <Dumbbell size={16} /> Treinar agora
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
