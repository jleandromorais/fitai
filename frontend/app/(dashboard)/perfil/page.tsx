"use client";

import { Edit2, Bell, Settings, Flame, Trophy, Target, ChevronRight, LogOut, Sparkles } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Perfil</h1>
          <div className="page-sub">Conta, preferências e estatísticas</div>
        </div>
        <button className="btn btn-secondary"><Edit2 size={14} /> Editar perfil</button>
      </div>

      <div className="grid-3">
        <div className="col-stack">
          {/* User card */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row gap-4">
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>MS</div>
              <div style={{ flex: 1 }}>
                <div className="h-display" style={{ fontSize: 24 }}>Marina Silva</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>marina@fitai.app</div>
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
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>247</div>
              </div>
              <div>
                <div className="h-eyebrow">Lifetime · Volume</div>
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>3.8M<span className="stat-unit">kg</span></div>
              </div>
              <div>
                <div className="h-eyebrow">Lifetime · Horas</div>
                <div className="h-display" style={{ fontSize: 28, marginTop: 8 }}>248<span className="stat-unit">h</span></div>
              </div>
            </div>
          </div>

          {/* Settings groups */}
          {[
            ["Conta", [["Dados pessoais", <Settings size={18} />], ["Objetivos", <Target size={18} />], ["Unidades (kg / cm)", <Trophy size={18} />]]],
            ["Aplicativo", [["Tema", <Sparkles size={18} />], ["Idioma", <Settings size={18} />], ["Notificações", <Bell size={18} />]]],
          ].map(([sec, items]) => (
            <div key={sec as string} className="card" style={{ padding: 0 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-soft)" }}>
                <div className="h-eyebrow">{sec as string}</div>
              </div>
              <div>
                {(items as [string, React.ReactNode][]).map(([label, icon], i, arr) => (
                  <div key={label} className="row gap-3" style={{
                    padding: "14px 20px", cursor: "pointer",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}>
                    <span style={{ color: "var(--text-dim)" }}>{icon}</span>
                    <div style={{ flex: 1, fontSize: 14 }}>{label}</div>
                    <ChevronRight size={16} color="var(--text-mute)" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button className="btn btn-danger btn-block" style={{ justifyContent: "flex-start", gap: 12, padding: "14px 20px" }}>
            <LogOut size={16} /> Sair da conta
          </button>
        </div>

        {/* Right col */}
        <div className="col-stack">
          {/* Invite */}
          <div className="card card-accent">
            <Sparkles size={20} color="var(--accent)" />
            <div className="h-display" style={{ fontSize: 18, marginTop: 12, marginBottom: 6 }}>Convide amigos</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>
              Ganhe 1 mês Pro para cada amigo que assinar.
            </div>
            <button className="btn btn-primary btn-block btn-sm">Convidar</button>
          </div>

          {/* Conquistas */}
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
