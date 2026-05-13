"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, RefreshCw, Check } from "lucide-react";

type Message = { who: "ai" | "me"; text: string; chips?: string[] };

const INITIAL: Message[] = [
  {
    who: "ai",
    text: "Olá! Sou a IA do FitAI. Para montar seu treino ideal, preciso entender alguns pontos. Qual é seu nível?",
    chips: ["Iniciante", "Intermediário", "Avançado"],
  },
];

const FLOW: { q: string; chips: string[] }[] = [
  { q: "Perfeito. E qual seu objetivo principal?", chips: ["Hipertrofia", "Força", "Resistência", "Emagrecimento"] },
  { q: "Quantos dias por semana você pode treinar?", chips: ["3 dias", "4 dias", "5 dias", "6 dias"] },
  { q: "Tem acesso a equipamentos completos?", chips: ["Academia completa", "Halteres + barra", "Apenas peso corporal"] },
  { q: "Quanto tempo por sessão?", chips: ["30 min", "45 min", "60 min", "90 min"] },
];

export default function AiGenPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  function pick(answer: string) {
    const next: Message[] = [...messages, { who: "me", text: answer }];
    if (step < FLOW.length) {
      const f = FLOW[step];
      next.push({ who: "ai", text: f.q, chips: f.chips });
      setMessages(next);
      setStep(step + 1);
    } else {
      setMessages(next);
      setGenerating(true);
      setTimeout(() => { setGenerating(false); setDone(true); }, 2400);
    }
  }

  function reset() {
    setMessages(INITIAL);
    setStep(0);
    setDone(false);
    setGenerating(false);
  }

  return (
    <div className="anim-up" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="page-head">
        <div>
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <Sparkles size={16} color="var(--accent)" />
            <div className="h-eyebrow" style={{ color: "var(--accent)" }}>FitAI Assistant</div>
          </div>
          <h1 className="page-title">Gerador de treino</h1>
          <div className="page-sub">A IA monta um plano sob medida com base no seu objetivo</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, minHeight: 520, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
          <div className="col gap-4">
            {messages.map((m, i) => (
              <div key={i} className="anim-up">
                {m.who === "ai" ? (
                  <div className="row gap-3" style={{ alignItems: "flex-start" }}>
                    <div className="sidebar-brand-mark" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>F</div>
                    <div style={{ maxWidth: 480 }}>
                      <div style={{
                        background: "var(--surface-2)", padding: "14px 18px",
                        borderRadius: "4px 16px 16px 16px", fontSize: 14, lineHeight: 1.55,
                      }}>{m.text}</div>
                      {m.chips && i === messages.length - 1 && !done && !generating && (
                        <div className="row gap-2" style={{ flexWrap: "wrap", marginTop: 12 }}>
                          {m.chips.map(c => (
                            <button key={c} className="chip" style={{ height: 36, padding: "0 14px" }} onClick={() => pick(c)}>
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="row gap-3" style={{ alignItems: "flex-start", justifyContent: "flex-end" }}>
                    <div style={{
                      background: "var(--accent)", color: "#000",
                      padding: "14px 18px", borderRadius: "16px 4px 16px 16px",
                      fontSize: 14, fontWeight: 600,
                    }}>{m.text}</div>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>MS</div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {generating && (
              <div className="row gap-3 anim-up" style={{ alignItems: "flex-start" }}>
                <div className="sidebar-brand-mark" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>F</div>
                <div style={{ background: "var(--surface-2)", padding: "14px 18px", borderRadius: "4px 16px 16px 16px" }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="dot-anim" style={{
                        width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block",
                      }} />
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 13, color: "var(--text-dim)" }}>Montando seu treino</span>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {done && (
              <div className="anim-up">
                <div className="card card-accent" style={{ marginTop: 16 }}>
                  <div className="row gap-3" style={{ marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 11, background: "var(--accent)",
                      color: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={22} />
                    </div>
                    <div>
                      <div className="h-display" style={{ fontSize: 20 }}>Treino gerado!</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Push-Pull-Legs · 4 dias/semana · ~60 min</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
                    {["A — Peito & Tríceps", "B — Costas & Bíceps", "C — Pernas", "D — Ombros & Core"].map(d => (
                      <div key={d} style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>{d}</div>
                    ))}
                  </div>
                  <div className="row gap-2">
                    <Link href="/treinos" className="btn btn-primary flex-1" style={{ justifyContent: "center" }}>Ver treinos</Link>
                    <button className="btn btn-secondary" onClick={reset}>
                      <RefreshCw size={14} /> Gerar outro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        {!done && !generating && (
          <div style={{ padding: 20, borderTop: "1px solid var(--border-soft)" }}>
            <div className="row gap-3">
              <input className="input flex-1" placeholder="Digite sua resposta..." />
              <button className="btn btn-primary"><Send size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
