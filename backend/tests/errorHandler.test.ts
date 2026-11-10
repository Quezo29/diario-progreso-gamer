import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { errorHandler } from "../src/middlewares/errorHandler";
import { ApiError } from "../src/apiError";
import { Meta } from "../src/modelos/Meta.model";

function crearRespuesta() {
  const respuesta = {
    statusCode: 200,
    cuerpo: undefined as unknown,
    status(codigo: number) {
      this.statusCode = codigo;
      return this;
    },
    json(cuerpo: unknown) {
      this.cuerpo = cuerpo;
      return this;
    },
  };
  return respuesta as unknown as Response & { statusCode: number; cuerpo: unknown };
}

function manejar(error: unknown) {
  const req = { id: "req-prueba" } as Request;
  const res = crearRespuesta();
  const next = vi.fn();
  errorHandler(error, req, res, next as never);
  return res;
}

describe("errorHandler centralizado", () => {
  it("BC-19: conserva el status de un ApiError 409", () => {
    const res = manejar(new ApiError(409, "El videojuego ya tiene una meta activa."));

    expect(res.statusCode).toBe(409);
    expect(res.cuerpo).toMatchObject({ error: "El videojuego ya tiene una meta activa.", requestId: "req-prueba" });
  });

  it("BC-19: un ValidationError de Mongoose responde 400", () => {
    const invalida = new Meta({ horasSemanales: 0, diasPorSemana: 4 });
    const error = invalida.validateSync();

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(manejar(error).statusCode).toBe(400);
  });

  it("BC-19: un CastError responde 400", () => {
    const res = manejar(new mongoose.Error.CastError("ObjectId", "abc", "_id"));
    expect(res.statusCode).toBe(400);
  });

  it("BC-19: un duplicado de índice único responde 409", () => {
    const error = Object.assign(new Error("E11000 duplicate key"), {
      code: 11000,
      keyPattern: { videojuego: 1 },
    });

    const res = manejar(error);

    expect(res.statusCode).toBe(409);
    expect(res.cuerpo).toMatchObject({
      error: "El videojuego ya tiene una meta activa. Desactívala antes de crear o activar otra.",
    });
  });

  it("BC-19: un error inesperado responde 500 sin filtrar el stack", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = manejar(new Error("secreto interno"));

    expect(res.statusCode).toBe(500);
    expect(res.cuerpo).toMatchObject({ error: "Error interno del servidor" });
    expect(JSON.stringify(res.cuerpo)).not.toContain("secreto interno");
    silencio.mockRestore();
  });
});
