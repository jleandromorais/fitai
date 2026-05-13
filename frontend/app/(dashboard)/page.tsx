"use client";

"use client";

import Link from "next/link";
import { Search, Bell, Play, Timer, Dumbbell, Target, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { LineChart, Sparkline } from "@/components/ui/Charts";
import { WORKOUTS, WEEKLY_VOLUME, BENCH_PROGRESS } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "atleta";
  const today = WORKOUTS[0];
  const last = BENCH_PROGRESS[BENCH_PROGRESS.length - 1];

  return (
    <div className="anim-up">
      {/* Page header */}
      <div className="page-head">
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="page-title">Bom dia, {firstName} 👋</h1>
          <div className="page-sub">Hora de mover ferro. Seu treino de hoje já está montado.</div>
        </div>
        <div className="page-actions">
          <button className="icon-btn"><Search size={18} /></button>
          <button className="icon-btn"><Bell size={18} /></button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Meta semanal</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">4</span>
            <span className="stat-unit">/5 sessões</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>↑ 80%</div>
        </div>
        <div className="card">
          <div className="stat-label">Volume</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">14.2k</span>
            <span className="stat-unit">kg</span>
          </div>
          <div style={{ marginTop: 14, marginLeft: -4 }}>
            <Sparkline data={WEEKLY_VOLUME.slice(-8)} width={220} height={36} />
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Streak</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">12</span>
            <span className="stat-unit">dias</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>↑ recorde pessoal</div>
        </div>
        <div className="card">
          <div className="stat-label">Carga</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">+7%</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: "var(--accent)" }}>↑ vs mês passado</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid-3">
        {/* Left col */}
        <div className="col-stack">

          {/* Hero: treino de hoje */}
          <div className="card card-accent" style={{ padding: 28 }}>
            <div className="row gap-4">
              <div style={{ flex: 1 }}>
                <div className="h-eyebrow" style={{ color: "var(--accent)" }}>Treino de hoje</div>
                <h2 className="h-display" style={{ fontSize: 36, margin: "12px 0 16px" }}>{today.name}</h2>
                <div className="row gap-4" style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
                  <div className="row gap-2"><Timer size={16} /> {today.duration} min</div>
                  <div className="row gap-2"><Dumbbell size={16} /> {today.exercises} exercícios</div>
                  <div className="row gap-2"><Target size={16} /> {today.sets} séries</div>
                </div>
                <Link href={`/treinos/${today.id}`} className="btn btn-primary btn-lg">
                  <Play size={14} fill="currentColor" /> Começar treino
                </Link>
              </div>
              {/* Weekly checklist */}
              <div style={{ width: 200 }}>
                <div className="h-eyebrow" style={{ marginBottom: 12 }}>Esta semana</div>
                <div className="col gap-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d, i) => (
                    <div key={d} className="row between" style={{ fontSize: 12 }}>
                      <span style={{ color: "var(--text-mute)", width: 32 }}>{d}</span>
                      <div className="bar-track flex-1" style={{ marginLeft: 12 }}>
                        <div className="bar-fill" style={{ width: i < 3 ? "100%" : "0%" }} />
                      </div>
                      <span style={{
                        color: i < 3 ? "var(--accent)" : "var(--text-mute)",
                        width: 28, textAlign: "right",
                        fontFamily: "var(--font-mono)", fontSize: 11
                      }}>
                        {i < 3 ? "✓" : "–"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart: supino */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 16 }}>
              <div>
                <div className="h-eyebrow">Supino reto · 12 semanas</div>
                <div className="h-display" style={{ fontSize: 22, marginTop: 6 }}>
                  {last}<span className="stat-unit">kg · 6 reps</span>
                </div>
              </div>
              <Link href="/progresso" className="btn btn-secondary btn-sm">
                Ver tudo →
              </Link>
            </div>
            <LineChart data={BENCH_PROGRESS} height={160} showDots yLabel={v => `${v.toFixed(0)}kg`} />
          </div>

          {/* Treinos recentes */}
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <h3 className="h-display" style={{ fontSize: 18 }}>Treinos recentes</h3>
              <Link href="/treinos" style={{ fontSize: 13, color: "var(--text-dim)" }}>Ver tudo</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {WORKOUTS.slice(0, 4).map(w => (
                <Link key={w.id} href={`/treinos/${w.id}`} className="card card-tight" style={{ display: "block" }}>
                  <div className="row gap-3">
                    <div style={{
                      width: 44, height: 44, borderRadius: 11,
                      background: "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)"
                    }}>{w.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
                        {w.duration} min · {w.exercises} ex · {w.lastDone}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="col-stack">
          {/* IA suggestion */}
          <div className="card card-accent">
            <div className="row gap-2" style={{ marginBottom: 12 }}>
              <Sparkles size={16} color="var(--accent)" />
              <div className="h-eyebrow" style={{ color: "var(--accent)" }}>Sugestão da IA</div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>
              Notei que você está progredindo no supino. Sugiro adicionar um drop-set no final hoje.
            </div>
            <div className="row gap-2">
              <button className="btn btn-primary btn-sm flex-1">Aceitar</button>
              <button className="btn btn-ghost btn-sm">Dispensar</button>
            </div>
          </div>

          {/* PR */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <div className="h-eyebrow">Recorde recente</div>
              <Trophy size={16} color="var(--accent)" />
            </div>
            <div className="h-display" style={{ fontSize: 28 }}>72.5 kg</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>Supino reto · 6 reps</div>
            <div className="row gap-2" style={{
              marginTop: 16, padding: "10px 12px",
              background: "var(--surface-2)", borderRadius: 10
            }}>
              <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>+2.5kg</span>
              <span style={{ fontSize: 12, color: "var(--text-mute)" }}>vs. anterior · há 2 dias</span>
            </div>
          </div>

          {/* Foco muscular */}
          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 14 }}>Foco da semana</div>
            <div className="col gap-3">
              {[
                { l: "Peitoral", v: 85 },
                { l: "Costas",   v: 70 },
                { l: "Pernas",   v: 55 },
                { l: "Ombros",   v: 40 },
              ].map(r => (
                <div key={r.l}>
                  <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                    <span>{r.l}</span>
                    <span className="h-mono" style={{ color: "var(--text-mute)" }}>{r.v}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${r.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume trend */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="h-eyebrow">Volume semanal</div>
              <TrendingUp size={16} color="var(--accent)" />
            </div>
            <div className="h-display" style={{ fontSize: 22 }}>
              {(WEEKLY_VOLUME[WEEKLY_VOLUME.length - 1] / 1000).toFixed(1)}k
              <span className="stat-unit">kg</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <Sparkline data={WEEKLY_VOLUME.slice(-12)} width={280} height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
