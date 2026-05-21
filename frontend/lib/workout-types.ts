// Tipos, constantes e utilitários compartilhados entre NovoTreinoModal e EditarTreinoModal

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

export const DAYS_OPTIONS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const TAGS_OPTIONS  = ["Força", "Hipertrofia", "Volume", "Acessório", "Resistência", "Funcional"];

export function uid(): string {
  return Math.random().toString(36).slice(2);
}

export function makeSet(reps = 10, weight = 0, rest = 60): SetRow {
  return { reps, weight, rest };
}

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
