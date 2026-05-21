"use client";

import { Plus, X } from "lucide-react";
import { ExerciseRow, SetRow, numInputStyle } from "@/lib/workout-shared";

interface Props {
  exercise: ExerciseRow;
  exerciseIndex: number;
  onUpdateSet: (exId: string, setIdx: number, field: keyof SetRow, value: number) => void;
  onAddSet: (exId: string) => void;
  onRemoveSet: (exId: string, setIdx: number) => void;
}

export default function SetsTable({ exercise, exerciseIndex, onUpdateSet, onAddSet, onRemoveSet }: Props) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: "var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)",
        }}>
          {String(exerciseIndex + 1).padStart(2, "0")}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{exercise.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{exercise.muscle}</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["Série", "Peso (kg)", "Reps", "Descanso (s)", ""].map(h => (
              <th key={h} style={{
                textAlign: h === "" ? "right" : "left",
                padding: "4px 6px", color: "var(--text-mute)",
                fontWeight: 600, fontSize: 10, letterSpacing: "0.06em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exercise.sets.map((s, i) => (
            <tr key={i}>
              <td style={{ padding: "4px 6px", color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>{i + 1}</td>
              <td style={{ padding: "4px 6px" }}>
                <input type="number" min={0} step={0.5} value={s.weight}
                  onChange={e => onUpdateSet(exercise.id, i, "weight", parseFloat(e.target.value) || 0)}
                  style={numInputStyle} />
              </td>
              <td style={{ padding: "4px 6px" }}>
                <input type="number" min={1} value={s.reps}
                  onChange={e => onUpdateSet(exercise.id, i, "reps", parseInt(e.target.value) || 1)}
                  style={numInputStyle} />
              </td>
              <td style={{ padding: "4px 6px" }}>
                <input type="number" min={0} step={15} value={s.rest}
                  onChange={e => onUpdateSet(exercise.id, i, "rest", parseInt(e.target.value) || 0)}
                  style={numInputStyle} />
              </td>
              <td style={{ padding: "4px 6px", textAlign: "right" }}>
                {exercise.sets.length > 1 && (
                  <button onClick={() => onRemoveSet(exercise.id, i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 2 }}>
                    <X size={12} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => onAddSet(exercise.id)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
        <Plus size={12} /> Adicionar série
      </button>
    </div>
  );
}
