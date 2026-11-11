import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { Meta } from "../src/modelos/Meta.model";

function crearMeta(cambios: Record<string, unknown> = {}) {
  return new Meta({
    videojuego: new mongoose.Types.ObjectId(),
    horasSemanales: 5,
    diasPorSemana: 4,
    hitos: [{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }],
    ...cambios,
  });
}

function errorDeValidacion(cambios: Record<string, unknown>) {
  return crearMeta(cambios).validateSync();
}

describe("modelo Meta", () => {
  it("BC-01: acepta una meta válida y activa por defecto", () => {
    const meta = crearMeta();

    expect(meta.validateSync()).toBeUndefined();
    expect(meta.activa).toBe(true);
    expect(meta.hitos).toHaveLength(1);
  });

  it("BC-01: exige un videojuego", () => {
    const error = errorDeValidacion({ videojuego: undefined });

    expect(error?.errors.videojuego).toBeDefined();
  });

  it("BC-01: horas mayores que 0 y máximo 100", () => {
    expect(errorDeValidacion({ horasSemanales: 0 })?.errors.horasSemanales).toBeDefined();
    expect(errorDeValidacion({ horasSemanales: -1 })?.errors.horasSemanales).toBeDefined();
    expect(errorDeValidacion({ horasSemanales: 100.1 })?.errors.horasSemanales).toBeDefined();
    expect(errorDeValidacion({ horasSemanales: 100 })).toBeUndefined();
    expect(errorDeValidacion({ horasSemanales: 0.5 })).toBeUndefined();
  });

  it("BC-01: días por semana enteros entre 1 y 7", () => {
    expect(errorDeValidacion({ diasPorSemana: 0 })?.errors.diasPorSemana).toBeDefined();
    expect(errorDeValidacion({ diasPorSemana: 8 })?.errors.diasPorSemana).toBeDefined();
    expect(errorDeValidacion({ diasPorSemana: 2.5 })?.errors.diasPorSemana).toBeDefined();
    expect(errorDeValidacion({ diasPorSemana: 1 })).toBeUndefined();
    expect(errorDeValidacion({ diasPorSemana: 7 })).toBeUndefined();
  });

  it("BC-02: acepta hasta 5 hitos y rechaza el sexto", () => {
    const cinco = Array.from({ length: 5 }, (_, i) => ({
      descripcion: `Hito ${i + 1}`,
      porcentajeObjetivo: (i + 1) * 20,
    }));
    const seis = [...cinco, { descripcion: "Hito 6", porcentajeObjetivo: 100 }];

    expect(errorDeValidacion({ hitos: cinco })).toBeUndefined();
    expect(errorDeValidacion({ hitos: seis })?.errors.hitos).toBeDefined();
  });

  it("BC-01: cada hito tiene descripción y objetivo entre 1 y 100", () => {
    expect(
      errorDeValidacion({ hitos: [{ descripcion: "", porcentajeObjetivo: 50 }] })?.errors["hitos.0.descripcion"]
    ).toBeDefined();
    expect(
      errorDeValidacion({ hitos: [{ descripcion: "Hito", porcentajeObjetivo: 0 }] })?.errors["hitos.0.porcentajeObjetivo"]
    ).toBeDefined();
    expect(
      errorDeValidacion({ hitos: [{ descripcion: "Hito", porcentajeObjetivo: 101 }] })?.errors[
        "hitos.0.porcentajeObjetivo"
      ]
    ).toBeDefined();
    expect(
      errorDeValidacion({ hitos: [{ descripcion: "Hito", porcentajeObjetivo: 25.5 }] })
    ).toBeUndefined();
  });

  it("BC-01: una meta sin hitos es válida", () => {
    expect(errorDeValidacion({ hitos: [] })).toBeUndefined();
  });
});
