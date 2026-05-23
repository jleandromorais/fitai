"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Dumbbell, Loader2 } from "lucide-react";
import { LineChart, BarChart } from "@/components/ui/Charts";
import { useProgress, ExerciseProgress } from "@/hooks/useProgress";
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
      {tab === "volume" && (
        <div className="col-stack">

          {/* Gráfico de barras: volume por treino */}
          {data.volumePerWorkout.length > 0 && data.volumePerWorkout.some(v => v > 0) ? (
            <div className="card">
              <div className="row between" style={{ marginBottom: 18 }}>
                <div>
                  <div className="h-eyebrow">Volume por treino</div>
                  <div className="h-display" style={{ fontSize: 36, marginTop: 8 }}>
                    {fmtVol(data.totalVolume)}
                    <span className="stat-unit" style={{ fontSize: 16 }}> kg total</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--text-mute)" }}>Maior volume</div>
                  <div className="h-mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
                    {fmtVol(Math.max(...data.volumePerWorkout))} kg
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                    {data.workoutLabels[data.volumePerWorkout.indexOf(Math.max(...data.volumePerWorkout))]}
                  </div>
                </div>
              </div>
              <BarChart data={data.volumePerWorkout} height={280} />

              {/* Labels dos treinos abaixo do gráfico */}
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(data.workoutLabels.length, 6)}, 1fr)`,
                gap: 8, marginTop: 12,
              }}>
                {data.workoutLabels.map((label, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "var(--text-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {label}
                    </div>
                    <div className="h-mono" style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                      {fmtVol(data.volumePerWorkout[i])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: "var(--text-mute)" }}>
                Execute treinos para ver o volume acumulado.
              </div>
              <Link href="/treinos" className="btn btn-primary" style={{ marginTop: 20 }}>
                Ir para treinos
              </Link>
            </div>
          )}

          {/* Breakdown por exercício — volume de cada um */}
          {data.exercises.length > 0 && (
            <div className="card">
              <div className="h-eyebrow" style={{ marginBottom: 14 }}>Volume por exercício</div>
              <div className="col gap-3">
                {data.exercises.slice(0, 10).map(ex => {
                  // Volume estimado: peso × reps × séries (aproximação)
                  const estVol = ex.currentWeight * 10 * ex.totalSets;
                  const maxEstVol = data.exercises[0].currentWeight * 10 * data.exercises[0].totalSets || 1;
                  const pct = Math.min((estVol / maxEstVol) * 100, 100);
                  return (
                    <div key={ex.name}>
                      <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span>{ex.name}</span>
                        <span className="h-mono" style={{ color: "var(--text-mute)", fontSize: 11 }}>
                          {ex.totalSets} séries
                        </span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
