"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, Play, Bookmark, Loader2 } from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";

const FILTERS = ["Todos", "Força", "Hipertrofia", "Volume", "Acessório"];

export default function TreinosPage() {
  const { workouts, loading, error } = useWorkouts();
  const [filter, setFilter] = useState("Todos");

  const filtered = workouts.filter(w =>
    filter === "Todos" || w.tags.includes(filter)
  );

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meus treinos</h1>
          <div className="page-sub">
            {loading ? "Carregando..." : `${workouts.length} treino${workouts.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        <div className="page-actions">
          <Link href="/ai-gen" className="btn btn-secondary">
            <Sparkles size={16} /> Gerar com IA
          </Link>
          <button className="btn btn-primary">
            <Plus size={16} /> Novo treino
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row gap-2" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f} className={`chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && workouts.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏋️</div>
          <div className="h-display" style={{ fontSize: 20, marginBottom: 8 }}>Nenhum treino ainda</div>
          <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>Crie seu primeiro treino ou deixe a IA montar um para você.</p>
          <Link href="/ai-gen" className="btn btn-primary">
            <Sparkles size={16} /> Gerar com IA
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {filtered.map(w => (
            <div key={w.id} className="card" style={{ padding: 24 }}>
              <div className="row between" style={{ marginBottom: 20 }}>
                <div className="row gap-3">
                  <div style={{
                    width: 52, height: 52, borderRadius: 13,
                    background: "var(--accent-soft)",
                    border: "1px solid rgba(0,255,136,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    color: "var(--accent)", fontSize: 22,
                  }}>{w.code}</div>
                  <div>
                    <div className="h-display" style={{ fontSize: 20 }}>{w.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{w.schedule}</div>
                  </div>
                </div>
                <button className="icon-btn" style={{ width: 32, height: 32 }}>
                  <Bookmark size={14} />
                </button>
              </div>

              <div className="row gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
                {w.tags.map(t => <span key={t} className="chip chip-accent">{t}</span>)}
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
                marginBottom: 20, padding: "14px 0",
                borderTop: "1px solid var(--border-soft)",
                borderBottom: "1px solid var(--border-soft)",
              }}>
                {[
                  [w.duration, "min"],
                  [w.exercises.length, "exercícios"],
                  [w.totalSets, "séries"],
                  [`${(w.volume / 1000).toFixed(1)}k`, "kg vol"],
                ].map(([v, l], i) => (
                  <div key={i}>
                    <div className="h-mono" style={{ fontSize: 17, fontWeight: 700 }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div className="row between">
                <div style={{ fontSize: 12, color: "var(--text-mute)" }}>
                  {w.lastDone ? `Último: há ${w.lastDone}` : "Nunca realizado"}
                </div>
                <Link href={`/treinos/${w.id}`} className="btn btn-primary btn-sm">
                  <Play size={12} fill="currentColor" /> Iniciar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
