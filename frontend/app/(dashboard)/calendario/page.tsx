"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Paleta de cores para os códigos dos treinos (A, B, C…)
const CODE_COLORS: Record<string, string> = {
  A: "var(--accent)",
  B: "#7DD3FC",
  C: "#FBBF24",
  D: "#F472B6",
  E: "#A78BFA",
  F: "#FB923C",
};

function codeColor(code: string): string {
  return CODE_COLORS[code?.toUpperCase()?.[0]] ?? "var(--accent)";
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de calendário
// ─────────────────────────────────────────────────────────────────────────────

// Retorna o nome do mês e ano formatado (ex: "Maio 2026")
function formatMonth(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^\w/, c => c.toUpperCase());
}

// Quantos dias tem o mês
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Dia da semana do 1.º dia do mês (0=Dom … 6=Sáb)
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const { workouts, loading } = useWorkouts();

  // Mês actual fixo (Maio 2026 — quando houver navegação, tornar estado)
  const now   = new Date(2026, 4, 1); // Maio 2026 (mês 4 = Maio)
  const year  = now.getFullYear();
  const month = now.getMonth();

  // ── Construir mapa de dias treinados ──────────────────────────────────────
  // Usa o campo `schedule` de cada treino para marcar os dias da semana
  // que têm treino programado e os mapeia para o mês actual.
  // Quando o backend guardar sessões executadas, substitui por dados reais.
  const trainedDays = useMemo(() => {
    const map: Record<number, { code: string; name: string; id: number }> = {};
    const total = daysInMonth(year, month);

    for (let day = 1; day <= total; day++) {
      const weekday = new Date(year, month, day).getDay(); // 0=Dom…6=Sáb
      const weekName = DAY_NAMES[weekday]; // ex: "Seg"

      // Verifica se algum treino está programado para este dia da semana
      for (const w of workouts) {
        if (!w.schedule) continue;
        // schedule pode ser "Seg, Qui" ou "Seg · Qui" — normaliza
        const days = w.schedule.split(/[,·\s]+/).map(d => d.trim());
        const matches = days.some(d =>
          weekName.toLowerCase().startsWith(d.toLowerCase().slice(0, 3))
        );
        if (matches) {
          map[day] = { code: w.code, name: w.name, id: w.id };
          break; // um dia pode ter só um treino no calendário
        }
      }
    }
    return map;
  }, [workouts, year, month]);

  // ── Stats derivadas ────────────────────────────────────────────────────────
  const trainedCount = Object.keys(trainedDays).length;
  const workingDays  = daysInMonth(year, month); // dias úteis no mês

  // Volume total de todos os treinos (dado real do backend)
  const totalVolume = workouts.reduce((s, w) => s + (w.volume ?? 0), 0);

  // Atividade recente: últimos 4 treinos cadastrados
  const recentWorkouts = [...workouts].slice(0, 4);

  // Células do calendário: espaços vazios antes do 1.º dia + dias do mês
  const offset = firstDayOfMonth(year, month);
  const cells  = daysInMonth(year, month);

  // ── Legenda: códigos únicos presentes no mês ──────────────────────────────
  const legendCodes = [...new Set(Object.values(trainedDays).map(v => v.code))];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Histórico</h1>
          <div className="page-sub">Treinos programados no mês</div>
        </div>
      </div>

      {/* Stats do mês */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="h-eyebrow">Dias com treino</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {trainedCount}
            <span className="stat-unit">/{workingDays} dias</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Treinos</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8, color: "var(--accent)" }}>
            {workouts.length}
            <span className="stat-unit"> planos</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Volume total</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume.toFixed(0)}
            <span className="stat-unit"> kg</span>
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">Frequência</div>
          <div className="h-display" style={{ fontSize: 30, marginTop: 8 }}>
            {workingDays > 0 ? Math.round((trainedCount / workingDays) * 100) : 0}
            <span className="stat-unit">%</span>
          </div>
        </div>
      </div>

      <div className="grid-3">

        {/* ── Calendário ── */}
        <div className="card">
          <div className="h-eyebrow" style={{ marginBottom: 16 }}>{formatMonth(now)}</div>

          {/* Cabeçalho dos dias da semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
              <div key={d} style={{
                fontSize: 9, color: "var(--text-mute)", textAlign: "center",
                fontWeight: 700, letterSpacing: "0.06em",
              }}>{d}</div>
            ))}
          </div>

          {/* Grade de dias */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>

            {/* Células vazias antes do 1.º dia */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Dias do mês */}
            {Array.from({ length: cells }).map((_, i) => {
              const day = i + 1;
              const trained = trainedDays[day];
              const isToday = day === new Date().getDate() &&
                              month === new Date().getMonth() &&
                              year  === new Date().getFullYear();

              return (
                <div key={day} style={{
                  aspectRatio: "1", borderRadius: 8,
                  background: trained ? "var(--surface-2)" : "transparent",
                  border: isToday
                    ? "1.5px solid var(--accent)"
                    : trained
                      ? "1px solid var(--border)"
                      : "1px dashed var(--border-soft)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  position: "relative", cursor: trained ? "pointer" : "default",
                  transition: "all 0.12s",
                }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: isToday ? "var(--accent)" : trained ? "var(--text-dim)" : "var(--text-mute)",
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </span>
                  {/* Código do treino programado para este dia */}
                  {trained && (
                    <span style={{
                      position: "absolute", bottom: 3,
                      fontSize: 7, fontWeight: 700,
                      color: codeColor(trained.code),
                    }}>
                      {trained.code}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda dos treinos */}
          {legendCodes.length > 0 && (
            <div style={{
              marginTop: 16, padding: "10px 12px",
              background: "var(--surface-2)", borderRadius: 10,
              display: "flex", gap: 12, flexWrap: "wrap",
            }}>
              {legendCodes.map(code => {
                const w = workouts.find(wk => wk.code === code);
                return (
                  <div key={code} className="row gap-2" style={{ fontSize: 11 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: codeColor(code), display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{ color: "var(--text-dim)" }}>
                      {code} — {w?.name ?? code}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Atividade recente ── */}
        <div className="card">
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>Seus treinos</div>

          {loading && (
            <p style={{ fontSize: 13, color: "var(--text-mute)" }}>Carregando...</p>
          )}

          {!loading && workouts.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Dumbbell size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-mute)" }}>
                Nenhum treino cadastrado ainda.
              </p>
              <Link href="/treinos" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Criar treino
              </Link>
            </div>
          )}

          <div className="col gap-3">
            {recentWorkouts.map((w, i) => (
              <Link key={w.id} href={`/treinos/${w.id}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", textDecoration: "none",
                borderBottom: i < recentWorkouts.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}>
                {/* Código colorido */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "var(--surface-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                  color: codeColor(w.code), flexShrink: 0,
                }}>
                  {w.code}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {w.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                    {w.schedule || "Sem dia definido"} · {w.exercises.length} exercícios
                  </div>
                </div>

                {/* Volume do treino */}
                <div className="h-mono" style={{ fontSize: 12, color: "var(--accent)", flexShrink: 0 }}>
                  {w.volume >= 1000
                    ? `${(w.volume / 1000).toFixed(1)}k`
                    : w.volume.toFixed(0)} kg
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
