// Tipos, constantes e utilitários compartilhados entre NovoTreinoModal e EditarTreinoModal

import React from "react";

// ── Tipos base ────────────────────────────────────────────────────────────────

export interface SetRow {
  reps: number;
  weight: number;
  rest: number;
}

export interface ExerciseRow {
  id: string;
  name: string;
  muscle: string;
  group: string;
  sets: SetRow[];
  tips: string;
}

// SlotDef: um bloco do wizard de criação (ex: "Push", "Pull", "Legs")
export interface SlotDef {
  id: string;
  label: string;
  groups: string[];
  days: string[];
  tags: string[];
  exercises: ExerciseRow[];
}

// SplitDef: definição de um tipo de divisão de treino (PPL, ABC, etc.)
export interface SplitDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  slots: { label: string; groups: string[] }[];
}

// ── Constantes ────────────────────────────────────────────────────────────────

export const DAYS_OPTIONS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const TAGS_OPTIONS  = ["Força", "Hipertrofia", "Volume", "Acessório", "Resistência", "Funcional"];
export const ALL_GROUPS    = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdômen", "Panturrilha"];

export const SPLITS: SplitDef[] = [
  {
    id: "ppl", label: "Push / Pull / Legs", icon: "💪",
    description: "Clássico para hipertrofia. Empurrar, puxar e pernas em dias separados.",
    slots: [
      { label: "Push — Empurrar",  groups: ["Peito", "Ombros", "Tríceps"] },
      { label: "Pull — Puxar",     groups: ["Costas", "Bíceps"] },
      { label: "Legs — Pernas",    groups: ["Pernas", "Glúteos", "Panturrilha"] },
    ],
  },
  {
    id: "upper_lower", label: "Upper / Lower", icon: "⬆️",
    description: "Divide o corpo em superior e inferior. Ótimo para 4 dias por semana.",
    slots: [
      { label: "Upper — Superior", groups: ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"] },
      { label: "Lower — Inferior", groups: ["Pernas", "Glúteos", "Panturrilha"] },
    ],
  },
  {
    id: "abc", label: "ABC", icon: "🔄",
    description: "Três treinos rotativos. Cada músculo é treinado uma vez por semana.",
    slots: [
      { label: "Treino A — Peito & Tríceps", groups: ["Peito", "Tríceps"] },
      { label: "Treino B — Costas & Bíceps", groups: ["Costas", "Bíceps"] },
      { label: "Treino C — Pernas & Ombros", groups: ["Pernas", "Glúteos", "Ombros"] },
    ],
  },
  {
    id: "abcd", label: "ABCD", icon: "🏆",
    description: "Quatro treinos. Alta frequência com separação total por grupo muscular.",
    slots: [
      { label: "Treino A — Peito",           groups: ["Peito"] },
      { label: "Treino B — Costas",          groups: ["Costas"] },
      { label: "Treino C — Pernas",          groups: ["Pernas", "Glúteos"] },
      { label: "Treino D — Ombros & Braços", groups: ["Ombros", "Bíceps", "Tríceps"] },
    ],
  },
  {
    id: "fullbody", label: "Full Body", icon: "🌐",
    description: "Treino corpo inteiro em cada sessão. Ideal para iniciantes ou 3 dias por semana.",
    slots: [{ label: "Full Body", groups: ["Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps"] }],
  },
  {
    id: "custom", label: "Treino personalizado", icon: "✏️",
    description: "Monte do zero: escolha os grupos musculares de cada dia livremente.",
    slots: [],
  },
];

// ── Utilitários ───────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2);
}

export function makeSet(reps = 10, weight = 0, rest = 60): SetRow {
  return { reps, weight, rest };
}

export function codeFromLabel(label: string): string {
  return label
    .replace(/[^a-zA-ZÀ-ú\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildSlotsFromSplit(split: SplitDef): SlotDef[] {
  return split.slots.map(s => ({ id: uid(), label: s.label, groups: s.groups, days: [], tags: [], exercises: [] }));
}

// ── Estilos compartilhados ────────────────────────────────────────────────────

export const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "var(--text-mute)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 8,
};

export function chipToggleStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-soft)" : "var(--surface-2)",
    color: active ? "var(--accent)" : "var(--text-dim)",
    cursor: "pointer", transition: "all 0.15s",
  };
}

export const numInputStyle: React.CSSProperties = {
  width: 64, padding: "4px 8px", borderRadius: 7,
  background: "var(--surface)", border: "1px solid var(--border)",
  color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
  fontWeight: 600, outline: "none",
};
