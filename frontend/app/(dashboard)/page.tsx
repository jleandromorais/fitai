"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Play, Timer, Dumbbell, Target, Sparkles, Trophy, TrendingUp, Loader2 } from "lucide-react";
import { LineChart, Sparkline } from "@/components/ui/Charts";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts, Workout } from "@/hooks/useWorkouts";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "atleta";
  const { workouts, loading } = useWorkouts();

  const today = workouts[0] ?? null;

  const totalVolume = workouts.reduce((s, w) => s + w.volume, 0);
  const volumeLabel = totalVolume >= 1000
    ? `${(totalVolume / 1000).toFixed(1)}k`
    : totalVolume.toFixed(0);

  const weeklyVolumeData = workouts.slice(0, 8).map(w => w.volume).reverse();

  return (
    <div className="anim-up">
      {/* Page header */}
      <div className="page-head">
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="page-title">Bom dia, {firstName} 👋</h1>
          <div className="page-sub">
            {loading ? "Carregando treinos..." : today
              ? "Hora de mover ferro. Seu treino de hoje já está montado."
              : "Crie seu primeiro treino para começar."}
          </div>
        </div>
        <div className="page-actions">
          <button className="icon-btn"><Search size={18} /></button>
          <button className="icon-btn"><Bell size={18} /></button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Treinos</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">{loading ? "–" : workouts.length}</span>
            <span className="stat-unit">no total</span>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Volume total</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">{loading ? "–" : volumeLabel}</span>
            <span className="stat-unit">kg</span>
          </div>
          {weeklyVolumeData.length > 1 && (
            <div style={{ marginTop: 14, marginLeft: -4 }}>
              <Sparkline data={weeklyVolumeData} width={220} height={36} />
            </div>
          )}
        </div>
        <div className="card">
          <div className="stat-label">Exercícios</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">
              {loading ? "–" : workouts.reduce((s, w) => s + w.exercises.length, 0)}
            </span>
            <span className="stat-unit">cadastrados</span>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Séries</div>
          <div style={{ marginTop: 10 }}>
            <span className="stat-num">
              {loading ? "–" : workouts.reduce((s, w) => s + w.totalSets, 0)}
            </span>
            <span className="stat-unit">no total</span>
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
          {/* Left col */}
          <div className="col-stack">

            {/* Hero: treino de hoje */}
            {today ? (
              <div className="card card-accent" style={{ padding: 28 }}>
                <div>
                  <div className="h-eyebrow" style={{ color: "var(--accent)" }}>Próximo treino</div>
                  <h2 className="h-display" style={{ fontSize: 36, margin: "12px 0 16px" }}>{today.name}</h2>
                  <div className="row gap-4" style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
                    <div className="row gap-2"><Timer size={16} /> {today.duration} min</div>
                    <div className="row gap-2"><Dumbbell size={16} /> {today.exercises.length} exercícios</div>
                    <div className="row gap-2"><Target size={16} /> {today.totalSets} séries</div>
                  </div>
                  <Link href={`/treinos/${today.id}`} className="btn btn-primary btn-lg">
                    <Play size={14} fill="currentColor" /> Começar treino
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card card-accent" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏋️</div>
                <div className="h-display" style={{ fontSize: 22, marginBottom: 12 }}>Sem treinos ainda</div>
                <Link href="/ai-gen" className="btn btn-primary btn-lg">
                  <Sparkles size={14} /> Gerar com IA
                </Link>
              </div>
            )}

            {/* Treinos recentes */}
            {workouts.length > 0 && (
              <div>
                <div className="row between" style={{ marginBottom: 12 }}>
                  <h3 className="h-display" style={{ fontSize: 18 }}>Treinos recentes</h3>
                  <Link href="/treinos" style={{ fontSize: 13, color: "var(--text-dim)" }}>Ver tudo</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {workouts.slice(0, 4).map(w => (
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
                            {w.duration} min · {w.exercises.length} ex
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
                Crie um plano personalizado com a IA. Ela monta treinos baseados no seu nível, objetivo e equipamentos disponíveis.
              </div>
              <Link href="/ai-gen" className="btn btn-primary btn-sm" style={{ display: "inline-flex" }}>
                <Sparkles size={14} /> Gerar treino
              </Link>
            </div>

            {/* Volume por treino */}
            {workouts.length > 0 && (
              <div className="card">
                <div className="row between" style={{ marginBottom: 14 }}>
                  <div className="h-eyebrow">Volume por treino</div>
                  <TrendingUp size={16} color="var(--accent)" />
                </div>
                <div className="col gap-3">
                  {workouts.slice(0, 4).map(w => (
                    <div key={w.id}>
                      <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span>{w.name}</span>
                        <span className="h-mono" style={{ color: "var(--text-mute)" }}>
                          {w.volume >= 1000 ? `${(w.volume / 1000).toFixed(1)}k` : w.volume.toFixed(0)} kg
                        </span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{
                          width: totalVolume > 0 ? `${(w.volume / totalVolume) * 100}%` : "0%"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Músculos */}
            {workouts.length > 0 && (() => {
              const muscles = workouts
                .flatMap(w => w.exercises.map(e => e.muscle))
                .filter(Boolean);
              const counts = muscles.reduce<Record<string, number>>((acc, m) => {
                acc[m] = (acc[m] || 0) + 1;
                return acc;
              }, {});
              const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
              const max = sorted[0]?.[1] ?? 1;
              return sorted.length > 0 ? (
                <div className="card">
                  <div className="h-eyebrow" style={{ marginBottom: 14 }}>Foco muscular</div>
                  <div className="col gap-3">
                    {sorted.map(([m, n]) => (
                      <div key={m}>
                        <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                          <span>{m}</span>
                          <span className="h-mono" style={{ color: "var(--text-mute)" }}>{n} ex</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(n / max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
