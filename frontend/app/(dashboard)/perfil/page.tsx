"use client";

import { Bell, Settings, Flame, Trophy, Target, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const { workouts } = useWorkouts();

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "?";

  const totalVolume = workouts.reduce((sum, w) => sum + (w.volume ?? 0), 0);
  const totalHoras = workouts.reduce((sum, w) => sum + (w.duration ?? 0), 0) / 60;

  function formatVolume(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return String(v);
  }

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Perfil</h1>
          <div className="page-sub">Conta, preferências e estatísticas</div>
        </div>
      </div>

      <div className="grid-3">
        <div className="col-stack">
          {/* User card */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row gap-4" style={{ flexWrap: "wrap" }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div className="h-display" style={{ fontSize: 24 }}>{user?.name ?? "—"}</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{user?.email ?? "—"}</div>
                <div className="row gap-2" style={{ marginTop: 10 }}>
                  <span className="chip chip-accent">Plano Pro</span>
                  <span className="chip">12 dias streak 🔥</span>
                </div>
              </div>
              <div className="col gap-2" style={{ alignItems: "flex-end" }}>
                <div style={{ fontSize: 11, color: "var(--text-mute)" }}>Renovação em 12 dias</div>
                <button className="btn btn-secondary btn-sm">Gerenciar plano</button>
              </div>
            </div>

            <div style={{
              marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-soft)",
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24,
            }}>
              <div>
                <div className="h-eyebrow">Lifetime · Treinos</div>
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>{workouts.length}</div>
              </div>
              <div>
                <div className="h-eyebrow">Lifetime · Volume</div>
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>
                  {formatVolume(totalVolume)}<span className="stat-unit">kg</span>
                </div>
              </div>
              <div>
                <div className="h-eyebrow">Lifetime · Horas</div>
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>
                  {totalHoras > 0 ? Math.round(totalHoras) : "—"}<span className="stat-unit">{totalHoras > 0 ? "h" : ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings groups */}
          {([
            ["Conta", [["Dados pessoais", <Settings key="s" size={18} />], ["Objetivos", <Target key="t" size={18} />], ["Unidades (kg / cm)", <Trophy key="tr" size={18} />]]],
            ["Aplicativo", [["Tema", <Sparkles key="sp" size={18} />], ["Idioma", <Settings key="s2" size={18} />], ["Notificações", <Bell key="b" size={18} />]]],
          ] as [string, [string, React.ReactNode][]][]).map(([sec, items]) => (
            <div key={sec} className="card" style={{ padding: 0 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-soft)" }}>
                <div className="h-eyebrow">{sec}</div>
              </div>
              <div>
                {items.map(([label, icon], i) => (
                  <div key={label} className="row gap-3" style={{
                    padding: "14px 20px", cursor: "pointer",
                    borderBottom: i < items.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}>
                    <span style={{ color: "var(--text-dim)" }}>{icon}</span>
                    <div style={{ flex: 1, fontSize: 14 }}>{label}</div>
                    <ChevronRight size={16} color="var(--text-mute)" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn btn-danger btn-block"
            style={{ justifyContent: "flex-start", gap: 12, padding: "14px 20px" }}
            onClick={logout}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>

        {/* Right col */}
        <div className="col-stack">
          <div className="card card-accent">
            <Sparkles size={20} color="var(--accent)" />
            <div className="h-display" style={{ fontSize: 18, marginTop: 12, marginBottom: 6 }}>Convide amigos</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>
              Ganhe 1 mês Pro para cada amigo que assinar.
            </div>
            <button className="btn btn-primary btn-block btn-sm">Convidar</button>
          </div>

          <div className="card">
            <div className="h-eyebrow" style={{ marginBottom: 14 }}>Conquistas</div>
            <div className="col gap-3">
              {[
                { icon: <Flame size={16} color="var(--accent)" />, t: "12 dias streak", s: "Em andamento" },
                { icon: <Trophy size={16} color="var(--accent)" />, t: "Supino 1.5x peso", s: "Há 2 dias" },
                { icon: <Target size={16} color="var(--accent)" />, t: "100 treinos", s: "Há 1 mês" },
              ].map(a => (
                <div key={a.t} className="row gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{a.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
