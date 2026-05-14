"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Plus, Trash2, ChevronRight, ChevronLeft,
  Search, Info, Check, Dumbbell,
} from "lucide-react";
import { EXERCISE_CATALOG, ExerciseSuggestion } from "@/lib/exercises";
import { useWorkouts } from "@/hooks/useWorkouts";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────

interface SetRow {
  reps: number;
  weight: number;
  rest: number; // segundos de descanso após a série
}

interface ExerciseRow {
  id: string;
  name: string;
  muscle: string;
  group: string;
  sets: SetRow[];
  tips: string;
}

/**
 * Um "slot" representa um dia/bloco dentro do split.
 * Ex: no Push/Pull/Legs, existem 3 slots: Push, Pull, Legs.
 * Cada slot vira um Workout separado no backend.
 */
interface SlotDef {
  id: string;          // identificador único do slot
  label: string;       // nome exibido (ex: "Push", "Upper")
  groups: string[];    // grupos musculares predominantes deste slot
  days: string[];      // dias da semana escolhidos pelo utilizador
  tags: string[];      // tags do treino (Força, Hipertrofia…)
  exercises: ExerciseRow[];
}

/**
 * Definição de um tipo de split: nome, descrição e os slots pré-definidos.
 * Os grupos de cada slot pré-filtram o catálogo de exercícios para o utilizador.
 */
interface SplitDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  slots: { label: string; groups: string[] }[];
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de splits disponíveis
// ─────────────────────────────────────────────────────────────────────────────

const SPLITS: SplitDef[] = [
  {
    id: "ppl",
    label: "Push / Pull / Legs",
    description: "Clássico para hipertrofia. Empurrar, puxar e pernas em dias separados.",
    icon: "💪",
    slots: [
      { label: "Push — Empurrar",  groups: ["Peito", "Ombros", "Tríceps"] },
      { label: "Pull — Puxar",     groups: ["Costas", "Bíceps"] },
      { label: "Legs — Pernas",    groups: ["Pernas", "Glúteos", "Panturrilha"] },
    ],
  },
  {
    id: "upper_lower",
    label: "Upper / Lower",
    description: "Divide o corpo em superior e inferior. Ótimo para 4 dias por semana.",
    icon: "⬆️",
    slots: [
      { label: "Upper — Superior", groups: ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"] },
      { label: "Lower — Inferior", groups: ["Pernas", "Glúteos", "Panturrilha"] },
    ],
  },
  {
    id: "abc",
    label: "ABC",
    description: "Três treinos rotativos. Cada músculo é treinado uma vez por semana.",
    icon: "🔄",
    slots: [
      { label: "Treino A — Peito & Tríceps",   groups: ["Peito", "Tríceps"] },
      { label: "Treino B — Costas & Bíceps",   groups: ["Costas", "Bíceps"] },
      { label: "Treino C — Pernas & Ombros",   groups: ["Pernas", "Glúteos", "Ombros"] },
    ],
  },
  {
    id: "abcd",
    label: "ABCD",
    description: "Quatro treinos. Alta frequência com separação total por grupo muscular.",
    icon: "🏆",
    slots: [
      { label: "Treino A — Peito",    groups: ["Peito"] },
      { label: "Treino B — Costas",   groups: ["Costas"] },
      { label: "Treino C — Pernas",   groups: ["Pernas", "Glúteos"] },
      { label: "Treino D — Ombros & Braços", groups: ["Ombros", "Bíceps", "Tríceps"] },
    ],
  },
  {
    id: "fullbody",
    label: "Full Body",
    description: "Treino corpo inteiro em cada sessão. Ideal para iniciantes ou 3 dias por semana.",
    icon: "🌐",
    slots: [
      { label: "Full Body", groups: ["Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps"] },
    ],
  },
  {
    id: "custom",
    label: "Treino personalizado",
    description: "Monte do zero: escolha os grupos musculares de cada dia livremente.",
    icon: "✏️",
    slots: [], // slots são criados manualmente pelo utilizador
  },
];

const DAYS_OPTIONS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const TAGS_OPTIONS = ["Força", "Hipertrofia", "Volume", "Acessório", "Resistência", "Funcional"];
const ALL_GROUPS = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdômen", "Panturrilha"];

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function makeSet(reps = 10, weight = 0, rest = 60): SetRow {
  return { reps, weight, rest };
}

function codeFromLabel(label: string): string {
  // Gera código de 1–2 letras a partir do label (ex: "Push" → "PU", "Treino A" → "TA")
  return label
    .replace(/[^a-zA-ZÀ-ú\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");
}

function buildSlotsFromSplit(split: SplitDef): SlotDef[] {
  // Converte os slots estáticos da definição em slots editáveis com estado
  return split.slots.map(s => ({
    id: uid(),
    label: s.label,
    groups: s.groups,
    days: [],
    tags: [],
    exercises: [],
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function NovoTreinoModal({ onClose, onCreated }: Props) {
  const { createWorkout } = useWorkouts();

  /**
   * Passos do wizard:
   * 0 — escolha do split
   * 1 — configurar dias e tags de cada slot
   * 2 — adicionar exercícios a cada slot
   * 3 — revisão e salvar
   */
  const [step, setStep] = useState(0);

  // Split selecionado pelo utilizador
  const [selectedSplit, setSelectedSplit] = useState<SplitDef | null>(null);

  // Lista de slots (um por bloco do treino/dia)
  const [slots, setSlots] = useState<SlotDef[]>([]);

  // Slot ativo na etapa de exercícios (índice)
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);

  // Busca e grupo ativo no catálogo de exercícios
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("");

  // Tooltip de dica de execução
  const [tipFor, setTipFor] = useState<string | null>(null);

  // Estado de submissão
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // Foca a busca ao entrar na etapa de exercícios
  useEffect(() => {
    if (step === 2) searchRef.current?.focus();
  }, [step, activeSlotIdx]);

  // Fecha o modal com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Reseta o grupo ativo e a busca apenas quando o utilizador troca de slot.
  // Intencionalmente NÃO depende de `slots` para não resetar a seleção
  // toda vez que um exercício é adicionado (o que causava o bug de voltar ao 1.º grupo).
  useEffect(() => {
    const slot = slots[activeSlotIdx];
    if (slot) {
      setActiveGroup(slot.groups[0] ?? ALL_GROUPS[0]);
      setQuery("");
      setTipFor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlotIdx]);

  // ── Selecionar split ────────────────────────────────────────────────────────

  function selectSplit(split: SplitDef) {
    setSelectedSplit(split);
    if (split.id === "custom") {
      // Split personalizado: começa com 1 slot vazio para o utilizador configurar
      setSlots([{ id: uid(), label: "Treino A", groups: [], days: [], tags: [], exercises: [] }]);
    } else {
      setSlots(buildSlotsFromSplit(split));
    }
    setActiveSlotIdx(0);
    setStep(1);
  }

  // ── Gestão de slots (só para split personalizado) ───────────────────────────

  function addCustomSlot() {
    const letters = "ABCDEFGHIJ";
    const label = `Treino ${letters[slots.length] ?? slots.length + 1}`;
    setSlots(prev => [...prev, { id: uid(), label, groups: [], days: [], tags: [], exercises: [] }]);
  }

  function updateSlotLabel(slotId: string, label: string) {
    setSlots(prev => prev.map(s => s.id !== slotId ? s : { ...s, label }));
  }

  function toggleSlotGroup(slotId: string, group: string) {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      const has = s.groups.includes(group);
      return { ...s, groups: has ? s.groups.filter(g => g !== group) : [...s.groups, group] };
    }));
  }

  function toggleSlotDay(slotId: string, day: string) {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      const has = s.days.includes(day);
      return { ...s, days: has ? s.days.filter(d => d !== day) : [...s.days, day] };
    }));
  }

  function toggleSlotTag(slotId: string, tag: string) {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      const has = s.tags.includes(tag);
      return { ...s, tags: has ? s.tags.filter(t => t !== tag) : [...s.tags, tag] };
    }));
  }

  function removeSlot(slotId: string) {
    setSlots(prev => {
      const next = prev.filter(s => s.id !== slotId);
      setActiveSlotIdx(i => Math.min(i, next.length - 1));
      return next;
    });
  }

  /**
   * Duplica um slot existente inserindo-o logo após o original.
   * Numera automaticamente: "Upper" → "Upper 1" / "Upper 2",
   * ou "Push — Empurrar" → "Push — Empurrar 2".
   * Os exercícios NÃO são copiados — o utilizador preenche
   * variações diferentes (ex: Upper 1 foca peito, Upper 2 foca costas).
   */
  function duplicateSlot(slotId: string) {
    setSlots(prev => {
      const idx = prev.findIndex(s => s.id === slotId);
      if (idx === -1) return prev;
      const origin = prev[idx];

      // Conta quantas cópias deste slot já existem para numerar correctamente
      const baseName = origin.label.replace(/\s+\d+$/, ""); // remove número final se já existir
      const siblings = prev.filter(s => s.label.replace(/\s+\d+$/, "") === baseName);
      const copyNumber = siblings.length + 1;

      // Se ainda só há 1 com este nome, renomeia o original para "Nome 1"
      const needsRenameOriginal = siblings.length === 1;

      const newSlot: SlotDef = {
        id: uid(),
        label: `${baseName} ${copyNumber}`,
        groups: [...origin.groups], // mesmos grupos musculares
        days: [],                   // dias em branco — o utilizador escolhe
        tags: [...origin.tags],
        exercises: [],              // exercícios em branco — variação diferente
      };

      const next = [...prev];
      if (needsRenameOriginal) {
        next[idx] = { ...origin, label: `${baseName} 1` };
      }
      // Insere a cópia logo após o original
      next.splice(idx + 1, 0, newSlot);
      return next;
    });
  }

  // ── Gestão de exercícios dentro de um slot ──────────────────────────────────

  function addExercise(sug: ExerciseSuggestion) {
    const defaultSets: SetRow[] = Array.from({ length: sug.defaultSets }, () =>
      makeSet(sug.defaultReps, sug.defaultWeight, sug.defaultRest)
    );
    setSlots(prev => prev.map((s, i) => i !== activeSlotIdx ? s : {
      ...s,
      exercises: [
        ...s.exercises,
        { id: uid(), name: sug.name, muscle: sug.muscle, group: sug.group, sets: defaultSets, tips: sug.tips },
      ],
    }));
    setQuery("");
  }

  function addCustomExercise() {
    const name = query.trim();
    if (!name) return;
    const slot = slots[activeSlotIdx];
    setSlots(prev => prev.map((s, i) => i !== activeSlotIdx ? s : {
      ...s,
      exercises: [
        ...s.exercises,
        { id: uid(), name, muscle: activeGroup || slot.groups[0] || "Outros", group: activeGroup, sets: [makeSet()], tips: "" },
      ],
    }));
    setQuery("");
  }

  function removeExercise(exId: string) {
    setSlots(prev => prev.map((s, i) =>
      i !== activeSlotIdx ? s : { ...s, exercises: s.exercises.filter(e => e.id !== exId) }
    ));
  }

  function addSet(exId: string) {
    setSlots(prev => prev.map((s, i) => i !== activeSlotIdx ? s : {
      ...s,
      exercises: s.exercises.map(e => e.id !== exId ? e : {
        ...e,
        sets: [...e.sets, makeSet(e.sets.at(-1)?.reps ?? 10, e.sets.at(-1)?.weight ?? 0, e.sets.at(-1)?.rest ?? 60)],
      }),
    }));
  }

  function removeSet(exId: string, setIdx: number) {
    setSlots(prev => prev.map((s, i) => i !== activeSlotIdx ? s : {
      ...s,
      exercises: s.exercises.map(e =>
        e.id !== exId ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) }
      ),
    }));
  }

  function updateSet(exId: string, setIdx: number, field: keyof SetRow, value: number) {
    setSlots(prev => prev.map((s, i) => i !== activeSlotIdx ? s : {
      ...s,
      exercises: s.exercises.map(e =>
        e.id !== exId ? e : {
          ...e,
          sets: e.sets.map((set, j) => j !== setIdx ? set : { ...set, [field]: value }),
        }
      ),
    }));
  }

  // ── Submissão: cria um Workout por slot ─────────────────────────────────────

  async function handleSave() {
    // Valida que todo slot tem pelo menos 1 exercício
    const emptySlot = slots.find(s => s.exercises.length === 0);
    if (emptySlot) return setError(`Adicione exercícios ao "${emptySlot.label}".`);

    setError(null);
    setSaving(true);
    try {
      // Cria um Workout separado no backend para cada slot do split
      await Promise.all(slots.map(slot =>
        createWorkout({
          name: slot.label,
          code: codeFromLabel(slot.label),
          schedule: slot.days.join(", "),
          tags: slot.tags,
          exercises: slot.exercises.map(ex => ({
            name: ex.name,
            muscle: ex.muscle,
            restSeconds: ex.sets[0]?.rest ?? 60,
            sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, done: false, prev: 0 })),
          })),
        })
      ));
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar treinos.");
    } finally {
      setSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-renderizações
  // ─────────────────────────────────────────────────────────────────────────

  // Indicador de progresso no topo do modal
  function StepDots() {
    const labels = ["Split", "Dias", "Exercícios", "Revisão"];
    return (
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
        {labels.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: i <= step ? "var(--accent)" : "var(--surface-2)",
              border: `2px solid ${i === step ? "var(--accent)" : "var(--border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
              color: i <= step ? "#000" : "var(--text-mute)",
              transition: "all 0.2s",
            }}>
              {i < step ? <Check size={11} /> : i + 1}
            </div>
            <span style={{ fontSize: 11, color: i === step ? "var(--text)" : "var(--text-mute)" }}>{label}</span>
            {i < labels.length - 1 && <div style={{ width: 16, height: 1, background: "var(--border)" }} />}
          </div>
        ))}
      </div>
    );
  }

  // ── PASSO 0: Escolha do split ─────────────────────────────────────────────

  function renderStep0() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>
          Escolha como quer dividir os seus treinos na semana.
          Cada bloco vira um treino separado no seu plano.
        </p>
        {SPLITS.map(split => (
          <button
            key={split.id}
            onClick={() => selectSplit(split)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 16,
              padding: "16px 18px", borderRadius: 12, textAlign: "left",
              background: "var(--surface-2)",
              border: "1.5px solid var(--border-soft)",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-soft)")}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{split.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                {split.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
                {split.description}
              </div>
              {/* Pré-visualização dos slots do split */}
              {split.slots.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {split.slots.map(s => (
                    <span key={s.label} className="chip">
                      {s.label.split("—")[0].trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight size={18} color="var(--text-mute)" style={{ flexShrink: 0, marginTop: 2 }} />
          </button>
        ))}
      </div>
    );
  }

  // ── PASSO 1: Configurar dias e tags de cada slot ──────────────────────────

  function renderStep1() {
    const isCustom = selectedSplit?.id === "custom";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Associe cada bloco do treino aos dias da semana e ao tipo de estímulo.
        </p>

        {slots.map((slot, idx) => (
          <div key={slot.id} style={{
            padding: 20, borderRadius: 14,
            background: "var(--surface-2)",
            border: "1.5px solid var(--border-soft)",
          }}>
            {/* Cabeçalho do slot */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--accent-soft)", border: "1.5px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)", fontSize: 13,
              }}>
                {String.fromCharCode(65 + idx)} {/* A, B, C… */}
              </div>

              {/* Nome editável no split personalizado */}
              {isCustom ? (
                <input
                  className="input"
                  value={slot.label}
                  onChange={e => updateSlotLabel(slot.id, e.target.value)}
                  style={{ flex: 1, fontWeight: 700 }}
                  placeholder="Nome do treino"
                />
              ) : (
                <div style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{slot.label}</div>
              )}

              {/* Botão duplicar — disponível em todos os splits (não só personalizado).
                  Permite criar Upper 1 / Upper 2, Push A / Push B, etc. */}
              <button
                onClick={() => duplicateSlot(slot.id)}
                title="Duplicar este bloco (ex: Upper 1 / Upper 2)"
                style={{
                  background: "none", border: "1.5px solid var(--border)",
                  borderRadius: 7, cursor: "pointer", color: "var(--text-dim)",
                  padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-dim)";
                }}
              >
                <Plus size={12} /> Duplicar
              </button>

              {/* Remover slot — em qualquer split se houver mais de 1 bloco */}
              {slots.length > 1 && (
                <button onClick={() => removeSlot(slot.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Grupos musculares (só editável no personalizado) */}
            {isCustom && (
              <div style={{ marginBottom: 14 }}>
                <div style={labelStyle}>Grupos musculares</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ALL_GROUPS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleSlotGroup(slot.id, g)}
                      style={chipToggleStyle(slot.groups.includes(g))}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grupos musculares fixos (split pré-definido — só exibição) */}
            {!isCustom && (
              <div style={{ marginBottom: 14 }}>
                <div style={labelStyle}>Músculos trabalhados</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {slot.groups.map(g => (
                    <span key={g} className="chip chip-accent">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dias da semana */}
            <div style={{ marginBottom: 14 }}>
              <div style={labelStyle}>Dias da semana</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAYS_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleSlotDay(slot.id, d)}
                    style={chipToggleStyle(slot.days.includes(d))}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div style={labelStyle}>Tipo de estímulo</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TAGS_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleSlotTag(slot.id, t)}
                    style={chipToggleStyle(slot.tags.includes(t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Adicionar novo slot (só no split personalizado) */}
        {isCustom && (
          <button className="btn btn-secondary" onClick={addCustomSlot}>
            <Plus size={14} /> Adicionar bloco de treino
          </button>
        )}
      </div>
    );
  }

  // ── PASSO 2: Adicionar exercícios por slot ────────────────────────────────

  function renderStep2() {
    const slot = slots[activeSlotIdx];
    if (!slot) return null;

    // Grupos disponíveis para filtrar: os do slot + opção de ver todos
    const groupsForSlot = slot.groups.length > 0 ? slot.groups : ALL_GROUPS;

    // Exercícios sugeridos com base no grupo ativo e na busca
    const suggestions: ExerciseSuggestion[] = EXERCISE_CATALOG.filter(ex => {
      const matchGroup = ex.group === activeGroup || activeGroup === "__all__";
      const matchQuery = query.length < 2 || ex.name.toLowerCase().includes(query.toLowerCase());
      return matchGroup && matchQuery;
    });

    const alreadyAdded = new Set(slot.exercises.map(e => e.name));

    return (
      <div style={{ display: "flex", gap: 0, minHeight: 440 }}>

        {/* ── Painel esquerdo: abas dos slots ── */}
        <div style={{
          width: 180, flexShrink: 0,
          borderRight: "1px solid var(--border-soft)",
          paddingRight: 16, marginRight: 20,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={labelStyle}>Blocos do treino</div>
          {slots.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSlotIdx(i)}
              style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 9,
                background: i === activeSlotIdx ? "var(--accent-soft)" : "transparent",
                border: `1.5px solid ${i === activeSlotIdx ? "var(--accent)" : "transparent"}`,
                color: i === activeSlotIdx ? "var(--accent)" : "var(--text-dim)",
                fontWeight: i === activeSlotIdx ? 700 : 500,
                fontSize: 13, cursor: "pointer", transition: "all 0.12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Letra do bloco + nome */}
                <span>{String.fromCharCode(65 + i)} · {s.label.split("—")[0].trim()}</span>
                {/* Badge com número de exercícios */}
                {s.exercises.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: i === activeSlotIdx ? "var(--accent)" : "var(--surface-2)",
                    color: i === activeSlotIdx ? "#000" : "var(--text-mute)",
                    borderRadius: 99, padding: "1px 6px",
                  }}>
                    {s.exercises.length}
                  </span>
                )}
              </div>
              {/* Grupos musculares do slot como hint */}
              {s.groups.length > 0 && (
                <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: 3 }}>
                  {s.groups.slice(0, 3).join(" · ")}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ── Painel direito: catálogo + exercícios adicionados ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", maxHeight: 500 }}>

          {/* Nome do slot ativo */}
          <div>
            <div className="h-eyebrow">{slot.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
              {slot.groups.join(" · ")}
            </div>
          </div>

          {/* Busca */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", color: "var(--text-mute)", pointerEvents: "none",
            }} />
            <input
              ref={searchRef}
              className="input"
              placeholder="Buscar exercício..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Filtro por grupo muscular do slot */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {groupsForSlot.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                style={chipToggleStyle(activeGroup === g)}
              >
                {g}
              </button>
            ))}
            {/* Opção de ver todos os grupos (exercícios complementares) */}
            <button
              onClick={() => setActiveGroup("__all__")}
              style={chipToggleStyle(activeGroup === "__all__")}
            >
              Todos
            </button>
          </div>

          {/* Lista de sugestões do catálogo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={labelStyle}>
              {query.length >= 2 ? `Resultados para "${query}"` : `Sugestões — ${activeGroup === "__all__" ? "Todos" : activeGroup}`}
            </div>

            {suggestions.map(sug => {
              const added = alreadyAdded.has(sug.name);
              return (
                <div key={sug.name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10,
                  background: added ? "var(--accent-soft)" : "var(--surface-2)",
                  border: `1.5px solid ${added ? "var(--accent)" : "var(--border-soft)"}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: added ? "var(--accent)" : "var(--text)" }}>
                      {sug.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                      {sug.muscle} · {sug.defaultSets}×{sug.defaultReps}
                      {sug.defaultWeight > 0 ? ` · ${sug.defaultWeight}kg` : " · Peso corporal"}
                    </div>
                  </div>
                  {/* Botão de dica */}
                  <button
                    onClick={() => setTipFor(tipFor === sug.name ? null : sug.name)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 4 }}
                  >
                    <Info size={14} />
                  </button>
                  {/* Botão adicionar */}
                  <button
                    onClick={() => !added && addExercise(sug)}
                    disabled={added}
                    style={{
                      padding: "4px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                      background: added ? "var(--accent)" : "var(--surface)",
                      color: added ? "#000" : "var(--accent)",
                      border: `1.5px solid var(--accent)`,
                      cursor: added ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {added ? <><Check size={12} /> Adicionado</> : <><Plus size={12} /> Adicionar</>}
                  </button>
                </div>
              );
            })}

            {/* Dica de execução inline */}
            {tipFor && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.55,
                background: "var(--accent-soft)", border: "1.5px solid var(--accent)", color: "var(--accent)",
              }}>
                <strong>Dica:</strong> {EXERCISE_CATALOG.find(e => e.name === tipFor)?.tips}
              </div>
            )}

            {/* Adicionar exercício personalizado */}
            {query.trim().length >= 2 && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
              <button className="btn btn-secondary" onClick={addCustomExercise} style={{ marginTop: 4 }}>
                <Plus size={14} /> Adicionar &ldquo;{query.trim()}&rdquo; como exercício personalizado
              </button>
            )}
          </div>

          {/* Exercícios já adicionados neste slot */}
          {slot.exercises.length > 0 && (
            <div>
              <div style={{ ...labelStyle, marginTop: 8 }}>
                No treino — {slot.label.split("—")[0].trim()} ({slot.exercises.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {slot.exercises.map((ex, exIdx) => (
                  <div key={ex.id} style={{
                    padding: 14, borderRadius: 12,
                    background: "var(--surface-2)", border: "1.5px solid var(--border-soft)",
                  }}>
                    {/* Cabeçalho do exercício */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, background: "var(--surface)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)",
                      }}>
                        {String(exIdx + 1).padStart(2, "0")}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{ex.muscle}</div>
                      </div>
                      <button onClick={() => removeExercise(ex.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Tabela de séries: peso, reps, descanso */}
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
                        {ex.sets.map((s, i) => (
                          <tr key={i}>
                            <td style={{ padding: "4px 6px", color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>{i + 1}</td>
                            <td style={{ padding: "4px 6px" }}>
                              <input type="number" min={0} step={0.5} value={s.weight}
                                onChange={e => updateSet(ex.id, i, "weight", parseFloat(e.target.value) || 0)}
                                style={numInputStyle} />
                            </td>
                            <td style={{ padding: "4px 6px" }}>
                              <input type="number" min={1} value={s.reps}
                                onChange={e => updateSet(ex.id, i, "reps", parseInt(e.target.value) || 1)}
                                style={numInputStyle} />
                            </td>
                            <td style={{ padding: "4px 6px" }}>
                              <input type="number" min={0} step={15} value={s.rest}
                                onChange={e => updateSet(ex.id, i, "rest", parseInt(e.target.value) || 0)}
                                style={numInputStyle} />
                            </td>
                            <td style={{ padding: "4px 6px", textAlign: "right" }}>
                              {ex.sets.length > 1 && (
                                <button onClick={() => removeSet(ex.id, i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 2 }}>
                                  <X size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button onClick={() => addSet(ex.id)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
                      <Plus size={12} /> Adicionar série
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio: nenhum exercício ainda */}
          {slot.exercises.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-mute)" }}>
              <Dumbbell size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>Adicione exercícios acima para este bloco.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PASSO 3: Revisão completa do split ───────────────────────────────────

  function renderStep3() {
    const totalExercises = slots.reduce((s, slot) => s + slot.exercises.length, 0);
    const totalSets = slots.reduce((s, slot) =>
      s + slot.exercises.reduce((ss, ex) => ss + ex.sets.length, 0), 0);
    const totalVol = slots.reduce((s, slot) =>
      s + slot.exercises.reduce((ss, ex) =>
        ss + ex.sets.reduce((sss, set) => sss + set.weight * set.reps, 0), 0), 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Resumo geral do split */}
        <div style={{
          padding: 20, borderRadius: 14,
          background: "var(--accent-soft)", border: "1.5px solid var(--accent)",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {selectedSplit?.label}
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
            {[
              [slots.length, "blocos"],
              [totalExercises, "exercícios"],
              [totalSets, "séries"],
              [totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}k` : "–", "kg vol"],
            ].map(([v, l]) => (
              <div key={String(l)}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Um card por slot com os exercícios e séries */}
        {slots.map((slot, i) => {
          const slotVol = slot.exercises.reduce((s, ex) =>
            s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0), 0);
          const slotSets = slot.exercises.reduce((s, ex) => s + ex.sets.length, 0);
          return (
            <div key={slot.id} style={{
              padding: 18, borderRadius: 14,
              background: "var(--surface-2)", border: "1.5px solid var(--border-soft)",
            }}>
              {/* Cabeçalho do slot */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "var(--surface)", border: "1.5px solid var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)",
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{slot.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
                    {slot.days.length > 0 ? slot.days.join(" · ") : "Sem dia definido"}
                    {" · "}{slot.exercises.length} exerc. · {slotSets} séries
                    {slotVol > 0 ? ` · ${(slotVol / 1000).toFixed(1)}k kg` : ""}
                  </div>
                </div>
                {/* Tags do slot */}
                {slot.tags.map(t => <span key={t} className="chip chip-accent">{t}</span>)}
              </div>

              {/* Exercícios e séries em formato compacto */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slot.exercises.map((ex, ei) => (
                  <div key={ex.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", fontWeight: 700, marginTop: 2, width: 20 }}>
                      {String(ei + 1).padStart(2, "0")}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {ex.sets.map((s, si) => (
                          <span key={si} style={{
                            padding: "3px 8px", borderRadius: 6,
                            background: "var(--surface)",
                            fontSize: 11, fontFamily: "var(--font-mono)",
                            color: "var(--text-dim)",
                            border: "1px solid var(--border-soft)",
                          }}>
                            {s.weight > 0 ? `${s.weight}kg` : "PC"} × {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {error && <p style={{ fontSize: 13, color: "var(--danger)", textAlign: "center" }}>{error}</p>}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render principal do modal
  // ─────────────────────────────────────────────────────────────────────────

  // Modal mais largo nas etapas de exercícios
  const isWide = step === 2;

  const stepTitles = [
    "Escolha o tipo de divisão",
    "Configure os dias e estímulos",
    "Adicione os exercícios",
    "Confirme o seu plano",
  ];
  const stepSubs = [
    "Cada bloco vira um treino separado.",
    "Defina quando e como treinar cada bloco.",
    `${slots.reduce((s, sl) => s + sl.exercises.length, 0)} exercício${slots.reduce((s, sl) => s + sl.exercises.length, 0) !== 1 ? "s" : ""} adicionado${slots.reduce((s, sl) => s + sl.exercises.length, 0) !== 1 ? "s" : ""}`,
    `${slots.length} bloco${slots.length !== 1 ? "s" : ""} prontos para salvar.`,
  ];

  return (
    <>
      {/* Overlay com blur */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1000,
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: isWide ? "min(960px, 96vw)" : "min(560px, 96vw)",
        maxHeight: "90vh",
        background: "var(--bg)", border: "1.5px solid var(--border)",
        borderRadius: 18, boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        zIndex: 1001, display: "flex", flexDirection: "column",
        overflow: "hidden", transition: "width 0.3s ease",
      }}>

        {/* Cabeçalho */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border-soft)", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
              {stepTitles[step]}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>
              {stepSubs[step]}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mute)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo com scroll */}
        <div style={{ padding: "24px 24px 0", overflowY: "auto", flex: 1 }}>
          {step > 0 && <StepDots />}
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Rodapé com navegação */}
        {step > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 24px", borderTop: "1px solid var(--border-soft)", flexShrink: 0, gap: 12,
          }}>
            <button className="btn btn-ghost" onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}>
              <ChevronLeft size={16} /> Voltar
            </button>

            {step < 3 ? (
              <button
                className="btn btn-primary"
                // No passo 2, só avança se todos os slots têm pelo menos 1 exercício
                disabled={step === 2 && slots.some(s => s.exercises.length === 0)}
                onClick={() => setStep(step + 1)}
                title={step === 2 && slots.some(s => s.exercises.length === 0)
                  ? "Adicione exercícios a todos os blocos antes de continuar"
                  : undefined}
              >
                {step === 2 ? "Revisar plano" : "Próximo"} <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : `Criar ${slots.length} treino${slots.length !== 1 ? "s" : ""} ✓`}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos utilitários reutilizáveis
// ─────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "var(--text-mute)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 8,
};

// Chip clicável que alterna entre ativo/inativo
function chipToggleStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-soft)" : "var(--surface-2)",
    color: active ? "var(--accent)" : "var(--text-dim)",
    cursor: "pointer", transition: "all 0.15s",
  };
}

const numInputStyle: React.CSSProperties = {
  width: 64, padding: "4px 8px", borderRadius: 7,
  background: "var(--surface)", border: "1px solid var(--border)",
  color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
  fontWeight: 600, outline: "none",
};
