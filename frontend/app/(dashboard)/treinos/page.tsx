"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, Play, Edit2, Trash2, Loader2 } from "lucide-react";
import { useWorkouts, Workout } from "@/hooks/useWorkouts";
import NovoTreinoModal from "@/components/NovoTreinoModal";
import EditarTreinoModal from "@/components/EditarTreinoModal";

const FILTERS = ["Todos", "Força", "Hipertrofia", "Volume", "Acessório"];

export default function TreinosPage() {
  const { workouts, loading, error, reload, deleteWorkout } = useWorkouts();
  const [filter, setFilter] = useState("Todos");

  // Controla abertura do modal de criação
  const [showNovo, setShowNovo] = useState(false);

  // Treino selecionado para edição (null = modal fechado)
  const [editando, setEditando] = useState<Workout | null>(null);

  // Treino aguardando confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = workouts.filter(w =>
    filter === "Todos" || w.tags.includes(filter)
  );

  async function handleDelete(w: Workout) {
    setDeleting(true);
    try {
      await deleteWorkout(w.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

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
          <button className="btn btn-primary" onClick={() => setShowNovo(true)}>
            <Plus size={16} /> Novo treino
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Erro */}
      {error && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Estado vazio */}
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

      {/* Grid de treinos */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {filtered.map(w => (
            <div key={w.id} className="card" style={{ padding: 24 }}>

              {/* Cabeçalho do card: código, nome, botões de ação */}
              <div className="row between" style={{ marginBottom: 20 }}>
                <div className="row gap-3">
                  <div style={{
                    width: 52, height: 52, borderRadius: 13,
                    background: "var(--accent-soft)", border: "1px solid rgba(0,255,136,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)", fontSize: 22,
                  }}>{w.code}</div>
                  <div>
                    <div className="h-display" style={{ fontSize: 20 }}>{w.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{w.schedule}</div>
                  </div>
                </div>

                {/* Botões editar e excluir */}
                <div className="row gap-2">
                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32 }}
                    title="Editar treino"
                    onClick={() => setEditando(w)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32, color: "var(--danger)" }}
                    title="Excluir treino"
                    onClick={() => setConfirmDelete(w)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="row gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
                {w.tags.map(t => <span key={t} className="chip chip-accent">{t}</span>)}
              </div>

              {/* Stats do treino */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
                marginBottom: 20, padding: "14px 0",
                borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)",
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

      {/* Modal de criação de novo treino */}
      {showNovo && (
        <NovoTreinoModal
          onClose={() => setShowNovo(false)}
          onCreated={reload}
        />
      )}

      {/* Modal de edição de treino existente */}
      {editando && (
        <EditarTreinoModal
          workout={editando}
          onClose={() => setEditando(null)}
          onSaved={reload}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      {confirmDelete && (
        <>
          <div onClick={() => setConfirmDelete(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)", zIndex: 1000,
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(400px, 90vw)", background: "var(--bg)",
            border: "1.5px solid var(--border)", borderRadius: 16,
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            padding: 28, zIndex: 1001,
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Excluir treino?
            </div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.55 }}>
              <strong style={{ color: "var(--text)" }}>{confirmDelete.name}</strong> será removido permanentemente.
              Esta ação não pode ser desfeita.
            </p>
            <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                disabled={deleting}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
