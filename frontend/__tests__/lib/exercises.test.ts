import { describe, it, expect } from "vitest";
import { EXERCISE_CATALOG, MUSCLE_GROUPS, ALL_GROUPS, type MuscleGroup } from "@/lib/exercises";

describe("MUSCLE_GROUPS", () => {
  it("contém os 9 grupos musculares esperados", () => {
    expect(MUSCLE_GROUPS).toHaveLength(9);
    expect(MUSCLE_GROUPS).toContain("Peito");
    expect(MUSCLE_GROUPS).toContain("Costas");
    expect(MUSCLE_GROUPS).toContain("Pernas");
  });

  it("ALL_GROUPS tem os mesmos grupos que MUSCLE_GROUPS", () => {
    expect(ALL_GROUPS).toHaveLength(MUSCLE_GROUPS.length);
    MUSCLE_GROUPS.forEach(g => expect(ALL_GROUPS).toContain(g));
  });
});

describe("EXERCISE_CATALOG", () => {
  it("tem pelo menos 40 exercícios", () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(40);
  });

  it("todos os exercícios têm os campos obrigatórios preenchidos", () => {
    for (const ex of EXERCISE_CATALOG) {
      expect(ex.name, `Exercício sem nome`).toBeTruthy();
      expect(ex.muscle, `${ex.name} sem muscle`).toBeTruthy();
      expect(ex.group, `${ex.name} sem group`).toBeTruthy();
      expect(ex.defaultSets, `${ex.name} defaultSets inválido`).toBeGreaterThan(0);
      expect(ex.defaultReps, `${ex.name} defaultReps inválido`).toBeGreaterThan(0);
      expect(ex.defaultWeight, `${ex.name} defaultWeight inválido`).toBeGreaterThanOrEqual(0);
      expect(ex.defaultRest, `${ex.name} defaultRest inválido`).toBeGreaterThan(0);
      expect(ex.tips, `${ex.name} sem tips`).toBeTruthy();
    }
  });

  it("todos os grupos dos exercícios são grupos válidos", () => {
    const validGroups = new Set<string>(ALL_GROUPS);
    for (const ex of EXERCISE_CATALOG) {
      expect(validGroups.has(ex.group), `Grupo inválido: "${ex.group}" em "${ex.name}"`).toBe(true);
    }
  });

  it("não tem nomes duplicados", () => {
    const names = EXERCISE_CATALOG.map(e => e.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("cada grupo muscular tem pelo menos 3 exercícios", () => {
    for (const group of ALL_GROUPS) {
      const count = EXERCISE_CATALOG.filter(e => e.group === group).length;
      expect(count, `Grupo "${group}" tem poucos exercícios`).toBeGreaterThanOrEqual(3);
    }
  });

  it("exercícios de peso corporal têm defaultWeight igual a 0", () => {
    const bodyweight = EXERCISE_CATALOG.filter(e => e.defaultWeight === 0);
    expect(bodyweight.length).toBeGreaterThan(0);
    bodyweight.forEach(ex => {
      expect(ex.defaultWeight).toBe(0);
    });
  });

  it("filtra exercícios por grupo corretamente", () => {
    const peito = EXERCISE_CATALOG.filter(e => e.group === "Peito");
    expect(peito.length).toBeGreaterThan(0);
    peito.forEach(ex => expect(ex.group).toBe("Peito"));
  });
});
